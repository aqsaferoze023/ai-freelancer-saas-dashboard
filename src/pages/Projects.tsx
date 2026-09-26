import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleDollarSign, Clock3, FileText, MoreHorizontal, Plus, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Panel, Progress, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { Project, ProjectStatus, Task, TaskStatus } from "../types";
import { currency, shortDate } from "../utils/format";

const projectStatuses: ProjectStatus[] = ["Planning", "In Progress", "Review", "Completed", "On Hold"];
const statusTone: Record<ProjectStatus, string> = { Planning: "neutral", "In Progress": "green", Review: "amber", Completed: "blue", "On Hold": "rose" };
const boardColumns: TaskStatus[] = ["Backlog", "To Do", "In Progress", "Review", "Done"];

export default function ProjectsPage() {
  const { projects, clients } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All projects");
  const [createOpen, setCreateOpen] = useState(false);
  const activeProjects = projects.filter((project) => !project.archived);
  const filtered = useMemo(() => activeProjects.filter((project) => {
    const client = clients.find((item) => item.id === project.clientId);
    const matches = `${project.name} ${client?.company ?? ""}`.toLowerCase().includes(search.toLowerCase());
    return matches && (filter === "All projects" || project.status === filter);
  }), [activeProjects, clients, filter, search]);

  return (
    <div>
      <PageHeader eyebrow="PROJECT DELIVERY" title="Projects" description="A calm view of every engagement, milestone, and next step." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={15} />New project</Button>} />
      <div className="project-summary-strip"><div><span className="summary-icon summary-icon-wine"><Sparkles size={16} /></span><span><strong>{activeProjects.length}</strong><small>Active engagements</small></span></div><div><span className="summary-icon summary-icon-green"><CircleDollarSign size={16} /></span><span><strong>{currency(activeProjects.reduce((sum, project) => sum + project.budget, 0))}</strong><small>Current project value</small></span></div><div><span className="summary-icon summary-icon-amber"><Clock3 size={16} /></span><span><strong>{activeProjects.reduce((sum, project) => sum + project.hours, 0)}h</strong><small>Time invested</small></span></div></div>
      <Panel className="data-panel">
        <div className="list-toolbar project-toolbar"><div className="filter-tabs">{["All projects", ...projectStatuses].map((item) => <button key={item} className={filter === item ? "filter-tab active" : "filter-tab"} onClick={() => setFilter(item)}>{item}<span>{item === "All projects" ? activeProjects.length : activeProjects.filter((project) => project.status === item).length}</span></button>)}</div><div className="toolbar-controls"><label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" aria-label="Search projects" /></label><button className="icon-button filter-button" onClick={() => { setFilter("All projects"); setSearch(""); }} aria-label="Clear project filters"><SlidersHorizontal size={15} /></button></div></div>
        {filtered.length ? <div className="table-scroll"><table className="data-table project-table"><thead><tr><th>Project</th><th>Status</th><th>Progress</th><th>Deadline</th><th>Budget</th><th>Paid</th><th className="action-col" /></tr></thead><tbody>{filtered.map((project) => { const client = clients.find((item) => item.id === project.clientId); return <tr key={project.id} className="clickable-row" onClick={() => navigate(`/projects/${project.id}`)}><td><div className="table-person"><Avatar name={project.name} color={client?.color ?? "slate"} /><div><strong>{project.name}</strong><span>{client?.company ?? "No client assigned"}</span></div></div></td><td><Badge tone={statusTone[project.status]}>{project.status}</Badge></td><td><div className="table-progress"><Progress value={project.progress} /><span>{project.progress}%</span></div></td><td><span className="table-muted">{shortDate(project.deadline)}</span></td><td><strong className="table-number">{currency(project.budget)}</strong></td><td><span className="table-muted">{currency(project.amountPaid)}</span></td><td><button className="row-more" onClick={(event) => { event.stopPropagation(); navigate(`/projects/${project.id}`); }} aria-label={`Open ${project.name}`}><ArrowRight size={15} /></button></td></tr>; })}</tbody></table></div> : <EmptyState title="No projects match" description="Try a different search, or create a new project to get started." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={14} />New project</Button>} />}
        <div className="table-footer"><span><strong>{filtered.length}</strong> projects shown</span><span className="footer-muted">Budgets include all project milestones</span></div>
      </Panel>
      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const { projects, clients, tasks, updateProject, archiveProject, updateTaskStatus, addTask, addToast } = useAppStore();
  const navigate = useNavigate();
  const project = projects.find((item) => item.id === projectId && !item.archived);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("Medium");
  const [taskDue, setTaskDue] = useState(new Date().toISOString().slice(0, 10));
  if (!project) return <div className="not-found"><h1>Project not found</h1><Link to="/projects"><ArrowLeft size={14} />Back to projects</Link></div>;
  const client = clients.find((item) => item.id === project.clientId);
  const projectTasks = tasks.filter((task) => task.projectId === project.id);

  const changeStatus = (status: ProjectStatus) => {
    updateProject({ ...project, status });
    addToast(`Project moved to ${status}.`);
  };
  const dropTask = (event: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/plain");
    if (taskId) { updateTaskStatus(taskId, status); addToast(`Task moved to ${status}.`, "info"); }
  };
  const submitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTask({ id: `t-${Date.now()}`, title: taskName, projectId: project.id, priority: taskPriority, dueTime: "4:00 PM", dueDate: new Date(`${taskDue}T12:00:00`).toISOString(), status: "To Do" });
    setTaskOpen(false); setTaskName(""); addToast("Task added to the project.");
  };

  return (
    <div>
      <Link className="back-link" to="/projects"><ArrowLeft size={14} />All projects</Link>
      <div className="project-detail-top"><div><div className="detail-title-row"><Avatar name={project.name} color={client?.color ?? "sage"} size="lg" /><div><div className="project-breadcrumb">{client?.company ?? "Independent"}<span>/</span>Project</div><h1>{project.name}</h1></div></div><p>{project.description}</p></div><div className="project-detail-actions"><Select value={project.status} onChange={(event) => changeStatus(event.target.value as ProjectStatus)} aria-label="Change project status">{projectStatuses.map((item) => <option key={item}>{item}</option>)}</Select><Button onClick={() => setEditOpen(true)}><MoreHorizontal size={16} />Edit project</Button><Button variant="ghost" className="danger-text" onClick={() => setArchiveOpen(true)}>Archive</Button></div></div>
      <div className="project-detail-metrics"><Panel className="project-metric"><span>Project progress</span><div className="project-metric-value"><strong>{project.progress}%</strong><span className="metric-trend"><Sparkles size={12} />On track</span></div><Progress value={project.progress} /></Panel><Panel className="project-metric"><span>Project budget</span><strong>{currency(project.budget)}</strong><small>{currency(project.amountPaid)} paid · {currency(project.budget - project.amountPaid)} remaining</small></Panel><Panel className="project-metric"><span>Deadline</span><strong>{shortDate(project.deadline)}</strong><small>{Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000))} days remaining</small></Panel><Panel className="project-metric"><span>Time tracked</span><strong>{project.hours}h</strong><small>{project.team.length} collaborators on this project</small></Panel></div>
      <div className="project-detail-info-grid"><Panel className="project-overview-panel"><div className="panel-heading"><div><div className="panel-overline">PROJECT OVERVIEW</div><h2>At a glance</h2></div><Badge tone={statusTone[project.status]}>{project.status}</Badge></div><div className="overview-list"><div><span>Client</span><Link to={client ? `/clients/${client.id}` : "/clients"}><Avatar name={client?.name ?? "No client"} color={client?.color ?? "slate"} size="sm" />{client?.company ?? "No client assigned"}</Link></div><div><span>Deadline</span><strong><CalendarDays size={14} />{shortDate(project.deadline)}</strong></div><div><span>Team</span><div className="team-avatars">{project.team.map((member, index) => <Avatar key={`${member}-${index}`} name={member === "AC" ? "Alex Carter" : member === "JM" ? "Jamie Morgan" : member} color={index ? "sky" : "profile"} size="sm" />)}<button className="add-team-button" onClick={() => addToast("Invite link copied to clipboard.", "info")}><Plus size={12} /></button></div></div><div><span>Project value</span><strong><CircleDollarSign size={14} />{currency(project.budget)}</strong></div></div><div className="project-overview-note"><Sparkles size={15} /><p>{project.description}</p></div></Panel><Panel className="project-billing-panel"><div className="panel-heading"><div><div className="panel-overline">PAYMENT SNAPSHOT</div><h2>Budget health</h2></div><Link to="/invoices" className="icon-link" aria-label="View invoices"><ArrowRight size={15} /></Link></div><div className="billing-amount"><strong>{currency(project.amountPaid)}</strong><span>collected</span></div><Progress value={project.budget ? (project.amountPaid / project.budget) * 100 : 0} /><div className="billing-summary"><span>{Math.round(project.budget ? (project.amountPaid / project.budget) * 100 : 0)}% of budget paid</span><strong>{currency(project.budget - project.amountPaid)} to go</strong></div><div className="billing-foot"><span><FileText size={13} />Milestone-based billing</span><span><Clock3 size={13} />{project.hours} tracked hours</span></div></Panel></div>
      <Panel className="kanban-panel"><div className="panel-heading kanban-heading"><div><div className="panel-overline">KEEP THE WORK MOVING</div><h2>Project tasks <span className="count-indicator">{projectTasks.length}</span></h2></div><Button variant="secondary" size="sm" onClick={() => setTaskOpen(true)}><Plus size={14} />Add task</Button></div><div className="kanban-board">{boardColumns.map((column) => { const items = projectTasks.filter((task) => task.status === column); return <div className="kanban-column" key={column} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropTask(event, column)}><div className="kanban-column-title"><span className={`kanban-dot kanban-dot-${column.toLowerCase().replace(/\s+/g, "-")}`} />{column}<span className="kanban-count">{items.length}</span></div><div className="kanban-cards">{items.map((task) => <div className="kanban-card" key={task.id} draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", task.id)}><div className="kanban-card-top"><Badge tone={`priority-${task.priority.toLowerCase()}`}>{task.priority}</Badge><button className="row-more" onClick={() => { updateTaskStatus(task.id, task.status === "Done" ? "To Do" : "Done"); addToast("Task status updated.", "info"); }} aria-label="Toggle task completion"><Check size={14} /></button></div><strong>{task.title}</strong><div className="kanban-card-footer"><span><CalendarDays size={11} />{shortDate(task.dueDate)}</span><Avatar name={client?.name ?? "Alex Carter"} color={client?.color ?? "profile"} size="sm" /></div></div>)}{!items.length && <div className="kanban-drop-hint">Drop tasks here</div>}</div></div>; })}</div><p className="kanban-help">Drag a task between columns to update its status.</p></Panel>
      <div className="project-bottom-row"><Panel className="project-activity-panel"><div className="panel-heading"><div><div className="panel-overline">PROJECT HISTORY</div><h2>Recent activity</h2></div><button className="text-button" onClick={() => addToast("Project activity exported.", "info")}>View log</button></div><div className="project-event-list"><div><span className="project-event-mark green"><Check size={12} /></span><p><strong>Design review approved</strong><small>Maya Chen · 2 hours ago</small></p></div><div><span className="project-event-mark blue"><Clock3 size={12} /></span><p><strong>12.5 hours tracked this week</strong><small>Alex Carter · Yesterday</small></p></div><div><span className="project-event-mark rose"><FileText size={12} /></span><p><strong>Milestone invoice sent</strong><small>INV-1042 · 3 days ago</small></p></div></div></Panel><Panel className="project-next-step"><span className="next-step-icon"><Sparkles size={15} /></span><div><span>NEXT BEST STEP</span><h3>Share a mid-project progress update</h3><p>A quick update keeps your client confident and feedback timely.</p><Button variant="soft" size="sm" onClick={() => addToast("Progress update draft created.", "info")}>Draft project update<ArrowRight size={13} /></Button></div></Panel></div>

      <ProjectFormModal open={editOpen} onClose={() => setEditOpen(false)} existing={project} />
      <Modal open={archiveOpen} onClose={() => setArchiveOpen(false)} title="Archive this project?" description="The project and its history will be hidden from your active workspace. You can still access its records later."><div className="modal-actions"><Button onClick={() => setArchiveOpen(false)}>Keep project</Button><Button variant="danger" onClick={() => { archiveProject(project.id); addToast("Project archived.", "info"); navigate("/projects"); }}>Archive project</Button></div></Modal>
      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="Add a project task" description="Create a task for this project."><form className="form-stack" onSubmit={submitTask}><Field label="Task name"><Input required autoFocus value={taskName} onChange={(event) => setTaskName(event.target.value)} placeholder="What needs to get done?" /></Field><div className="form-grid"><Field label="Priority"><Select value={taskPriority} onChange={(event) => setTaskPriority(event.target.value as Task["priority"])}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></Select></Field><Field label="Due date"><Input type="date" value={taskDue} onChange={(event) => setTaskDue(event.target.value)} /></Field></div><div className="modal-actions"><Button type="button" onClick={() => setTaskOpen(false)}>Cancel</Button><Button type="submit" variant="primary"><Plus size={14} />Add task</Button></div></form></Modal>
    </div>
  );
}

function ProjectFormModal({ open, onClose, existing }: { open: boolean; onClose: () => void; existing?: Project }) {
  const { clients, addProject, updateProject, addToast } = useAppStore();
  const [name, setName] = useState(existing?.name ?? "");
  const [clientId, setClientId] = useState(existing?.clientId ?? clients[0]?.id ?? "");
  const [budget, setBudget] = useState(String(existing?.budget ?? ""));
  const [progress, setProgress] = useState(String(existing?.progress ?? 0));
  const [deadline, setDeadline] = useState(existing?.deadline.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<ProjectStatus>(existing?.status ?? "Planning");
  const [description, setDescription] = useState(existing?.description ?? "");

  useEffect(() => {
    if (open) { setName(existing?.name ?? ""); setClientId(existing?.clientId ?? clients[0]?.id ?? ""); setBudget(String(existing?.budget ?? "")); setProgress(String(existing?.progress ?? 0)); setDeadline(existing?.deadline.slice(0, 10) ?? new Date().toISOString().slice(0, 10)); setStatus(existing?.status ?? "Planning"); setDescription(existing?.description ?? ""); }
  }, [open, existing, clients]);

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (existing) updateProject({ ...existing, name, clientId, budget: Number(budget), progress: Math.min(100, Math.max(0, Number(progress))), deadline: new Date(`${deadline}T12:00:00`).toISOString(), status, description });
    else addProject({ id: `p-${Date.now()}`, name, clientId, budget: Number(budget), progress: Math.min(100, Math.max(0, Number(progress))), deadline: new Date(`${deadline}T12:00:00`).toISOString(), status, description, amountPaid: 0, hours: 0, team: ["AC"] });
    addToast(existing ? "Project details updated." : "Project created successfully."); onClose();
  };

  return <Modal open={open} onClose={onClose} title={existing ? "Edit project" : "Create a project"} description="Set up the essentials. You can add milestones and tasks next."><form className="form-stack" onSubmit={save}><Field label="Project name"><Input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Brand identity refresh" /></Field><Field label="Client"><Select value={clientId} onChange={(event) => setClientId(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</Select></Field><div className="form-grid"><Field label="Budget"><Input type="number" min="0" required value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="5000" /></Field><Field label="Deadline"><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field></div><div className="form-grid"><Field label="Status"><Select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>{projectStatuses.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Progress (%)"><Input type="number" min="0" max="100" value={progress} onChange={(event) => setProgress(event.target.value)} /></Field></div><Field label="Description"><textarea className="input textarea" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does success look like for this project?" rows={3} /></Field><div className="modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary"><Plus size={14} />{existing ? "Save changes" : "Create project"}</Button></div></form></Modal>;
}