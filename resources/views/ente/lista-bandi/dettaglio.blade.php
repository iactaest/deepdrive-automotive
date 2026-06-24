@extends('layouts.app')

@section('title', 'Dettaglio Bando')

@section('content')
<div class="container mx-auto px-4 py-8">
    <!-- Back button -->
    <div class="mb-6">
        <a href="{{ route('lista.bandi') }}" class="text-blue-400 hover:text-blue-300 transition inline-flex items-center gap-2">
            ← Torna alla lista
        </a>
    </div>

    <!-- Bando -->
    <div class="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h1 class="text-2xl font-bold text-white mb-4">{{ $bando->titolo }}</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Colonna sinistra: Info Bando -->
            <div>
                <h3 class="text-sm font-semibold text-slate-400 mb-2">📋 Informazioni Generali</h3>
                <div class="space-y-2">
                    <p><span class="text-slate-400">Fonte:</span> <span class="text-white">{{ $bando->fonte ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Stato:</span> 
                        <span class="px-2 py-1 {{ $bando->stato == 'aperto' ? 'bg-green-500/20 text-green-400' : ($bando->stato == 'in_scadenza' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400') }} rounded-full text-xs">
                            {{ $bando->stato }}
                        </span>
                    </p>
                    <p><span class="text-slate-400">Categoria:</span> <span class="text-white">{{ $bando->categoria ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Livello:</span> <span class="text-white">{{ $bando->livello ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Regione:</span> <span class="text-white">{{ $bando->regione ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Provincia:</span> <span class="text-white">{{ $bando->provincia ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Comune:</span> <span class="text-white">{{ $bando->comune ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Target:</span> <span class="text-white">{{ $bando->target ?? 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Budget totale:</span> <span class="text-white">{{ $bando->budget_totale ? number_format($bando->budget_totale, 0, ',', '.') . ' €' : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Budget min:</span> <span class="text-white">{{ $bando->budget_min ? number_format($bando->budget_min, 0, ',', '.') . ' €' : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Budget max:</span> <span class="text-white">{{ $bando->budget_max ? number_format($bando->budget_max, 0, ',', '.') . ' €' : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Scadenza:</span> <span class="text-white">{{ $bando->scadenza ? \Carbon\Carbon::parse($bando->scadenza)->format('d/m/Y') : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Data pubblicazione:</span> <span class="text-white">{{ $bando->data_pubblicazione ? \Carbon\Carbon::parse($bando->data_pubblicazione)->format('d/m/Y') : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Data inizio:</span> <span class="text-white">{{ $bando->data_inizio ? \Carbon\Carbon::parse($bando->data_inizio)->format('d/m/Y') : 'N/A' }}</span></p>
                    <p><span class="text-slate-400">Codice esterno:</span> <span class="text-white">{{ $bando->codice_esterno ?? 'N/A' }}</span></p>
                </div>
                
                @if($bando->descrizione)
                <div class="mt-6">
                    <h3 class="text-sm font-semibold text-slate-400 mb-2">📝 Descrizione</h3>
                    <p class="text-white">{{ $bando->descrizione }}</p>
                </div>
                @endif
                
                @if($bando->url)
                <div class="mt-6">
                    <a href="{{ $bando->url }}" target="_blank" class="inline-block px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition">
                        🔗 Vai al bando originale
                    </a>
                </div>
                @endif
            </div>
            
            <!-- Colonna destra: Match -->
            <div>
                @if($match)
                <div class="bg-slate-900/50 rounded-xl p-4 border border-blue-500/20">
                    <h3 class="text-sm font-semibold text-slate-400 mb-2">🎯 Match con il tuo profilo</h3>
                    
                    <div class="text-5xl font-bold {{ $match->punteggio_compatibilita >= 70 ? 'text-green-400' : ($match->punteggio_compatibilita >= 50 ? 'text-yellow-400' : 'text-red-400') }} mb-4">
                        {{ $match->punteggio_compatibilita }}%
                    </div>
                    
                    <!-- Barra di progresso -->
                    <div class="w-full bg-slate-700 rounded-full h-2 mb-4">
                        <div class="h-2 rounded-full {{ $match->punteggio_compatibilita >= 70 ? 'bg-green-500' : ($match->punteggio_compatibilita >= 50 ? 'bg-yellow-500' : 'bg-red-500') }}" 
                             style="width: {{ $match->punteggio_compatibilita }}%">
                        </div>
                    </div>
                    
                    @if($match->punti_forza)
                        @php $forza = is_array($match->punti_forza) ? $match->punti_forza : json_decode($match->punti_forza, true); @endphp
                        @if(!empty($forza))
                            <div class="mt-4">
                                <h4 class="text-sm font-semibold text-green-400">✅ Punti di forza</h4>
                                <ul class="list-disc list-inside text-sm text-white space-y-1 mt-1">
                                    @foreach($forza as $punto)
                                        <li>{{ $punto }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    @endif
                    
                    @if($match->punti_debolezza)
                        @php $debolezza = is_array($match->punti_debolezza) ? $match->punti_debolezza : json_decode($match->punti_debolezza, true); @endphp
                        @if(!empty($debolezza))
                            <div class="mt-4">
                                <h4 class="text-sm font-semibold text-red-400">⚠️ Punti debolezza</h4>
                                <ul class="list-disc list-inside text-sm text-white space-y-1 mt-1">
                                    @foreach($debolezza as $punto)
                                        <li>{{ $punto }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    @endif
                    
                    @if($match->requisiti_mancanti)
                        @php $mancanti = is_array($match->requisiti_mancanti) ? $match->requisiti_mancanti : json_decode($match->requisiti_mancanti, true); @endphp
                        @if(!empty($mancanti))
                            <div class="mt-4">
                                <h4 class="text-sm font-semibold text-orange-400">🔴 Requisiti mancanti</h4>
                                <ul class="list-disc list-inside text-sm text-white space-y-1 mt-1">
                                    @foreach($mancanti as $req)
                                        <li>{{ $req }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    @endif
                    
                    <div class="mt-4 pt-4 border-t border-slate-700">
                        <p class="text-xs text-slate-400">
                            Calcolato il: {{ $match->calcolato_il ? \Carbon\Carbon::parse($match->calcolato_il)->format('d/m/Y H:i') : 'N/A' }}
                        </p>
                        <p class="text-xs text-slate-400">
                            Match obbligatori: {{ $match->match_obbligatori ? '✅ Sì' : '❌ No' }}
                        </p>
                    </div>
                </div>
                @else
                <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                    <h3 class="text-sm font-semibold text-slate-400 mb-2">🎯 Match con il tuo profilo</h3>
                    <p class="text-slate-400">⏳ Nessun match calcolato per questo bando.</p>
                    <p class="text-xs text-slate-500 mt-2">Esegui il comando <code class="bg-slate-700 px-1 py-0.5 rounded">php artisan bandi:calculate-matches</code> per calcolare i match.</p>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection