import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg, EventSourceFuncArg } from '@fullcalendar/core';

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function CalendarioView({ onEventoClick }: { onEventoClick: (eventoId: number) => void }) {
    const caricaEventi = (_info: EventSourceFuncArg, successCallback: (events: any[]) => void, failureCallback: (error: Error) => void) => {
        fetch('/ente/calendario/eventi')
            .then((r) => r.json())
            .then(successCallback)
            .catch(failureCallback);
    };

    const handleEventClick = (info: EventClickArg) => {
        const eventoId = info.event.extendedProps.evento_id;
        if (eventoId) onEventoClick(Number(eventoId));
    };

    const handleEventDrop = async (info: EventDropArg) => {
        const eventoId = info.event.extendedProps.evento_id;
        const nuovaData = info.event.startStr;

        const res = await fetch(`/ente/calendario/eventi/${eventoId}`, {
            method: 'PUT',
            headers: { 'X-CSRF-TOKEN': csrfToken(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_scadenza: nuovaData }),
        });

        if (!res.ok) info.revert();
    };

    return (
        <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 calendario-scadenze-wrapper">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listMonth',
                }}
                buttonText={{ today: 'Oggi', month: 'Mensile', week: 'Settimanale', list: 'Agenda' }}
                locale="it"
                height="auto"
                editable={true}
                events={caricaEventi}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
            />
        </div>
    );
}
