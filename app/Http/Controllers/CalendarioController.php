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
     *
     * Il titolare vede tutto il calendario condiviso. Un dipendente vede solo gli eventi che
     * ha creato lui o su cui ha almeno un task assegnato — non l'intero calendario del team.
     */
    public function eventi()
    {
        $user = Auth::user();

        $eventi = CalendarioEvento::whereIn('user_id', $user->gruppoEnteIds())
            ->with(['bando:id,titolo,scadenza,categoria,fonte', 'tasks.assegnatoUtente:id,name'])
            ->get();

        if (!$user->isTitolare()) {
            $eventi = $eventi->filter(
                fn (CalendarioEvento $e) => $e->user_id === $user->id
                    || $e->tasks->contains('assegnato_user_id', $user->id)
            );
        }

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

            // Un evento per ogni task con scadenza propria: arancio se ancora aperto, verde se completato.
            // Un dipendente vede solo i propri task, il titolare li vede tutti.
            $taskConScadenza = $evento->tasks->whereNotNull('scadenza');
            if (!$user->isTitolare()) {
                $taskConScadenza = $taskConScadenza->where('assegnato_user_id', $user->id);
            }
            foreach ($taskConScadenza as $task) {
                $progresso = match ($task->stato) {
                    'da_fare'    => 0,
                    'in_corso'   => 50,
                    'completato' => 100,
                };

                $risultato->push([
                    'id'       => "task-{$task->id}",
                    'title'    => $task->titolo,
                    'start'    => $task->scadenza->toDateString(),
                    'allDay'   => true,
                    'editable' => false,
                    'color'    => $task->stato === 'completato' ? '#22c55e' : '#f97316',
                    'extendedProps' => [
                        'kind'           => 'task',
                        'evento_id'      => $evento->id,
                        'task_id'        => $task->id,
                        'stato'          => $task->stato,
                        'assegnato_nome' => $task->assegnatoUtente?->name,
                        'progresso'      => $progresso,
                    ],
                ]);
            }
        }

        return response()->json($risultato->values());
    }

    /**
     * Dettaglio di un evento (per il pannello laterale), con i task collegati. Il titolare
     * vede tutto; un dipendente può aprire solo eventi che ha creato o su cui ha un task
     * assegnato, e in quel caso vede solo i propri task, non quelli di tutto il team.
     */
    public function show(int $id)
    {
        $user = Auth::user();

        $evento = CalendarioEvento::whereIn('user_id', $user->gruppoEnteIds())
            ->with(['bando', 'tasks' => fn ($q) => $q->orderBy('created_at'), 'tasks.assegnatoUtente:id,name'])
            ->findOrFail($id);

        if (!$user->isTitolare()) {
            $haAccesso = $evento->user_id === $user->id || $evento->tasks->contains('assegnato_user_id', $user->id);
            abort_unless($haAccesso, 403);

            $evento->setRelation('tasks', $evento->tasks->where('assegnato_user_id', $user->id)->values());
        }

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
     * Task per la vista Kanban, con il titolo dell'evento/bando associato come contesto e
     * l'assegnatario reale. Il titolare vede tutti i task del gruppo, un dipendente vede
     * solo quelli assegnati a lui.
     */
    public function task()
    {
        $user = Auth::user();
        $gruppoIds = $user->gruppoEnteIds();

        $query = CalendarioTask::whereHas('evento', fn ($q) => $q->whereIn('user_id', $gruppoIds))
            ->with(['evento.bando:id,titolo', 'assegnatoUtente:id,name'])
            ->orderBy('stato')
            ->orderBy('ordine');

        if (!$user->isTitolare()) {
            $query->where('assegnato_user_id', $user->id);
        }

        $task = $query->get()
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
