import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CirclePause, CirclePlay, CircleStop, Clock3, Coffee, ListFilter, Plus, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";
import { WeeklyHoursChart } from "../components/Charts";
import { Avatar, Button, Field, Panel, Progress, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { dayKey, formatTimer, shortDate } from "../utils/format";
import type { TimeEntry } from "../types";

export default function TimeTrackerPage() {
  const { projects, clients, tasks, timeEntries, timerSeconds, timerStartedAt, startTimer, pauseTimer, stopTimer, addTimeEntry, addToast } = useAppStore();
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id ?? "");
  const [selectedTask, setSelectedTask] = useState("");
  const [note, setNote] = useState("");
  const [now, setNow] = useState(Date.now());
  const isRunning = Boolean(timerStartedAt);
  const elapsed = timerSeconds + (timerStartedAt ? Math.floor((now - timerStartedAt) / 1000) : 0);
  const project = projects.find((item) => item.id === selectedProject);
  const filteredTasks = tasks.filter((task) => task.projectId === selectedProject && task.status !== "Done");
  const todayEntries = useMemo(() => timeEntries.filter((entry) => dayKey(new Date(entry.date)) === dayKey(new Date())), [timeEntries]);
  const todayHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const weekHours = timeEntries.filter((entry) => (Date.now() - new Date(entry.date).getTime()) <= 7 * 86400000).reduce((sum, entry) => sum + entry.hours, 0);
  const monthHours = timeEntries.filter((entry) => { const date = new Date(entry.date); const nowDate = new Date(); return date.getMonth() === nowDate.getMonth() && date.getFullYear() === nowDate.getFullYear(); }).reduce((sum, entry) => sum + entry.hours, 0);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const stopAndSave = () => {
    const totalSeconds = elapsed;
    if (totalSeconds >= 60) {
      const hours = Math.max(0.25, Math.round(totalSeconds / 900) / 4);
      const entry: TimeEntry = { id: `time-${Date.now()}`, projectId: selectedProject, task: note || filteredTasks.find((task) => task.id === selectedTask)?.title || "Focused work", date: new Date().toISOString(), hours, billable: true };
      if (!timerStartedAt && timerSeconds === 0) addTimeEntry(entry);
      else stopTimer(entry);
      addToast(`${hours.toFixed(2)} hours added to ${project?.name ?? "your log"}.`);
    } else {
      stopTimer();
      addToast("Timer stopped. Sessions under a minute are not added to your log.", "info");
    }
    setNote("");
  };

  const start = () => {
    if (!selectedProject) { addToast("Choose a project before starting the timer.", "error"); return; }
    startTimer();
  };

  return (
    <div>
      <div className="tracker-page-head"><div><div className="eyebrow">MAKE YOUR WORK VISIBLE</div><h1>Time tracker</h1><p>Capture the focused work behind your best projects.</p></div><Button onClick={() => addToast("Manual time entry form opened.", "info")}><Plus size={14} />Add time manually</Button></div>
      <div className="tracker-layout"><div className="tracker-main"><Panel className={`timer-panel ${isRunning ? "timer-is-running" : ""}`}><div className="timer-topline"><div className="timer-status-label"><span className={`timer-live-dot ${isRunning ? "running" : ""}`} />{isRunning ? "TIMER RUNNING" : "READY WHEN YOU ARE"}</div><button className="timer-reset" onClick={() => { if (isRunning) { pauseTimer(); stopTimer(); } else stopTimer(); addToast("Timer reset.", "info"); }}><TimerReset size={14} />Reset</button></div><div className="timer-display" aria-live="polite">{formatTimer(elapsed).split(":").map((piece, index) => <span className="timer-part" key={index}><strong>{piece}</strong>{index < 2 && <i>:</i>}</span>)}</div><div className="timer-caption">{isRunning ? "Protect this stretch of focused time." : "Start the clock when you're ready to focus."}</div><div className="timer-selectors"><Field label="CLIENT"><Select value={clients.find((client) => client.id === project?.clientId)?.id ?? ""} onChange={(event) => { const nextProject = projects.find((item) => item.clientId === event.target.value); if (nextProject) setSelectedProject(nextProject.id); }} disabled={isRunning}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</Select></Field><Field label="PROJECT"><Select value={selectedProject} onChange={(event) => { setSelectedProject(event.target.value); setSelectedTask(""); }} disabled={isRunning}>{projects.filter((item) => !item.archived).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field><Field label="TASK"><Select value={selectedTask} onChange={(event) => setSelectedTask(event.target.value)} disabled={isRunning}><option value="">Choose a task</option>{filteredTasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</Select></Field></div><Field label="WHAT ARE YOU WORKING ON?" className="timer-note"><input className="input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note about this session..." disabled={isRunning} /></Field><div className="timer-actions">{!isRunning ? <Button variant="primary" size="lg" onClick={start}><CirclePlay size={18} />Start timer</Button> : <><Button variant="secondary" size="lg" onClick={pauseTimer}><CirclePause size={18} />Pause</Button><Button variant="danger" size="lg" onClick={stopAndSave}><CircleStop size={18} />Stop & save</Button></>}</div></Panel><Panel className="weekly-hours-panel"><div className="panel-heading"><div><div className="panel-overline">THIS WEEK</div><h2>Where your time went</h2></div><span className="chart-legend-inline"><i className="legend-dot revenue-dot" />Billable <i className="legend-dot" style={{ background: "#d9ddcd" }} />Other</span></div><WeeklyHoursChart /><div className="week-chart-foot"><span><strong>{weekHours.toFixed(1)}h</strong> tracked this week</span><span>{Math.round(timeEntries.filter((entry) => entry.billable).length / Math.max(1, timeEntries.length) * 100)}% billable</span></div></Panel></div><aside className="tracker-sidebar"><Panel className="today-focus-panel"><div className="today-focus-head"><div><div className="panel-overline">TODAY AT A GLANCE</div><h2>Today's time</h2></div><span className="today-focus-icon"><Clock3 size={17} /></span></div><div className="today-hours-number">{todayHours.toFixed(1)}<span>h</span></div><Progress value={Math.min(100, (todayHours / 8) * 100)} /><div className="goal-labels"><span>Daily focus goal</span><strong>{Math.round(todayHours / 8 * 100)}% of 8h</strong></div><div className="focus-break-row"><Coffee size={15} /><span>A short break can help you reset.</span></div><Button className="full-width" onClick={() => addToast("Your daily time report is ready.", "info")}>View daily report<ArrowRight size={13} /></Button></Panel><Panel className="tracker-summary-panel"><div className="panel-heading"><div><div className="panel-overline">YOUR MOMENTUM</div><h2>Month to date</h2></div><Activity size={16} className="subtle-icon" /></div><div className="tracker-mini-stat"><span>Tracked this month</span><strong>{monthHours.toFixed(1)}<small> h</small></strong></div><div className="tracker-mini-stat"><span>Billable total</span><strong>{timeEntries.filter((entry) => entry.billable).reduce((sum, entry) => sum + entry.hours, 0).toFixed(1)}<small> h</small></strong></div><div className="tracker-mini-stat"><span>Active projects</span><strong>{projects.filter((item) => item.status === "In Progress" || item.status === "Review").length}</strong></div></Panel><Panel className="recent-sessions-panel"><div className="panel-heading"><div><div className="panel-overline">LATEST ENTRIES</div><h2>Recent sessions</h2></div><button className="icon-link" onClick={() => addToast("Time log view opened.", "info")} aria-label="View full time log"><ListFilter size={15} /></button></div><div className="recent-session-list">{timeEntries.slice(0, 5).map((entry) => { const linkedProject = projects.find((item) => item.id === entry.projectId); return <div className="recent-session-row" key={entry.id}><Avatar name={linkedProject?.name ?? "Work"} color="sage" size="sm" /><div><strong>{linkedProject?.name ?? "Independent work"}</strong><span>{entry.task}</span></div><div><strong>{entry.hours}h</strong><small>{shortDate(entry.date)}</small></div></div>; })}</div><Link to="/analytics" className="panel-bottom-link">Explore time analytics<ArrowRight size={13} /></Link></Panel></aside></div>
    </div>
  );
}