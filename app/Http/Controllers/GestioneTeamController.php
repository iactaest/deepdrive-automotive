<?php

namespace App\Http\Controllers;

use App\Mail\InvitoEnteMail;
use App\Models\InvitoEnte;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class GestioneTeamController extends Controller
{
    public function index()
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

        return Inertia::render('Ente/GestioneTeam/Index', [
            'membri'      => $membri,
            'inviti'      => $inviti,
            'puoInvitare' => $user->isTitolare(),
        ]);
    }

    public function invita(Request $request)
    {
        $user = Auth::user();
        abort_unless($user->isTitolare(), 403, 'Solo il titolare dell\'ente può invitare colleghi.');

        $data = $request->validate([
            'email' => 'required|email|unique:users,email',
        ]);

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
}
