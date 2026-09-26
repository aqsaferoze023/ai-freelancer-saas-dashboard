import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  FileText,
  FolderKanban,
  Home,
  LayoutGrid,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Timer,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../store/useAppStore";
import type { CreateKind } from "../types";
import { dayKey } from "../utils/format";
import { Avatar, Button, Field, Input, Modal, Select } from "./ui";

const navigation: { label: string; path: string; icon: LucideIcon }[] = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Clients", path: "/clients", icon: UsersRound },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Tasks", path: "/tasks", icon: Check },
  { label: "Proposals", path: "/proposals", icon: FileText },
  { label: "Invoices", path: "/invoices", icon: BriefcaseBusiness },
  { label: "Time Tracker", path: "/time-tracker", icon: Timer },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "AI Assistant", path: "/ai-assistant", icon: Sparkles },
  { label: "Analytics", path: "/analytics", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
];

const routeCommands = [
  { name: "Dashboard", path: "/", icon: Home },
  { name: "Clients", path: "/clients", icon: UsersRound },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: Check },
  { name: "Proposals", path: "/proposals", icon: FileText },
  { name: "Invoices", path: "/invoices", icon: BriefcaseBusiness },
  { name: "Time Tracker", path: "/time-tracker", icon: Timer },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "AI Assistant", path: "/ai-assistant", icon: Sparkles },
  { name: "Analytics", path: "/analytics", icon: Activity },
  { name: "Settings", path: "/settings", icon: Settings },
];

const createOptions: { type: CreateKind; label: string; icon: LucideIcon }[] = [
  { type: "client", label: "New client", icon: UsersRound },
  { type: "project", label: "New project", icon: FolderKanban },
  { type: "task", label: "New task", icon: Check },
  { type: "proposal", label: "New proposal", icon: FileText },
  { type: "invoice", label: "New invoice", icon: BriefcaseBusiness },
];

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickKind, setQuickKind] = useState<CreateKind | null>(null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme, toasts, dismissToast, notifications } = useAppStore();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
    setQuickMenuOpen(false);
    setWorkspaceOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setQuickMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} onThemeToggle={toggleTheme} theme={theme} />
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-trigger icon-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <button className="global-search" onClick={() => setCommandOpen(true)} aria-label="Open global search">
              <Search size={16} /><span>Search anything...</span><kbd><Command size={10} /> K</kbd>
            </button>
          </div>
          <div className="topbar-actions">
            <div className="workspace-wrap">
              <button className="workspace-button" onClick={() => setWorkspaceOpen((open) => !open)}>
                <span className="workspace-mark"><LayoutGrid size={14} /></span><span>Alex's Workspace</span><ChevronDown size={14} />
              </button>
              <AnimatePresence>
                {workspaceOpen && <motion.div className="floating-menu workspace-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                  <div className="menu-eyebrow">WORKSPACES</div>
                  <button className="menu-row selected"><span className="workspace-mark"><LayoutGrid size={13} /></span><span>Alex's Workspace</span><Check size={14} /></button>
                  <button className="menu-row" onClick={() => { useAppStore.getState().addToast("Workspace settings are ready to connect.", "info"); setWorkspaceOpen(false); }}><Plus size={14} /><span>Create workspace</span></button>
                </motion.div>}
              </AnimatePresence>
            </div>
            <div className="notification-wrap">
              <button className="icon-button notification-button" onClick={() => { setNotificationsOpen((open) => !open); useAppStore.getState().markNotificationsRead(); }} aria-label="Notifications"><Bell size={17} />{notifications.some((item) => item.unread) && <span className="notification-dot" />}</button>
              <AnimatePresence>
                {notificationsOpen && <motion.div className="floating-menu notification-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                  <div className="notification-title"><div><strong>Notifications</strong><span>You're all caught up</span></div><button className="text-button" onClick={() => setNotificationsOpen(false)}>Close</button></div>
                  {useAppStore.getState().notifications.map((item) => <div className="notification-row" key={item.id}><span className="notification-mark"><Sparkles size={13} /></span><div><strong>{item.title}</strong><p>{item.detail}</p><time>{item.time}</time></div></div>)}
                </motion.div>}
              </AnimatePresence>
            </div>
            <div className="quick-add-wrap">
              <Button variant="primary" size="sm" onClick={() => setQuickMenuOpen((open) => !open)}><Plus size={15} />Quick Add</Button>
              <AnimatePresence>
                {quickMenuOpen && <motion.div className="floating-menu quick-menu" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}>
                  <div className="menu-eyebrow">CREATE NEW</div>
                  {createOptions.map(({ type, label, icon: Icon }) => <button className="menu-row" key={type} onClick={() => { setQuickKind(type); setQuickMenuOpen(false); }}><Icon size={15} /><span>{label}</span><ArrowRight size={13} /></button>)}
                </motion.div>}
              </AnimatePresence>
            </div>
            <div className="topbar-profile"><Avatar name="Alex Carter" color="profile" /><div><strong>Alex Carter</strong><span>Freelancer</span></div><ChevronDown size={14} /></div>
          </div>
        </header>
        <main className="page-content" key={location.pathname}><Outlet /></main>
      </div>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <QuickCreateModal kind={quickKind} onClose={() => setQuickKind(null)} />
      <ToastStack toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}

