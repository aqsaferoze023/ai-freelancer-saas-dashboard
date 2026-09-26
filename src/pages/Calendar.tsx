import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Badge, Button, Field, Input, Modal, PageHeader, Panel, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { EventType } from "../types";
import { dayKey, shortDate } from "../utils/format";

const eventTypes: EventType[] = ["Deadline", "Meeting", "Task", "Invoice", "Proposal"];
const eventTone: Record<EventType, string> = { Deadline: "rose", Meeting: "blue", Task: "green", Invoice: "amber", Proposal: "purple" };

function startOfWeek(date: Date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); return start;
}

export default function CalendarPage() {
  const { events, projects, clients, addEvent, addToast } = useAppStore();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"Month" | "Week" | "Day">("Month");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", date: dayKey(new Date()), time: "10:00", type: "Meeting" as EventType, projectId: "" });
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(cursor);
  const start = view === "Day" ? selectedDate : startOfWeek(view === "Month" ? new Date(cursor.getFullYear(), cursor.getMonth(), 1) : selectedDate);
  const dayCount = view === "Month" ? 42 : view === "Week" ? 7 : 1;
  const displayedDays = Array.from({ length: dayCount }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
  const currentEvents = useMemo(() => events.map((event) => ({ ...event, key: dayKey(new Date(event.date)) })), [events]);
  const upcoming = [...events].filter((event) => new Date(event.date).getTime() >= Date.now()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 6);

  const navigateRange = (direction: number) => {
    if (view === "Month") setCursor((date) => new Date(date.getFullYear(), date.getMonth() + direction, 1));
    else { const date = new Date(selectedDate); date.setDate(date.getDate() + (view === "Week" ? direction * 7 : direction)); setSelectedDate(date); setCursor(date); }
  };

  const submitEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const eventDate = new Date(`${draft.date}T12:00:00`).toISOString();
    addEvent({ id: `e-${Date.now()}`, title: draft.title, date: eventDate, time: draft.time ? new Date(`1970-01-01T${draft.time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : undefined, type: draft.type, projectId: draft.projectId || undefined, clientId: projects.find((project) => project.id === draft.projectId)?.clientId });
    addToast("Event added to your calendar."); setCreateOpen(false); setDraft({ title: "", date: dayKey(selectedDate), time: "10:00", type: "Meeting", projectId: "" });
  };

  return (
    <div>
      <PageHeader eyebrow="MAKE SPACE FOR THE IMPORTANT WORK" title="Calendar" description="A clear view of deadlines, conversations, and focused work ahead." action={<Button variant="primary" onClick={() => { setDraft({ ...draft, date: dayKey(selectedDate) }); setCreateOpen(true); }}><Plus size={15} />Add event</Button>} />
      <div className="calendar-shell-grid"><Panel className="calendar-panel"><div className="calendar-toolbar"><div className="calendar-month-title"><button className="icon-button" onClick={() => navigateRange(-1)} aria-label="Previous period"><ChevronLeft size={17} /></button><h2>{view === "Month" ? monthLabel : view === "Week" ? `${shortDate(displayedDays[0].toISOString())} - ${shortDate(displayedDays[6].toISOString())}` : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(selectedDate)}</h2><button className="icon-button" onClick={() => navigateRange(1)} aria-label="Next period"><ChevronRight size={17} /></button><Button size="sm" onClick={() => { const today = new Date(); setCursor(today); setSelectedDate(today); }}>Today</Button></div><div className="calendar-view-switch">{(["Month", "Week", "Day"] as const).map((item) => <button key={item} className={view === item ? "calendar-view-active" : ""} onClick={() => setView(item)}>{item}</button>)}</div></div>
        <div className={`calendar-grid calendar-${view.toLowerCase()}`}>
          {view === "Month" && <div className="calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>}
          <div className="calendar-days-grid">{displayedDays.map((date, index) => {
            const key = dayKey(date);
            const dayEvents = currentEvents.filter((event) => event.key === key);
            const today = dayKey(new Date()) === key;
            const inMonth = date.getMonth() === cursor.getMonth();
            return <button className={`calendar-day ${today ? "calendar-day-today" : ""} ${selectedDate && dayKey(selectedDate) === key ? "calendar-day-selected" : ""} ${view === "Month" && !inMonth ? "calendar-other-month" : ""}`} key={`${key}-${index}`} onClick={() => setSelectedDate(date)} onDoubleClick={() => { setDraft({ ...draft, date: key }); setCreateOpen(true); }}><span className="calendar-day-number">{view === "Day" ? new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date) : date.getDate()}{today && <i />}</span>{view === "Day" && <span className="calendar-selected-date-label">{new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date)}</span>}<div className="calendar-event-pills">{dayEvents.slice(0, view === "Month" ? 3 : 8).map((event) => <span className={`calendar-event calendar-event-${eventTone[event.type]}`} key={event.id}><i />{event.time && <b>{event.time} · </b>}{event.title}</span>)}{dayEvents.length > 3 && view === "Month" && <small>+{dayEvents.length - 3} more</small>}</div>{view !== "Day" && <span className="calendar-add-mark"><Plus size={12} /></span>}</button>;
          })}</div>
        </div><div className="calendar-footer"><span><span className="calendar-footer-dot" />Click a day to see what's planned. Double-click to add an event.</span><span>{events.length} scheduled events</span></div></Panel>
        <aside className="calendar-aside"><Panel className="selected-day-panel"><div className="panel-heading"><div><div className="panel-overline">SELECTED DAY</div><h2>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(selectedDate)}</h2></div><CalendarDays size={16} className="subtle-icon" /></div>{events.filter((event) => dayKey(new Date(event.date)) === dayKey(selectedDate)).length ? <div className="selected-day-events">{events.filter((event) => dayKey(new Date(event.date)) === dayKey(selectedDate)).map((event) => <div className="selected-event-row" key={event.id}><span className={`selected-event-dot event-dot-${eventTone[event.type]}`} /><div><Badge tone={eventTone[event.type]}>{event.type}</Badge><strong>{event.title}</strong><small>{event.time ?? "All day"}{event.projectId ? ` · ${projects.find((project) => project.id === event.projectId)?.name ?? "Project"}` : ""}</small></div></div>)}</div> : <div className="calendar-empty-selected"><span><CalendarDays size={18} /></span><strong>Nothing on the calendar</strong><small>A little space for deep work.</small></div>}<Button className="full-width" onClick={() => { setDraft({ ...draft, date: dayKey(selectedDate) }); setCreateOpen(true); }}><Plus size={14} />Add to this day</Button></Panel><Panel className="upcoming-list-panel"><div className="panel-heading"><div><div className="panel-overline">IN THE NEAR FUTURE</div><h2>Coming up</h2></div><button className="icon-link" aria-label="View upcoming dates" onClick={() => setView("Week")}><ArrowRight size={15} /></button></div>{upcoming.map((event) => <div className="upcoming-event" key={event.id}><div className={`upcoming-date upcoming-${eventTone[event.type]}`}><strong>{new Date(event.date).getDate()}</strong><small>{new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(event.date))}</small></div><div><strong>{event.title}</strong><small>{event.time ?? event.type}{event.clientId ? ` · ${clients.find((client) => client.id === event.clientId)?.company ?? ""}` : ""}</small></div></div>)}{!upcoming.length && <p className="muted-copy">Your upcoming events will appear here.</p>}</Panel></aside></div>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add calendar event" description="Keep a deadline, meeting, or important task on your calendar."><form className="form-stack" onSubmit={submitEvent}><Field label="Event title"><Input required autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Project review with Maya" /></Field><div className="form-grid"><Field label="Type"><Select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as EventType })}>{eventTypes.map((type) => <option key={type}>{type}</option>)}</Select></Field><Field label="Project"><Select value={draft.projectId} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}><option value="">No project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field></div><div className="form-grid"><Field label="Date"><Input type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></Field><Field label="Time"><Input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} /></Field></div><div className="modal-actions"><Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="primary"><Plus size={14} />Add event</Button></div></form></Modal>
    </div>
  );
}