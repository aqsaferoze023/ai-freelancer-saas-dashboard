import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderKanban,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ActivityFeed } from "../components/ActivityFeed";
import { ProjectRows } from "../components/ProjectRows";
import { RevenueChart } from "../components/Charts";
import { StatCard } from "../components/StatCard";
import { Badge, Panel, SectionHeading } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { currency, shortDate } from "../utils/format";

const chartPeriods = ["7D", "30D", "3M", "12M"];

function getWeekRange() {
  const now = new Date();
  const monday = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7;
  monday.setDate(now.getDate() - dayOfWeek);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const formatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const first = formatter.format(monday);
  const last = formatter.format(sunday);
  return `${first} - ${last}, ${sunday.getFullYear()}`;
}

export default function Dashboard() {
  const { clients, projects, tasks, invoices, proposals, events, activity, toggleTask, addToast } = useAppStore();
  const [period, setPeriod] = useState("30D");
  const [range, setRange] = useState("This week");
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [rangeMenu, setRangeMenu] = useState(false);
  const visibleProjects = useMemo(() => projects.filter((project) => !project.archived && project.status !== "Completed"), [projects]);
  const todayTasks = useMemo(() => {
    const today = new Date();
    const minuteOfDay = (value: string) => {
      const [clock, meridiem] = value.split(" ");
      const [hourValue, minuteValue] = clock.split(":").map(Number);
      const hour = (hourValue % 12) + (meridiem === "PM" ? 12 : 0);
      return hour * 60 + minuteValue;
    };
    return tasks.filter((task) => {
      const date = new Date(task.dueDate);
      return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }).sort((a, b) => minuteOfDay(a.dueTime) - minuteOfDay(b.dueTime));
  }, [tasks]);
  const overdue = invoices.filter((invoice) => invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
  const openInvoiceTotal = invoices.filter((invoice) => invoice.status === "Pending" || invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
  const dateKicker = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" }).format(new Date()).toUpperCase();
  const rangeLabel = range === "This week" ? getWeekRange() : range === "This month" ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date()) : `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  const todayKey = new Date().toISOString().slice(0, 10);
  const deadlines = useMemo(() => events.filter((event) => new Date(event.date).toISOString().slice(0, 10) >= todayKey).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 4), [events, todayKey]);

  const handleTaskToggle = (id: string) => {
    toggleTask(id);
    addToast("Task status updated.");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <div className="dashboard-kicker"><span className="status-pulse" />{dateKicker}<span className="kicker-divider">/</span>YOUR WORKSPACE</div>
          <h1>Good morning, Alex <span className="wave">👋</span></h1>
          <p>Here's what's happening with your freelance business.</p>
        </div>
        <div className="dashboard-date-wrap">
          <button className="date-select" onClick={() => setRangeMenu((open) => !open)}><CalendarDays size={15} /><span>{rangeLabel}</span><ChevronDown size={14} /></button>
          {rangeMenu && <div className="date-range-menu"><strong>Overview period</strong>{[{ label: "This week", value: "7D" }, { label: "This month", value: "30D" }, { label: "This quarter", value: "3M" }].map((item) => <button key={item.value} onClick={() => { setRange(item.label); setPeriod(item.value); setRangeMenu(false); addToast(`${item.label} overview selected.`, "info"); }}>{item.label}<ArrowRight size={12} /></button>)}</div>}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total revenue" value="$12,480" change="18.4%" detail="this month" icon={CircleDollarSign} tone="sage" index={0} />
        <StatCard label="Outstanding invoices" value="$3,250" change="12.6%" detail="vs. last month" icon={FileText} tone="rose" trend="down" index={1} />
        <StatCard label="Active projects" value={String(visibleProjects.length)} change="25.0%" detail="vs. last month" icon={FolderKanban} tone="olive" index={2} />
        <StatCard label="Hours this month" value="128h" change="32.7%" detail="vs. last month" icon={Clock3} tone="butter" index={3} />
      </div>

      <div className="dashboard-layout">
        <div className="dashboard-center">
          <div className="dashboard-primary-grid">
            <div className="dashboard-main-column">
              <Panel className="revenue-panel">
                <div className="panel-heading chart-heading">
                  <div><div className="panel-overline">YOUR BUSINESS</div><SectionHeading title="Revenue overview" /></div>
                  <div className="period-control" role="group" aria-label="Revenue chart period">{chartPeriods.map((item) => <button key={item} className={period === item ? "period-active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>
                </div>
                <div className="chart-legend"><span><i className="legend-dot revenue-dot" />Revenue</span><span><i className="legend-dot expense-dot" />Expenses</span><span><i className="legend-dot profit-dot" />Profit</span></div>
                <RevenueChart period={period} />
                <div className="chart-footnote"><span><span className="chart-live-dot" />Updated just now</span><button onClick={() => addToast("Your revenue report is ready to export.", "info")}>View report <ArrowUpRight size={12} /></button></div>
              </Panel>

              <Panel className="task-panel">
                <div className="panel-heading task-heading"><div><div className="panel-overline">STAY IN FLOW</div><SectionHeading title="Today's tasks" /></div><Link className="text-link" to="/tasks">See all<ArrowRight size={13} /></Link></div>
                <div className="task-table-wrap">
                  <table className="task-table">
                    <thead><tr><th className="check-column">Task</th><th>Project</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                    <tbody>
                      {(showAllTasks ? todayTasks : todayTasks.slice(0, 6)).map((task) => {
                        const project = projects.find((item) => item.id === task.projectId);
                        const isDone = task.status === "Done";
                        return <tr key={task.id} className={isDone ? "task-complete" : ""}>
                          <td><button className={`task-check ${isDone ? "checked" : ""}`} onClick={() => handleTaskToggle(task.id)} aria-label={`${isDone ? "Reopen" : "Complete"} ${task.title}`}>{isDone && <Check size={12} />}</button><span className="task-title-cell">{task.title}</span></td>
                          <td><span className="task-project-cell">{project?.name ?? "General"}</span></td>
                          <td><Badge tone={`priority-${task.priority.toLowerCase()}`}>{task.priority}</Badge></td>
                          <td><span className="task-due-cell">{task.dueTime}</span></td>
                          <td><Badge tone={isDone ? "green" : task.status === "In Progress" ? "blue" : "neutral"}><span className="tiny-status-dot" />{isDone ? "Done" : task.status === "In Progress" ? "In progress" : "To do"}</Badge></td>
                        </tr>;
                      })}
                      {!todayTasks.length && <tr><td colSpan={5} className="table-empty">No tasks due today. Enjoy the breathing room.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {todayTasks.length > 6 && <button className="show-more-tasks" onClick={() => setShowAllTasks((value) => !value)}>{showAllTasks ? "Show fewer" : `Show ${todayTasks.length - 6} more tasks`}<ChevronDown size={13} /></button>}
              </Panel>
              <div className="quick-stats-row">
                <QuickStat icon={UsersRound} label="Total clients" value={String(clients.length)} sub="4 active" tone="sage" />
                <QuickStat icon={FileText} label="Open invoices" value={String(invoices.filter((invoice) => invoice.status === "Pending" || invoice.status === "Overdue").length)} sub={currency(openInvoiceTotal)} tone="rose" />
                <QuickStat icon={Sparkles} label="Proposals" value={String(proposals.length)} sub="2 awaiting" tone="olive" />
                <QuickStat icon={Clock3} label="Billable hours" value="412h" sub="year to date" tone="butter" />
              </div>
            </div>

            <div className="dashboard-side-column">
              <Panel className="projects-panel">
                <div className="panel-heading"><div><div className="panel-overline">IN MOTION</div><SectionHeading title="Active projects" /></div><Link className="icon-link" to="/projects" aria-label="View all projects"><ArrowRight size={15} /></Link></div>
                <ProjectRows projects={visibleProjects} clients={clients} limit={4} />
                <Link to="/projects" className="panel-bottom-link">View all projects<ArrowRight size={13} /></Link>
              </Panel>
              <Panel className="activity-panel">
                <div className="panel-heading"><div><div className="panel-overline">WHAT'S HAPPENING</div><SectionHeading title="Recent activity" /></div><Link className="icon-link" to="/clients" aria-label="View client activity"><ArrowRight size={15} /></Link></div>
                <ActivityFeed items={activity.slice(0, 5)} compact />
              </Panel>
            </div>
          </div>
        </div>

        <aside className="dashboard-rail">
          <Link to="/ai-assistant" className="ai-promo">
            <div className="ai-promo-copy"><span className="ai-promo-label"><Sparkles size={14} /> YOUR AI CO-PILOT</span><h2>Clear the busywork.<br />Make room for good work.</h2><p>Turn ideas into plans, proposals and polished client emails.</p><span className="ai-promo-button">Open AI workspace<ArrowRight size={13} /></span></div>
            <div className="ai-bot-mark"><Bot size={30} strokeWidth={1.35} /></div>
            <span className="ai-promo-spark spark-one">✦</span><span className="ai-promo-spark spark-two">✧</span>
          </Link>

          <Panel className="deadlines-panel">
            <div className="panel-heading"><div><div className="panel-overline">KEEP THE MOMENTUM</div><SectionHeading title="Coming up" /></div><Link className="icon-link" to="/calendar" aria-label="Open calendar"><ArrowRight size={15} /></Link></div>
            <div className="deadline-list">
              {deadlines.map((event) => {
                const project = projects.find((item) => item.id === event.projectId);
                const client = clients.find((item) => item.id === event.clientId);
                return <div className="deadline-row" key={event.id}><div className={`deadline-marker deadline-${event.type.toLowerCase()}`}><span /></div><div className="deadline-copy"><span className="deadline-date">{shortDate(event.date)}</span><strong>{event.title}</strong><small>{project?.name ?? client?.company ?? event.type}</small></div>{event.time && <span className="deadline-time">{event.time}</span>}</div>;
              })}
              {!deadlines.length && <p className="muted-copy">No upcoming events on your calendar.</p>}
            </div>
            <Link to="/calendar" className="panel-bottom-link">Open calendar<ArrowRight size={13} /></Link>
          </Panel>

          <Panel className="focus-panel">
            <div className="focus-icon"><Sparkles size={16} /></div><div className="focus-copy"><span>ONE GOOD NEXT STEP</span><strong>Follow up on overdue invoices</strong><p>You have {currency(overdue)} waiting. A friendly nudge keeps cash flow moving.</p><Link to="/ai-assistant">Draft a reminder<ArrowRight size={12} /></Link></div>
          </Panel>
          <div className="dashboard-quote"><span>“</span><p>Keep going, Alex.<br />You're doing great work.</p><small>Small steps make big things.</small></div>
        </aside>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, sub, tone }: { icon: typeof UsersRound; label: string; value: string; sub: string; tone: string }) {
  return <Panel className="quick-stat"><span className={`quick-stat-icon stat-icon-${tone}`}><Icon size={16} /></span><div><span className="quick-stat-label">{label}</span><div className="quick-stat-value-row"><strong>{value}</strong><span>{sub}</span></div></div></Panel>;
}