function Sidebar({ mobileOpen, onClose, onThemeToggle, theme }: { mobileOpen: boolean; onClose: () => void; onThemeToggle: () => void; theme: string }) {
  const { addToast } = useAppStore();
  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <div className="brand-symbol"><span /><span /><span /></div>
        <span className="brand-name">Freelance<span>OS</span></span>
        <button className="sidebar-close icon-button" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>
      </div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink to={path} end={path === "/"} key={label} className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`} title={label}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === "AI Assistant" && <span className="nav-spark"><Sparkles size={11} /></span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-spacer" />
      <div className="upgrade-block">
        <div className="upgrade-glow"><Sparkles size={16} /></div>
        <strong>More room to grow</strong>
        <p>Unlock advanced insights and unlimited projects.</p>
        <Button variant="light" size="sm" onClick={() => addToast("You're on the early access plan. Billing will be available soon.", "info")}>Explore Pro<ArrowRight size={13} /></Button>
      </div>
      <div className="sidebar-bottom-actions">
        <button className="sidebar-footer-link" onClick={() => addToast("Help center is coming soon.", "info")}><CircleHelp size={16} /><span>Help & support</span></button>
        <button className="sidebar-footer-link theme-toggle" onClick={onThemeToggle}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}<span>{theme === "light" ? "Dark mode" : "Light mode"}</span></button>
      </div>
      <div className="sidebar-user">
        <Avatar name="Alex Carter" color="profile" />
        <div className="sidebar-user-copy"><strong>Alex Carter</strong><span>alex@freelanceos.com</span></div>
        <button className="sidebar-user-menu" onClick={() => addToast("Profile menu opened.", "info")} aria-label="Open profile menu"><ChevronDown size={14} /></button>
      </div>
    </aside>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { clients, projects, tasks } = useAppStore();
  const searchable = useMemo(() => [
    ...routeCommands.map((item) => ({ ...item, subtitle: "Navigate", group: "Pages" })),
    ...clients.map((client) => ({ name: client.company, path: `/clients/${client.id}`, icon: UsersRound, subtitle: client.name, group: "Clients" })),
    ...projects.filter((project) => !project.archived).map((project) => ({ name: project.name, path: `/projects/${project.id}`, icon: FolderKanban, subtitle: "Project", group: "Projects" })),
    ...tasks.map((task) => ({ name: task.title, path: "/tasks", icon: Check, subtitle: "Task", group: "Tasks" })),
  ], [clients, projects, tasks]);
  const filtered = useMemo(() => (query.trim() ? searchable.filter((item) => `${item.name} ${item.subtitle} ${item.group}`.toLowerCase().includes(query.toLowerCase())) : searchable.filter((item) => item.group === "Pages")).slice(0, 12), [query, searchable]);
  useEffect(() => { if (!open) setQuery(""); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Jump to" description="Search your workspace or navigate to a page." size="md">
      <div className="command-content">
        <div className="command-search"><Search size={16} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages..." /></div>
        <div className="command-list">
          {filtered.length ? filtered.map(({ name, path, icon: Icon, subtitle, group }) => <button className="command-item" key={`${name}-${path}`} onClick={() => { navigate(path); onClose(); }}><span className="command-icon"><Icon size={15} /></span><span className="command-item-copy"><strong>{name}</strong><small>{subtitle}</small></span><span className="command-result-group">{group}</span><ArrowRight size={14} /></button>) : <p className="command-empty">No workspace results for “{query}”.</p>}
        </div>
        <div className="command-footer"><span>Navigate with <kbd>↑</kbd> <kbd>↓</kbd></span><span>Close <kbd>esc</kbd></span></div>
      </div>
    </Modal>
  );
}

function QuickCreateModal({ kind, onClose }: { kind: CreateKind | null; onClose: () => void }) {
  const { clients, projects, addClient, addProject, addTask, addInvoice, addProposal, addToast } = useAppStore();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState(dayKey(new Date()));
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    if (kind) {
      setName(""); setCompany(""); setEmail(""); setAmount(""); setDeadline(dayKey(new Date()));
      setClientId(clients[0]?.id ?? ""); setProjectId(projects[0]?.id ?? "");
    }
  }, [kind, clients, projects]);

  const title = kind ? `Create ${kind}` : "Create";
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!kind) return;
    const today = new Date().toISOString();
    if (kind === "client") {
      addClient({ id: `c-${Date.now()}`, name: name.trim(), company: company.trim(), email: email.trim(), phone: "", status: "Lead", totalRevenue: 0, activeProjects: 0, lastContact: today, color: "sky", notes: "" });
    }
    if (kind === "project") {
      addProject({ id: `p-${Date.now()}`, name: name.trim(), clientId, status: "Planning", progress: 0, deadline: new Date(`${deadline}T12:00:00`).toISOString(), budget: Number(amount) || 0, amountPaid: 0, description: "New project created from your workspace.", hours: 0, team: ["AC"] });
    }
    if (kind === "task") {
      addTask({ id: `t-${Date.now()}`, title: name.trim(), projectId, priority: priority as "Low" | "Medium" | "High" | "Urgent", dueTime: "5:00 PM", dueDate: new Date(`${deadline}T12:00:00`).toISOString(), status: "To Do" });
    }
    if (kind === "invoice") {
      const next = Math.max(1042, ...useAppStore.getState().invoices.map((invoice) => Number(invoice.number.replace("INV-", "")) || 0)) + 1;
      addInvoice({ id: `i-${Date.now()}`, number: `INV-${next}`, clientId, amount: Number(amount) || 0, issueDate: today, dueDate: new Date(`${deadline}T12:00:00`).toISOString(), status: "Pending" });
    }
    if (kind === "proposal") {
      const expires = new Date(); expires.setDate(expires.getDate() + 30);
      addProposal({ id: `pr-${Date.now()}`, title: name.trim(), clientId, amount: Number(amount) || 0, createdDate: today, expiryDate: expires.toISOString(), status: "Draft", description: "A new freelance project proposal." });
    }
    addToast(`${kind[0].toUpperCase()}${kind.slice(1)} created successfully.`);
    onClose();
  };

  const needsName = kind === "client" || kind === "project" || kind === "task" || kind === "proposal";
  const submitLabel = kind ? `Create ${kind}` : "Create";

  return (
    <Modal open={Boolean(kind)} onClose={onClose} title={title} description="Add a new item to your freelance workspace.">
      <form className="form-stack" onSubmit={submit}>
        {kind === "client" && <>
          <Field label="Client name"><Input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Taylor Morgan" /></Field>
          <Field label="Company"><Input required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company name" /></Field>
          <Field label="Email"><Input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" /></Field>
        </>}
        {kind === "project" && <>
          <Field label="Project name"><Input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Website redesign" /></Field>
          <Field label="Client"><Select value={clientId} onChange={(event) => setClientId(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</Select></Field>
          <div className="form-grid"><Field label="Budget"><Input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="5000" /></Field><Field label="Deadline"><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field></div>
        </>}
        {kind === "task" && <>
          <Field label="Task name"><Input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="What needs to get done?" /></Field>
          <div className="form-grid"><Field label="Project"><Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</Select></Field><Field label="Priority"><Select value={priority} onChange={(event) => setPriority(event.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></Select></Field></div>
          <Field label="Due date"><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field>
        </>}
        {(kind === "proposal" || kind === "invoice") && <>
          {needsName && kind === "proposal" && <Field label="Proposal title"><Input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Product design partnership" /></Field>}
          <Field label="Client"><Select value={clientId} onChange={(event) => setClientId(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</Select></Field>
          <div className="form-grid"><Field label="Amount"><Input required type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="2500" /></Field><Field label={kind === "invoice" ? "Due date" : "Expiry date"}><Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></Field></div>
        </>}
        <div className="modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary"><Plus size={15} />{submitLabel}</Button></div>
      </form>
    </Modal>
  );
}

function ToastStack({ toasts, dismissToast }: { toasts: { id: string; message: string; tone: string }[]; dismissToast: (id: string) => void }) {
  useEffect(() => {
    const timers = toasts.map((toast) => window.setTimeout(() => dismissToast(toast.id), 3600));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismissToast]);
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => <motion.div className={`toast toast-${toast.tone}`} key={toast.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}><span className="toast-check"><Check size={14} /></span><span>{toast.message}</span><button onClick={() => dismissToast(toast.id)} aria-label="Dismiss toast"><X size={14} /></button></motion.div>)}
      </AnimatePresence>
    </div>
  );
}