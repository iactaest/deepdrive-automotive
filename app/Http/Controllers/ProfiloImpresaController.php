<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfiloImpresaController extends Controller
{
    public function index()
    {
        return Inertia::render('Impresa/Profilo');
    }

    public function store(Request $request)
    {
        // TODO: Implementare salvataggio profilo impresa
        return redirect()->route('impresa.dashboard');
    }
}