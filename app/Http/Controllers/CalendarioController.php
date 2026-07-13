<?php

namespace App\Http\Controllers;

use App\Models\CalendarioEvento;
use App\Models\CalendarioTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CalendarioController extends Controller
{
    public function index()
    {
        return Inertia::render('Ente/Calendario/Index');
    }

    /**
     * Elenco eventi dell'utente in formato compatibile FullCalendar. La scadenza
     * è sempre quella "effettiva" (live dal bando per tipo=bando, salvata per tipo=manuale).
     */
    public function eventi()
    {
        $eventi = CalendarioEvento::where('user_id', Auth::id())
            ->with(['bando:id,titolo,scadenza,categoria,fonte', 'tasks'])
            ->get();

        $risultato = collect();

        foreach ($eventi as $evento) {
            $scadenza = $evento->scadenzaEffettiva();

            // Evento principale: rosso per i bandi (in sola lettura), blu per gli eventi manuali (trascinabili)
            $risultato->push([
                'id'       => "evento-{$evento->id}",
                'title'    => $evento->tipo === 'bando' ? $evento->bando?->titolo : $evento->titolo,
                'start'    => $scadenza?->toDateString(),
                'allDay'   => true,
                'editable' => $evento->tipo === 'manuale',
                'color'    => $evento->tipo === 'bando' ? '#ef4444' : '#3b82f6',
                'extendedProps' => [
                    'kind'              => 'evento',
                    'evento_id'         => $evento->id,
                    'tipo'              => $evento->tipo,
                    'bando_id'          => $evento->bando_id,
                    'bando_categoria'   => $evento->bando?->categoria,
                    'bando_fonte'       => $evento->bando?->fonte,
                    'descrizione'       => $evento->tipo === 'manuale' ? $evento->descrizione : $evento->bando?->descrizione,
                    'note'              => $evento->note,
                    'origine_preferito' => $evento->origine_preferito,
                    'origine_match'     => $evento->origine_match,
                    'task_totali'       => $evento->tasks->count(),
                    'task_completati'   => $evento->tasks->where('stato', 'completato')->count(),
                ],
            ]);

            // Un evento per ogni task con scadenza propria: arancio se ancora aperto, verde se completato
            foreach ($evento->tasks->whereNotNull('scadenza') as $task) {
                $risultato->push([
                    'id'       => "task-{$task->id}",
                    'title'    => '📋 ' . $task->titolo,
                    'start'    => $task->scadenza->toDateString(),
                    'allDay'   => true,
                    'editable' => false,
                    'color'    => $task->stato === 'completato' ? '#22c55e' : '#f97316',
                    'extendedProps' => [
                        'kind'      => 'task',
                        'evento_id' => $evento->id,
                        'task_id'   => $task->id,
                        'stato'     => $task->stato,
                    ],
                ]);
            }
        }

        return response()->json($risultato->values());
    }

    /**
     * Dettaglio di un evento (per il pannello laterale), con i task collegati.
     */
    public function show(int $id)
    {
        $evento = CalendarioEvento::where('user_id', Auth::id())
            ->with(['bando', 'tasks' => fn ($q) => $q->orderBy('created_at')])
            ->findOrFail($id);

        return response()->json([
            'evento' => array_merge($evento->toArray(), [
                'scadenza_effettiva' => $evento->scadenzaEffettiva()?->toDateString(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'titolo'        => 'required|string|max:255',
            'descrizione'   => 'nullable|string',
            'data_scadenza' => 'required|date',
        ]);

        $evento = CalendarioEvento::create([
            'user_id'       => Auth::id(),
            'tipo'          => 'manuale',
            'titolo'        => $data['titolo'],
            'descrizione'   => $data['descrizione'] ?? null,
            'data_scadenza' => $data['data_scadenza'],
        ]);

        return response()->json(['evento' => $evento]);
    }

    public function update(Request $request, int $id)
    {
        $evento = CalendarioEvento::where('user_id', Auth::id())->findOrFail($id);

        if ($evento->tipo !== 'manuale') {
            return response()->json(['error' => 'La scadenza di un evento bando non è modificabile.'], 422);
        }

        $data = $request->validate([
            'titolo'        => 'sometimes|required|string|max:255',
            'descrizione'   => 'nullable|string',
            'data_scadenza' => 'sometimes|required|date',
        ]);

        $evento->update($data);

        return response()->json(['evento' => $evento]);
    }

    public function salvaNota(Request $request, int $id)
    {
        $evento = CalendarioEvento::where('user_id', Auth::id())->findOrFail($id);

        $data = $request->validate(['note' => 'nullable|string|max:5000']);

        $evento->update(['note' => $data['note'] ?? null]);

        return response()->json(['evento' => $evento]);
    }

    public function destroy(int $id)
    {
        CalendarioEvento::where('user_id', Auth::id())->where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }

    public function taskStore(Request $request, int $eventoId)
    {
        $evento = CalendarioEvento::where('user_id', Auth::id())->findOrFail($eventoId);

        $data = $request->validate([
            'titolo'      => 'required|string|max:255',
            'descrizione' => 'nullable|string',
            'assegnato_a' => 'nullable|string|max:255',
            'priorita'    => 'required|in:bassa,media,alta',
            'scadenza'    => 'nullable|date',
        ]);

        $task = CalendarioTask::create(array_merge($data, [
            'calendario_evento_id' => $evento->id,
            'user_id'              => Auth::id(),
        ]));

        return response()->json(['task' => $task]);
    }

    public function taskUpdate(Request $request, int $taskId)
    {
        $task = CalendarioTask::where('user_id', Auth::id())->findOrFail($taskId);

        $data = $request->validate([
            'titolo'      => 'sometimes|required|string|max:255',
            'descrizione' => 'nullable|string',
            'assegnato_a' => 'nullable|string|max:255',
            'priorita'    => 'sometimes|required|in:bassa,media,alta',
            'scadenza'    => 'nullable|date',
        ]);

        $task->update($data);

        return response()->json(['task' => $task]);
    }

    public function taskCambiaStato(Request $request, int $taskId)
    {
        $task = CalendarioTask::where('user_id', Auth::id())->findOrFail($taskId);

        $data = $request->validate(['stato' => 'required|in:da_fare,in_corso,completato']);

        $task->update([
            'stato'         => $data['stato'],
            'completato_il' => $data['stato'] === 'completato' ? now() : null,
        ]);

        return response()->json(['task' => $task]);
    }

    public function taskDestroy(int $taskId)
    {
        CalendarioTask::where('user_id', Auth::id())->where('id', $taskId)->delete();

        return response()->json(['ok' => true]);
    }
}
