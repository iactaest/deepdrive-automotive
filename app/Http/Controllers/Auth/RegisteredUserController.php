<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'tipo_utente' => 'required|in:impresa,ente,associazione,professionista',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'tipo_utente' => $request->tipo_utente,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route($this->getDashboardRoute($user->tipo_utente));
    }

    /**
     * Get dashboard route based on user type
     */
    private function getDashboardRoute(string $tipoUtente): string
    {
        return match ($tipoUtente) {
            'impresa' => 'impresa.dashboard',
            'ente' => 'ente.dashboard',
            'associazione' => 'associazione.dashboard',
            'professionista' => 'professionista.dashboard',
            default => 'dashboard',
        };
    }
}