<?php

namespace App\Http\Controllers;

use App\Models\CalendarioEvento;
use App\Models\CalendarioTask;
use App\Models\Notifica;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CalendarioController extends Controller
{
    public function index()
    {
        return Inertia::render('Ente/Calendario/Index');
    }

    /**
     * Elenco eventi del gruppo ente (titolare + dipendenti invitati) in formato compatibile
     * FullCalendar. La scadenza è sempre quella "effettiva" (live dal bando per tipo=bando,
     * salvata per tipo=manuale).
     */
    public function eventi()
    {
        $eventi = CalendarioEvento::whereIn('user_id', Auth::user()->gruppoEnteIds())
            ->with(['bando:id,titolo,scadenza,categoria,fonte', 'tasks.assegnatoUtente:id,name'])
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
     * Dettaglio di un evento (per il pannello laterale), con i task collegati. Visibile a
     * chiunque appartenga al gruppo ente, non solo a chi l'ha creato.
     */
    public function show(int $id)
    {
        $evento = CalendarioEvento::whereIn('user_id', Auth::user()->gruppoEnteIds())
            ->with(['bando', 'tasks' => fn ($q) => $q->orderBy('created_at'), 'tasks.assegnatoUtente:id,name'])
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
            'user_id'       => Auth::id(), // creatore, non più confine di autorizzazione
            'tipo'          => 'manuale',
            'titolo'        => $data['titolo'],
            'descrizione'   => $data['descrizione'] ?? null,
            'data_scadenza' => $data['data_scadenza'],
        ]);

        return response()->json(['evento' => $evento]);
    }

    public function update(Request $request, int $id)
    {
        $evento = CalendarioEvento::whereIn('user_id', Auth::user()->gruppoEnteIds())->findOrFail($id);

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
        $evento = CalendarioEvento::whereIn('user_id', Auth::user()->gruppoEnteIds())->findOrFail($id);

        $data = $request->validate(['note' => 'nullable|string|max:5000']);

        $evento->update(['note' => $data['note'] ?? null]);

        return response()->json(['evento' => $evento]);
    }

    public function destroy(int $id)
    {
        CalendarioEvento::whereIn('user_id', Auth::user()->gruppoEnteIds())->where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * Membri del gruppo ente (titolare + dipendenti), per il dropdown di assegnazione task.
     */
    public function membri()
    {
        return response()->json(
            User::whereIn('id', Auth::user()->gruppoEnteIds())->select('id', 'name')->get()
        );
    }

    /**
     * Tutti i task del gruppo ente per la vista Kanban, con il titolo dell'evento/bando
     * associato come contesto e l'assegnatario reale.
     */
    public function task()
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();

        $task = CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->with(['evento.bando:id,titolo', 'assegnatoUtente:id,name'])
            ->orderBy('stato')
            ->orderBy('ordine')
            ->get()
            ->map(function (CalendarioTask $t) {
                $arr = $t->toArray();
                $arr['evento_titolo'] = $t->evento->tipo === 'bando' ? $t->evento->bando?->titolo : $t->evento->titolo;

                return $arr;
            });

        return response()->json($task);
    }

    public function taskRiordina(Request $request, int $taskId)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $task = CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->findOrFail($taskId);

        $data = $request->validate(['ordine' => 'required|integer']);

        $task->update(['ordine' => $data['ordine']]);

        return response()->json(['task' => $task]);
    }

    public function taskStore(Request $request, int $eventoId)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $evento = CalendarioEvento::whereIn('user_id', $gruppoIds)->findOrFail($eventoId);

        $data = $request->validate([
            'titolo'             => 'required|string|max:255',
            'descrizione'        => 'nullable|string',
            'assegnato_user_id'  => ['nullable', 'integer', Rule::in($gruppoIds)],
            'priorita'           => 'required|in:bassa,media,alta',
            'scadenza'           => 'nullable|date',
        ]);

        $task = CalendarioTask::create(array_merge($data, [
            'calendario_evento_id' => $evento->id,
            'user_id'              => Auth::id(),
        ]));

        if ($task->assegnato_user_id && $task->assegnato_user_id !== Auth::id()) {
            Notifica::taskAssegnato($task, $task->assegnato_user_id);
        }

        return response()->json(['task' => $task->load('assegnatoUtente:id,name')]);
    }

    public function taskUpdate(Request $request, int $taskId)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $task = CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->findOrFail($taskId);

        $data = $request->validate([
            'titolo'             => 'sometimes|required|string|max:255',
            'descrizione'        => 'nullable|string',
            'assegnato_user_id'  => ['nullable', 'integer', Rule::in($gruppoIds)],
            'priorita'           => 'sometimes|required|in:bassa,media,alta',
            'scadenza'           => 'nullable|date',
        ]);

        $assegnatoPrima = $task->assegnato_user_id;
        $task->update($data);

        if (
            array_key_exists('assegnato_user_id', $data)
            && $task->assegnato_user_id
            && $task->assegnato_user_id !== $assegnatoPrima
            && $task->assegnato_user_id !== Auth::id()
        ) {
            Notifica::taskAssegnato($task, $task->assegnato_user_id);
        }

        return response()->json(['task' => $task->load('assegnatoUtente:id,name')]);
    }

    public function taskCambiaStato(Request $request, int $taskId)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        $task = CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->findOrFail($taskId);

        $data = $request->validate(['stato' => 'required|in:da_fare,in_corso,completato']);

        $task->update([
            'stato'         => $data['stato'],
            'completato_il' => $data['stato'] === 'completato' ? now() : null,
        ]);

        return response()->json(['task' => $task]);
    }

    public function taskDestroy(int $taskId)
    {
        $gruppoIds = Auth::user()->gruppoEnteIds();
        CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->where('id', $taskId)
            ->delete();

        return response()->json(['ok' => true]);
    }
}
