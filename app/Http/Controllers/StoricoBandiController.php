<?php

namespace App\Http\Controllers;

use App\Models\BandiMatch;
use App\Models\BandoPerso;
use App\Models\ProfiloEnte;
use App\Models\Rendicontazione;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StoricoBandiController extends Controller
{
    public function index(Request $request)
    {
        $profiloUserId = Auth::user()->enteEffettivoUserId();
        $profilo = ProfiloEnte::where('user_id', $profiloUserId)->first();
        $gruppoIds = Auth::user()->gruppoEnteIds();

        $matches = $profilo
            ? BandiMatch::where('user_id', $profilo->user_id)->with('bando')->get()->filter(fn ($m) => $m->bando !== null)
            : collect();

        $totali  = $matches->count();
        $inCorso = $matches->filter(fn ($m) => in_array($m->bando->stato, ['aperto', 'in_scadenza']))->count();

        $vinti = Rendicontazione::whereIn('user_id', $gruppoIds)
            ->with('bando:id,titolo')
            ->get()
            ->unique('bando_id');

        $persi = BandoPerso::whereIn('user_id', $gruppoIds)
            ->with('bando:id,titolo')
            ->latest()
            ->get()
            ->unique('bando_id');

        $props = [
            'stats' => [
                'totali'   => $totali,
                'in_corso' => $inCorso,
                'vinti'    => $vinti->count(),
                'persi'    => $persi->count(),
            ],
            'bandiVinti' => $vinti->map(fn (Rendicontazione $r) => [
                'bando_id'          => $r->bando_id,
                'titolo'            => $r->bando?->titolo,
                'rendicontazione_id'=> $r->id,
            ])->values(),
            'bandiPersi' => $persi->map(fn (BandoPerso $p) => [
                'id'         => $p->id,
                'bando_id'   => $p->bando_id,
                'titolo'     => $p->bando?->titolo,
                'marcato_il' => $p->created_at->toDateString(),
            ])->values(),
        ];

        if ($request->boolean('embed')) {
            return response()->json($props);
        }

        return Inertia::render('Ente/StoricoBandi/Index', $props);
    }
}
