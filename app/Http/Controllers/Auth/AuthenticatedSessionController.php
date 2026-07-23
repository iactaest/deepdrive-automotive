<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Reindirizza in base al tipo utente
        $user = Auth::user();
        
        return redirect()->route($this->getDashboardRoute($user->tipo_utente));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Get dashboard route based on user type
     */
    private function getDashboardRoute(string $tipoUtente): string
    {
        return match ($tipoUtente) {
            'impresa' => 'impresa.dashboard',
            // 'ente.dashboard' fa da hub: EnteController::index() rimbalza da solo
            // su 'ente.menu' (Dashboard_Mobile) se il dispositivo è mobile.
            'ente' => 'ente.dashboard',
            'associazione' => 'associazione.dashboard',
            'professionista' => 'professionista.dashboard',
            default => 'dashboard',
        };
    }
}