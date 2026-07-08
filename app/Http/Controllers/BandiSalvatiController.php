<?php

namespace App\Http\Controllers;

use App\Models\BandoPreferito;
use App\Models\BandiMatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BandiSalvatiController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        $preferiti = BandoPreferito::where('user_id', $userId)
            ->with('bando')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $punteggi = BandiMatch::where('user_id', $userId)
            ->whereIn('bando_id', $preferiti->pluck('bando_id'))
            ->pluck('punteggio_compatibilita', 'bando_id');

        $preferiti->setCollection(
            $preferiti->getCollection()->map(fn ($p) => [
                'preferito_id'    => $p->id,
                'id'              => $p->bando->id,
                'titolo'          => $p->bando->titolo,
                'categoria'       => $p->bando->categoria,
                'regione'         => $p->bando->regione,
                'budget_totale'   => $p->bando->budget_totale,
                'scadenza'        => $p->bando->scadenza,
                'stato'           => $p->bando->stato,
                'match_punteggio' => $punteggi[$p->bando->id] ?? null,
                'salvato_il'      => $p->created_at->toDateString(),
            ])
        );

        return Inertia::render('Ente/BandiSalvati/Index', [
            'preferiti' => $preferiti,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate(['bando_id' => 'required|exists:bandi_importati,id']);

        BandoPreferito::firstOrCreate([
            'user_id'  => Auth::id(),
            'bando_id' => $request->bando_id,
        ]);

        return back();
    }

    public function destroy(int $bandoId)
    {
        BandoPreferito::where('user_id', Auth::id())->where('bando_id', $bandoId)->delete();

        return back();
    }
}
