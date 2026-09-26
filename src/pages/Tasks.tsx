import { useMemo, useState } from "react";
import { Check, Circle, Clock3, Filter, ListChecks, Plus, Search } from "lucide-react";
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Panel, Progress, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { Task, TaskStatus } from "../types";
import { shortDate } from "../utils/format";

const taskStatuses: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

export default function TasksPage() {
  const { tasks, projects, toggleTask, addTask, addToast } = useAppStore();
  const [filter, setFilter] = useState("All tasks");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", projectId: projects[0]?.id ?? "", priority: "Medium" as Task["priority"], dueDate: new Date().toISOString().slice(0, 10) });
  const completed = tasks.filter((task) => task.status === "Done").length;
  const filtered = useMemo(() => tasks.filter((task) => {
    const project = projects.find((item) => item.id === task.projectId);
    const matches = `${task.title} ${project?.name ?? ""}`.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (filter === "All tasks") return true;
    if (filter === "Open") return task.status !== "Done";
    if (filter === "Completed") return task.status === "Done";
    return task.status === filter;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [tasks, projects, filter, search]);

  const create = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTask({ id: `t-${Date.now()}`, title: draft.title, projectId: draft.projectId, priority: draft.priority, dueTime: "4:00 PM", dueDate: new Date(`${draft.dueDate}T12:00:00`).toISOString(), status: "To Do" });
    setCreateOpen(false); setDraft({ title: "", projectId: projects[0]?.id ?? "", priority: "Medium", dueDate: new Date().toISOString().slice(0, 10) }); addToast("Task added to your list.");
  };

  return (
    <div>
      <PageHeader eyebrow="YOUR DAILY WORKFLOW" title="Tasks" description="Small, clear next steps keep good projects moving." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={15} />New task</Button>} />
      <div className="task-overview-cards"><Panel className="task-overview-card"><span className="task-overview-icon"><ListChecks size={17} /></span><div><span>All tasks</span><strong>{tasks.length}</strong></div><span className="task-overview-aside">Across {projects.length} projects</span></Panel><Panel className="task-overview-card"><span className="task-overview-icon task-overview-green"><Check size={17} /></span><div><span>Completed</span><strong>{completed}</strong></div><span className="task-overview-aside">{tasks.length ? Math.round(completed / tasks.length * 100) : 0}% complete</span></Panel><Panel className="task-overview-card"><span className="task-overview-icon task-overview-amber"><Clock3 size={17} /></span><div><span>Open work</span><strong>{tasks.length - completed}</strong></div><Progress value={tasks.length ? completed / tasks.length * 100 : 0} /></Panel></div>
      <Panel className="data-panel task-manager-panel"><div className="list-toolbar"><div className="filter-tabs">{["All tasks", "Open", "In Progress", "Completed"].map((item) => <button className={`filter-tab ${filter === item ? "active" : ""}`} key={item} onClick={() => setFilter(item)}>{item}<span>{item === "All tasks" ? tasks.length : item === "Open" ? tasks.length - completed : item === "Completed" ? completed : tasks.filter((task) => task.status === item).length}</span></button>)}</div><div className="toolbar-controls"><label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a task" aria-label="Search tasks" /></label><button className="icon-button filter-button" onClick={() => { setFilter("All tasks"); setSearch(""); }} aria-label="Reset task filters"><Filter size={15} /></button></div></div>
        {filtered.length ? <div className="table-scroll"><table className="data-table task-manager-table"><thead><tr><th>Task</th><th>Project</th><th>Priority</th><th>Due date</th><th>Status</th><th className="action-col" /></tr></thead><tbody>{filtered.map((task) => { const project = projects.find((item) => item.id === task.projectId); return <tr key={task.id} className={task.status === "Done" ? "task-complete" : ""}><td><button className={`task-check ${task.status === "Done" ? "checked" : ""}`} onClick={() => { toggleTask(task.id); addToast(task.status === "Done" ? "Task reopened." : "Task completed.", "info"); }} aria-label={task.status === "Done" ? "Reopen task" : "Complete task"}>{task.status === "Done" && <Check size={12} />}</button><span className="task-title-cell">{task.title}</span></td><td><div className="task-project-avatar"><Avatar name={project?.name ?? "General"} color="sage" size="sm" /><span>{project?.name ?? "General"}</span></div></td><td><Badge tone={`priority-${task.priority.toLowerCase()}`}>{task.priority}</Badge></td><td><span className="table-date"><Clock3 size={12} />{shortDate(task.dueDate)}<small>{task.dueTime}</small></span></td><td><Select className="task-status-select" value={task.status} aria-label={`Change status for ${task.title}`} onChange={(event) => { useAppStore.getState().updateTaskStatus(task.id, event.target.value as TaskStatus); addToast("Task status updated.", "info"); }}>{taskStatuses.map((status) => <option key={status}>{status}</option>)}</Select></td><td><button className="row-more" aria-label="Task actions" onClick={() => addToast("Task action menu opened.", "info")}><Circle size={14} /></button></td></tr>; })}</tbody></table></div> : <EmptyState title="No tasks here" description="Try changing your filters or create a task to make a little progress." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={14} />Create task</Button>} />}
        <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> tasks</span><span className="footer-muted">Your task list is saved automatically</span></div>
      </Panel>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create a task" description="Give your next step a clear name, project, and due date."><form className="form-stack" onSubmit={create}><Field label="Task"><Input required autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to get done?" /></Field><div className="form-grid"><Field label="Project"><Select value={draft.projectId} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field><Field label="Priority"><Select value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as Task["priority"] })}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></Select></Field></div><Field label="Due date"><Input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></Field><div className="modal-actions"><Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" type="submit"><Plus size={14} />Create task</Button></div></form></Modal>
    </div>
  );
}