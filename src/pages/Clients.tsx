import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Building2, CalendarDays, Check, ChevronRight, Download, Edit3, FileText, Mail, MoreHorizontal, Phone, Plus, Search, SlidersHorizontal, Upload, UsersRound } from "lucide-react";
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Panel, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { Client, ClientStatus } from "../types";
import { currency, shortDate } from "../utils/format";

const statusTone: Record<ClientStatus, string> = { Active: "green", Lead: "amber", Inactive: "neutral" };

export default function ClientsPage() {
  const { clients, projects, addClient, addToast } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All clients");
  const [gridView, setGridView] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", email: "", phone: "", status: "Lead" as ClientStatus });

  const filtered = useMemo(() => clients.filter((client) => {
    const matchesQuery = `${client.name} ${client.company} ${client.email}`.toLowerCase().includes(search.toLowerCase());
    return matchesQuery && (status === "All clients" || client.status === status);
  }), [clients, search, status]);

  const saveClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client: Client = { ...draft, id: `c-${Date.now()}`, totalRevenue: 0, activeProjects: 0, lastContact: new Date().toISOString(), color: "sage", notes: "" };
    addClient(client);
    addToast(`${client.company} added to your client list.`);
    setCreateOpen(false);
    setDraft({ name: "", company: "", email: "", phone: "", status: "Lead" });
  };

  return (
    <div>
      <PageHeader eyebrow="RELATIONSHIP MANAGEMENT" title="Clients" description="Keep every relationship, project, and conversation in one place." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={15} />Add client</Button>} />
      <div className="client-summary-row">
        <div className="summary-inline"><span className="summary-icon summary-icon-wine"><UsersRound size={17} /></span><div><strong>{clients.length}</strong><span>Total clients</span></div></div>
        <div className="summary-inline"><span className="summary-icon summary-icon-green"><Building2 size={17} /></span><div><strong>{clients.filter((client) => client.status === "Active").length}</strong><span>Active relationships</span></div></div>
        <div className="summary-inline"><span className="summary-icon summary-icon-amber"><ArrowUpRight size={17} /></span><div><strong>{currency(clients.reduce((sum, client) => sum + client.totalRevenue, 0))}</strong><span>Lifetime revenue</span></div></div>
      </div>
      <Panel className="data-panel">
        <div className="list-toolbar">
          <div className="filter-tabs">{["All clients", "Active", "Lead", "Inactive"].map((item) => <button key={item} className={status === item ? "filter-tab active" : "filter-tab"} onClick={() => setStatus(item)}>{item}<span>{item === "All clients" ? clients.length : clients.filter((client) => client.status === item).length}</span></button>)}</div>
          <div className="toolbar-controls"><label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search clients" aria-label="Search clients" /></label><button className="icon-button filter-button" onClick={() => setStatus("All clients")} aria-label="Clear filters"><SlidersHorizontal size={15} /></button><button className={`view-toggle ${gridView ? "view-active" : ""}`} onClick={() => setGridView((value) => !value)} aria-label="Toggle client grid"><span /><span /><span /><span /></button></div>
        </div>
        {!filtered.length ? <EmptyState title="No clients found" description="Try adjusting your search or add a new client to get started." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={14} />Add client</Button>} /> : gridView ? (
          <div className="client-card-grid">{filtered.map((client) => <button className="client-card" key={client.id} onClick={() => navigate(`/clients/${client.id}`)}><div className="client-card-head"><Avatar name={client.name} color={client.color} size="lg" /><Badge tone={statusTone[client.status]}>{client.status}</Badge><MoreHorizontal size={17} className="client-card-more" /></div><strong className="client-card-name">{client.name}</strong><span className="client-card-company">{client.company}</span><div className="client-card-stats"><div><span>Lifetime revenue</span><strong>{currency(client.totalRevenue)}</strong></div><div><span>Active projects</span><strong>{client.activeProjects || projects.filter((project) => project.clientId === client.id && project.status !== "Completed").length}</strong></div></div><div className="client-card-footer"><span><Mail size={12} />{client.email}</span><span>Last contact {shortDate(client.lastContact)}</span></div></button>)}</div>
        ) : (
          <div className="table-scroll"><table className="data-table client-table"><thead><tr><th>Client</th><th>Status</th><th>Projects</th><th>Lifetime revenue</th><th>Last contact</th><th className="action-col" /></tr></thead><tbody>{filtered.map((client) => <tr key={client.id} className="clickable-row" onClick={() => navigate(`/clients/${client.id}`)}><td><div className="table-person"><Avatar name={client.name} color={client.color} /><div><strong>{client.name}</strong><span>{client.company}</span></div></div></td><td><Badge tone={statusTone[client.status]}><span className="tiny-status-dot" />{client.status}</Badge></td><td><span className="table-number">{projects.filter((project) => project.clientId === client.id && project.status !== "Completed").length}<span className="table-muted"> active</span></span></td><td><strong className="table-number">{currency(client.totalRevenue)}</strong></td><td><span className="table-muted">{shortDate(client.lastContact)}</span></td><td><button className="row-more" onClick={(event) => { event.stopPropagation(); navigate(`/clients/${client.id}`); }} aria-label={`View ${client.company}`}><ChevronRight size={16} /></button></td></tr>)}</tbody></table></div>
        )}
        <div className="table-footer"><span>Showing <strong>{filtered.length}</strong> of <strong>{clients.length}</strong> clients</span><button className="text-button" onClick={() => { setSearch(""); setStatus("All clients"); }}>Clear filters</button></div>
      </Panel>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add a client" description="Capture the details you'll need to build a great working relationship.">
        <form className="form-stack" onSubmit={saveClient}>
          <div className="form-grid"><Field label="Contact name"><Input required autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Taylor Morgan" /></Field><Field label="Company"><Input required value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} placeholder="Company name" /></Field></div>
          <Field label="Email"><Input type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="taylor@company.com" /></Field>
          <div className="form-grid"><Field label="Phone"><Input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Optional" /></Field><Field label="Relationship"><Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ClientStatus })}><option>Lead</option><option>Active</option><option>Inactive</option></Select></Field></div>
          <div className="modal-actions"><Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="primary"><Plus size={15} />Add client</Button></div>
        </form>
      </Modal>
    </div>
  );
}

