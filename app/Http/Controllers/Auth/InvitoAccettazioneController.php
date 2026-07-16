<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\InvitoEnte;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class InvitoAccettazioneController extends Controller
{
    public function show(int $invito): Response
    {
        $invitoEnte = InvitoEnte::findOrFail($invito);

        if ($invitoEnte->stato !== 'pending' || $invitoEnte->scaduto()) {
            return Inertia::render('Auth/AccettaInvito', [
                'nonValido' => true,
                'email'     => null,
                'actionUrl' => null,
            ]);
        }

        return Inertia::render('Auth/AccettaInvito', [
            'nonValido' => false,
            'email'     => $invitoEnte->email,
            'actionUrl' => url()->full(),
        ]);
    }

    public function store(Request $request, int $invito): RedirectResponse
    {
        $invitoEnte = InvitoEnte::findOrFail($invito);

        abort_if($invitoEnte->stato !== 'pending' || $invitoEnte->scaduto(), 410, 'Invito non più valido.');

        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'              => $data['name'],
            'email'             => $invitoEnte->email,
            'password'          => Hash::make($data['password']),
            'tipo_utente'       => $invitoEnte->invitatoDa->tipo_utente,
            'ente_titolare_id'  => $invitoEnte->invitato_da_id,
            'email_verified_at' => now(),
        ]);

        $invitoEnte->update(['stato' => 'accettato', 'accettato_da_id' => $user->id]);

        Auth::login($user);

        return redirect()->route('ente.dashboard')->with('success', 'Benvenuto! Il tuo account è stato creato.');
    }
}
