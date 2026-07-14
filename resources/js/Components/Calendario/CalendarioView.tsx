import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';

export interface EventoGiorno {
    eventoId: number;
    title: string;
    color: string;
    kind: 'evento' | 'task';
}

export interface EventoCalendario {
    id: string;
    title: string;
    start: string;
    allDay: boolean;
    editable: boolean;
    color: string;
    extendedProps: {
        kind: 'evento' | 'task';
        evento_id: number;
        tipo?: 'bando' | 'manuale';
        [key: string]: unknown;
    };
}

const csrfToken = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

export default function CalendarioView({
    eventi, onEventoClick, onGiornoClick,
}: {
    eventi: EventoCalendario[];
    onEventoClick: (eventoId: number) => void;
    onGiornoClick: (data: string, eventi: EventoGiorno[]) => void;
}) {
    const calendarRef = useRef<FullCalendar>(null);

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

    const handleDateClick = (info: DateClickArg) => {
        const api = calendarRef.current?.getApi();
        if (!api) return;

        const eventiDelGiorno = api.getEvents()
            .filter((e) => e.startStr === info.dateStr)
            .map((e) => ({
                eventoId: Number(e.extendedProps.evento_id),
                title: e.title,
                color: e.backgroundColor || '#64748b',
                kind: e.extendedProps.kind as 'evento' | 'task',
            }));

        onGiornoClick(info.dateStr, eventiDelGiorno);
    };

    return (
        <div className="rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 p-5 shadow-xl shadow-black/20 calendario-scadenze-wrapper">
            <FullCalendar
                ref={calendarRef}
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
                dayMaxEvents={3}
                moreLinkText={(n) => `+${n} altri`}
                editable={true}
                events={eventi}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                dateClick={handleDateClick}
            />
        </div>
    );
}