export function ClientDetailPage() {
  const { clientId = "" } = useParams();
  const { clients, projects, invoices, activity, updateClient, addToast } = useAppStore();
  const client = clients.find((item) => item.id === clientId);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Client | null>(null);
  useEffect(() => { if (client && editOpen) setDraft(client); }, [client, editOpen]);
  if (!client) return <div className="not-found"><h1>Client not found</h1><Link to="/clients"><ArrowLeft size={14} />Back to clients</Link></div>;
  const clientProjects = projects.filter((project) => project.clientId === client.id);
  const clientInvoices = invoices.filter((invoice) => invoice.clientId === client.id);
  const relationshipActivity = activity.filter((item) => item.title.toLowerCase().includes(client.company.toLowerCase().split(" ")[0]) || item.detail?.toLowerCase().includes(client.company.toLowerCase().split(" ")[0]));
  const paidInvoices = clientInvoices.filter((invoice) => invoice.status === "Paid");
  const revenueBars = [34, 52, 41, 68, 58, 86];
  const saveClient = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!draft) return; updateClient(draft); addToast(`${draft.company} details updated.`); setEditOpen(false); };

  return (
    <div>
      <Link className="back-link" to="/clients"><ArrowLeft size={14} />All clients</Link>
      <div className="client-detail-head"><div className="client-detail-identity"><Avatar name={client.name} color={client.color} size="lg" /><div><div className="detail-title-row"><h1>{client.company}</h1><Badge tone={statusTone[client.status]}>{client.status}</Badge></div><p>{client.name} · Last contacted {shortDate(client.lastContact)}</p></div></div><Button variant="secondary" onClick={() => setEditOpen(true)}><Edit3 size={14} />Edit client</Button></div>
      <div className="client-detail-grid">
        <div className="client-detail-main">
          <div className="detail-metrics"><Panel className="detail-metric"><span>Total revenue</span><strong>{currency(client.totalRevenue)}</strong><small>Across {clientProjects.length} projects</small></Panel><Panel className="detail-metric"><span>Active projects</span><strong>{clientProjects.filter((project) => project.status !== "Completed").length}</strong><small>{clientProjects.length} total projects</small></Panel><Panel className="detail-metric"><span>Invoices</span><strong>{clientInvoices.length}</strong><small>{currency(clientInvoices.reduce((sum, invoice) => sum + invoice.amount, 0))} billed</small></Panel></div>
          <Panel className="detail-content-panel"><div className="panel-heading"><div><div className="panel-overline">THE WORK</div><h2>Projects</h2></div><Link className="text-link" to="/projects">View all<ArrowUpRight size={13} /></Link></div><div className="detail-project-list">{clientProjects.map((project) => <Link to={`/projects/${project.id}`} className="detail-project-row" key={project.id}><Avatar name={project.name} color={client.color} /><div className="detail-project-main"><strong>{project.name}</strong><span>{project.progress}% complete · Due {shortDate(project.deadline)}</span><div><span style={{ width: `${project.progress}%` }} /></div></div><Badge tone={project.status === "Review" ? "amber" : project.status === "In Progress" ? "green" : "neutral"}>{project.status}</Badge></Link>)}{!clientProjects.length && <p className="muted-copy">No projects for this client yet.</p>}</div></Panel>
          <Panel className="detail-content-panel"><div className="panel-heading"><div><div className="panel-overline">BILLING</div><h2>Recent invoices</h2></div><Link className="text-link" to="/invoices">Open invoices<ArrowUpRight size={13} /></Link></div><div className="detail-invoice-list">{clientInvoices.map((invoice) => <div className="detail-invoice-row" key={invoice.id}><span className="invoice-number-mark"><FileText size={14} /></span><div><strong>{invoice.number}</strong><span>Due {shortDate(invoice.dueDate)}</span></div><strong>{currency(invoice.amount)}</strong><Badge tone={invoice.status === "Paid" ? "green" : invoice.status === "Overdue" ? "rose" : "amber"}>{invoice.status}</Badge></div>)}{!clientInvoices.length && <p className="muted-copy">No invoices have been created for this client.</p>}</div></Panel>
          <Panel className="detail-content-panel"><div className="panel-heading"><div><div className="panel-overline">PAYMENT HISTORY</div><h2>Payments received</h2></div><span className="payment-total">{currency(paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0))} total</span></div>{paidInvoices.length ? <div className="detail-invoice-list">{paidInvoices.map((invoice) => <div className="detail-invoice-row" key={invoice.id}><span className="payment-check-mark"><Check size={13} /></span><div><strong>{invoice.number}</strong><span>Paid {shortDate(invoice.issueDate)}</span></div><strong>{currency(invoice.amount)}</strong><Badge tone="green">Received</Badge></div>)}</div> : <p className="muted-copy">Payments will appear here once invoices are marked as paid.</p>}</Panel>
          <Panel className="detail-content-panel revenue-history-panel"><div className="panel-heading"><div><div className="panel-overline">A LONGER VIEW</div><h2>Revenue history</h2></div><span className="revenue-history-total">{currency(client.totalRevenue)} lifetime</span></div><div className="client-revenue-bars">{revenueBars.map((value, index) => <div key={index}><span style={{ height: `${value}%` }} /><small>{["Dec", "Jan", "Feb", "Mar", "Apr", "May"][index]}</small></div>)}</div></Panel>
        </div>
        <aside className="client-detail-aside"><Panel className="contact-panel"><div className="panel-heading"><div><div className="panel-overline">CLIENT PROFILE</div><h2>Contact info</h2></div></div><div className="contact-lines"><a href={`mailto:${client.email}`}><Mail size={15} /><span><small>Email</small>{client.email}</span></a><a href={`tel:${client.phone}`}><Phone size={15} /><span><small>Phone</small>{client.phone || "Not provided"}</span></a><div><Building2 size={15} /><span><small>Company</small>{client.company}</span></div><div><CalendarDays size={15} /><span><small>Last contact</small>{shortDate(client.lastContact)}</span></div></div><Button className="full-width" onClick={() => addToast(`Email composer opened for ${client.name}.`, "info")}><Mail size={14} />Send an email</Button></Panel><Panel className="notes-panel"><div className="panel-heading"><div><div className="panel-overline">PRIVATE TO YOU</div><h2>Notes</h2></div><button className="row-more" onClick={() => addToast("Notes editor opened.", "info")} aria-label="Edit notes"><MoreHorizontal size={16} /></button></div><p>{client.notes || "No notes added yet."}</p><button className="inline-edit-link" onClick={() => addToast("Notes editor opened.", "info")}>Edit notes <ArrowUpRight size={12} /></button></Panel><Panel className="notes-panel"><div className="panel-heading"><div><div className="panel-overline">CLIENT FILES</div><h2>Shared files</h2></div><button className="row-more" onClick={() => addToast("File upload is ready to connect.", "info")} aria-label="Upload file"><Upload size={14} /></button></div><div className="client-file-row"><span><FileText size={14} /></span><div><strong>Project brief.pdf</strong><small>PDF document · 2.4 MB</small></div><button onClick={() => addToast("File download is not connected in this demo.", "info")} aria-label="Download project brief"><Download size={13} /></button></div><div className="client-file-row"><span><FileText size={14} /></span><div><strong>Brand assets.zip</strong><small>ZIP archive · 8.1 MB</small></div><button onClick={() => addToast("File download is not connected in this demo.", "info")} aria-label="Download brand assets"><Download size={13} /></button></div></Panel><Panel className="notes-panel"><div className="panel-heading"><div><div className="panel-overline">RECENT TOUCHPOINTS</div><h2>Communication</h2></div></div>{relationshipActivity.length ? relationshipActivity.map((item) => <div className="communication-row" key={item.id}><span className="communication-dot" /><div><strong>{item.title}</strong><small>{item.time}</small></div></div>) : <p className="muted-copy">Your conversations with {client.name} will show here.</p>}</Panel></aside>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit client details" description="Keep your relationship details current."><form className="form-stack" onSubmit={saveClient}>{draft && <><div className="form-grid"><Field label="Contact name"><Input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Company"><Input required value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} /></Field></div><Field label="Email"><Input type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></Field><div className="form-grid"><Field label="Phone"><Input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></Field><Field label="Status"><Select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ClientStatus })}><option>Active</option><option>Lead</option><option>Inactive</option></Select></Field></div><Field label="Private notes"><textarea className="input textarea" rows={3} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></Field></>}<div className="modal-actions"><Button type="button" onClick={() => setEditOpen(false)}>Cancel</Button><Button type="submit" variant="primary"><Check size={14} />Save details</Button></div></form></Modal>
    </div>
  );
}