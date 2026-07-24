<?php

namespace App\Http\Controllers;

use App\Mail\InvitoEnteMail;
use App\Models\InvitoEnte;
use App\Models\ProfiloEnte;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class GestioneTeamController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $titolareId = $user->ente_titolare_id ?? $user->id;

        $membri = User::where('id', $titolareId)
            ->orWhere('ente_titolare_id', $titolareId)
            ->orderBy('created_at')
            ->get(['id', 'name', 'email', 'ente_titolare_id'])
            ->map(fn (User $u) => [
                'id'    => $u->id,
                'name'  => $u->name,
                'email' => $u->email,
                'ruolo' => is_null($u->ente_titolare_id) ? 'Titolare' : 'Dipendente',
            ]);

        $inviti = $user->isTitolare()
            ? InvitoEnte::where('invitato_da_id', $user->id)->latest()->get()->map(fn (InvitoEnte $i) => [
                'id'     => $i->id,
                'email'  => $i->email,
                'stato'  => $i->scaduto() ? 'scaduto' : $i->stato,
                'inviato_il' => $i->created_at->toDateString(),
            ])
            : collect();

        $props = [
            'membri'      => $membri,
            'inviti'      => $inviti,
            'puoInvitare' => $user->isTitolare(),
        ];

        if ($request->boolean('embed')) {
            return response()->json($props);
        }

        return Inertia::render('Ente/GestioneTeam/Index', $props);
    }

    public function invita(Request $request)
    {
        $user = Auth::user();
        abort_unless($user->isTitolare(), 403, 'Solo il titolare dell\'ente può invitare colleghi.');

        $data = $request->validate(['email' => 'required|email']);

        $esistente = User::where('email', $data['email'])->first();

        if ($esistente) {
            // Un account con questa email esiste già: se è un ex-membro di QUESTO ente
            // (scollegato via "Rimuovi dal team", non un titolare con un proprio ente)
            // lo riattiviamo direttamente invece di bloccare con "email già in uso" —
            // l'account e la password restano quelli originali, nessun nuovo invito.
            $haProfiloProprio = ProfiloEnte::where('user_id', $esistente->id)->exists();
            $appartieneAdAltroEnte = $esistente->ente_titolare_id && $esistente->ente_titolare_id !== $user->id;

            if ($esistente->id === $user->id || $haProfiloProprio || $appartieneAdAltroEnte) {
                throw ValidationException::withMessages(['email' => 'Questa email appartiene già a un altro account.']);
            }

            if ($esistente->ente_titolare_id === $user->id) {
                return back()->with('success', $esistente->name . ' fa già parte del team.');
            }

            $esistente->update(['ente_titolare_id' => $user->id]);

            return back()->with('success', $esistente->name . ' è stato riaggiunto al team.');
        }

        InvitoEnte::where('invitato_da_id', $user->id)
            ->where('email', $data['email'])
            ->where('stato', 'pending')
            ->update(['stato' => 'scaduto']);

        $invito = InvitoEnte::create([
            'invitato_da_id' => $user->id,
            'email'          => $data['email'],
            'stato'          => 'pending',
            'scade_il'       => now()->addDays(7),
        ]);

        $url = URL::temporarySignedRoute('inviti.accetta', now()->addDays(7), ['invito' => $invito->id]);

        Mail::to($invito->email)->send(new InvitoEnteMail($invito, $url));

        return back()->with('success', 'Invito inviato a ' . $invito->email);
    }

    public function revoca(int $invitoId)
    {
        InvitoEnte::where('invitato_da_id', Auth::id())
            ->where('id', $invitoId)
            ->where('stato', 'pending')
            ->update(['stato' => 'revocato']);

        return back();
    }

    /**
     * Rimuove un dipendente dal team, scollegandolo dall'ente (ente_titolare_id = null)
     * invece di eliminarne l'account: un delete vero cancellerebbe a cascata anche gli
     * eventi/task che ha creato, condivisi col resto del team.
     */
    public function rimuoviMembro(int $userId)
    {
        $titolare = Auth::user();
        abort_unless($titolare->isTitolare(), 403, 'Solo il titolare dell\'ente può rimuovere membri dal team.');

        User::where('id', $userId)
            ->where('ente_titolare_id', $titolare->id)
            ->update(['ente_titolare_id' => null]);

        return back()->with('success', 'Membro rimosso dal team.');
    }
}
