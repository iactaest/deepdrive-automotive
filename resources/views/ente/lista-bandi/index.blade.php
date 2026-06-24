@extends('layouts.app')

@section('title', 'Lista Bandi')

@section('content')
<div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-white">📋 Lista Bandi</h1>
        <p class="text-slate-400 mt-2">Visualizza tutti i bandi disponibili e il loro match con il tuo profilo</p>
    </div>

    <!-- Messaggio di errore se non c'è profilo -->
    @if(isset($errore))
    <div class="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-8 text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-yellow-400 mb-2">Profilo ente non trovato</h2>
        <p class="text-slate-300">{{ $errore }}</p>
        <a href="{{ route('ente.profilo.completa') }}" class="inline-block mt-4 px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition">
            ➕ Crea Profilo Ente
        </a>
    </div>
    @else

    <!-- Statistiche -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-white">{{ $stats['totale'] ?? 0 }}</div>
            <div class="text-sm text-slate-400">Totale Bandi</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-green-400">{{ $stats['aperti'] ?? 0 }}</div>
            <div class="text-sm text-slate-400">Bandi Aperti</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-blue-400">{{ $stats['match_alti'] ?? 0 }}</div>
            <div class="text-sm text-slate-400">Match Alto (>70%)</div>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div class="text-2xl font-bold text-yellow-400">{{ $stats['match_medi'] ?? 0 }}</div>
            <div class="text-sm text-slate-400">Match Medio (50-69%)</div>
        </div>
    </div>

    <!-- Filtri -->
    <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-8">
        <form method="GET" action="{{ route('lista.bandi') }}" class="flex flex-wrap gap-4">
            <div class="flex-1 min-w-[200px]">
                <input type="text" name="search" placeholder="Cerca per titolo..." 
                       value="{{ request('search') }}"
                       class="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500">
            </div>
            
            <div>
                <select name="categoria" class="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    <option value="">Tutte le categorie</option>
                    @foreach($categorie ?? [] as $categoria)
                        <option value="{{ $categoria }}" {{ request('categoria') == $categoria ? 'selected' : '' }}>
                            {{ $categoria }}
                        </option>
                    @endforeach
                </select>
            </div>
            
            <div>
                <select name="regione" class="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    <option value="">Tutte le regioni</option>
                    @foreach($regioni ?? [] as $regione)
                        <option value="{{ $regione }}" {{ request('regione') == $regione ? 'selected' : '' }}>
                            {{ $regione }}
                        </option>
                    @endforeach
                </select>
            </div>
            
            <div>
                <select name="stato" class="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white">
                    <option value="">Tutti gli stati</option>
                    <option value="aperto" {{ request('stato') == 'aperto' ? 'selected' : '' }}>Aperto</option>
                    <option value="in_scadenza" {{ request('stato') == 'in_scadenza' ? 'selected' : '' }}>In scadenza</option>
                    <option value="chiuso" {{ request('stato') == 'chiuso' ? 'selected' : '' }}>Chiuso</option>
                </select>
            </div>
            
            <button type="submit" class="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition">
                🔍 Filtra
            </button>
            
            <a href="{{ route('lista.bandi') }}" class="px-6 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition">
                ↻ Reset
            </a>
        </form>
    </div>

    <!-- Lista Bandi -->
    <div class="space-y-4">
        @forelse($bandi ?? [] as $item)
            @php
                $matchData = $bandiConMatch[$loop->index] ?? null;
                $bando = $item;
                $match = $matchData['match'] ?? null;
                $punteggio = $matchData['punteggio'] ?? 0;
                $puntiForza = $matchData['punti_forza'] ?? [];
                $puntiDebolezza = $matchData['punti_debolezza'] ?? [];
            @endphp
            
            <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all">
                <div class="flex flex-wrap items-start gap-4">
                    <!-- Match Score -->
                    <div class="flex-shrink-0 w-16 text-center">
                        <div class="text-2xl font-bold {{ $punteggio >= 70 ? 'text-green-400' : ($punteggio >= 50 ? 'text-yellow-400' : 'text-red-400') }}">
                            {{ $punteggio }}%
                        </div>
                        <div class="text-xs text-slate-400">Match</div>
                    </div>
                    
                    <!-- Contenuto -->
                    <div class="flex-1 min-w-[200px]">
                        <h2 class="text-lg font-semibold text-white">
                            <a href="{{ route('lista.bandi.dettaglio', $bando->id) }}" class="hover:text-blue-400 transition">
                                {{ $bando->titolo }}
                            </a>
                        </h2>
                        
                        <div class="flex flex-wrap gap-2 mt-2">
                            @if($bando->categoria)
                                <span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                    {{ $bando->categoria }}
                                </span>
                            @endif
                            @if($bando->regione)
                                <span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                    📍 {{ $bando->regione }}
                                </span>
                            @endif
                            @if($bando->scadenza)
                                <span class="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                    📅 {{ \Carbon\Carbon::parse($bando->scadenza)->format('d/m/Y') }}
                                </span>
                            @endif
                            @if($bando->budget_totale)
                                <span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    💰 {{ number_format($bando->budget_totale, 0, ',', '.') }} €
                                </span>
                            @endif
                            <span class="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                {{ $bando->fonte ?? 'Sconosciuta' }}
                            </span>
                            <span class="px-2 py-1 {{ $bando->stato == 'aperto' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400' }} text-xs rounded-full">
                                {{ $bando->stato }}
                            </span>
                        </div>
                        
                        <!-- Punti di forza e debolezza -->
                        @if($match)
                            <div class="mt-3 space-y-1">
                                @if(!empty($puntiForza))
                                    <div class="flex flex-wrap gap-1">
                                        @foreach($puntiForza as $punto)
                                            <span class="text-xs text-green-400">✅ {{ $punto }}</span>
                                        @endforeach
                                    </div>
                                @endif
                                
                                @if(!empty($puntiDebolezza))
                                    <div class="flex flex-wrap gap-1">
                                        @foreach($puntiDebolezza as $punto)
                                            <span class="text-xs text-red-400">⚠️ {{ $punto }}</span>
                                        @endforeach
                                    </div>
                                @endif
                            </div>
                        @else
                            <div class="mt-3 text-xs text-slate-500">
                                ⏳ Nessun match calcolato
                            </div>
                        @endif
                    </div>
                    
                    <!-- Azioni -->
                    <div class="flex-shrink-0">
                        <a href="{{ route('lista.bandi.dettaglio', $bando->id) }}" class="inline-block px-4 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-500 transition">
                            📖 Dettaglio
                        </a>
                    </div>
                </div>
            </div>
        @empty
            <div class="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50 text-center">
                <div class="text-4xl mb-4">📭</div>
                <h2 class="text-xl font-semibold text-white mb-2">Nessun bando trovato</h2>
                <p class="text-slate-400">Prova a modificare i filtri o a sincronizzare nuove fonti.</p>
            </div>
        @endforelse
    </div>

    <!-- Paginazione -->
    <div class="mt-8">
        {{ $bandi->links() ?? '' }}
    </div>

    @endif
</div>
@endsection