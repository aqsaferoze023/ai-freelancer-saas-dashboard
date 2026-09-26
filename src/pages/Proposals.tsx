import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock3, FileText, Plus, Search, Send, Sparkles } from "lucide-react";
import { Avatar, Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Panel, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import type { Proposal, ProposalStatus } from "../types";
import { currency, shortDate } from "../utils/format";

const proposalStatuses: ProposalStatus[] = ["Draft", "Sent", "Viewed", "Accepted", "Rejected"];
const statusTone: Record<ProposalStatus, string> = { Draft: "neutral", Sent: "blue", Viewed: "amber", Accepted: "green", Rejected: "rose" };

export default function ProposalsPage() {
  const { proposals, clients, updateProposalStatus, addToast } = useAppStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All proposals");
  const [createOpen, setCreateOpen] = useState(false);
  const [preview, setPreview] = useState<Proposal | null>(null);
  const filtered = useMemo(() => proposals.filter((proposal) => {
    const client = clients.find((item) => item.id === proposal.clientId);
    return `${proposal.title} ${client?.company ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (filter === "All proposals" || proposal.status === filter);
  }), [proposals, clients, filter, search]);
  const activeValue = proposals.filter((proposal) => ["Sent", "Viewed", "Accepted"].includes(proposal.status)).reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <PageHeader eyebrow="WIN BETTER WORK" title="Proposals" description="Share a polished plan, then keep every opportunity moving forward." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={15} />Create proposal</Button>} />
      <div className="finance-summary-grid"><Summary label="Pipeline value" value={currency(activeValue)} sub="Sent, viewed & accepted" icon={Sparkles} tone="wine" /><Summary label="Awaiting response" value={String(proposals.filter((proposal) => proposal.status === "Sent" || proposal.status === "Viewed").length)} sub="Across open proposals" icon={Clock3} tone="amber" /><Summary label="Accepted this quarter" value={String(proposals.filter((proposal) => proposal.status === "Accepted").length)} sub="Ready to get started" icon={Check} tone="green" /><Summary label="Win rate" value="68%" sub="Up 12% this quarter" icon={ArrowRight} tone="blue" /></div>
      <Panel className="data-panel"><div className="list-toolbar"><div className="filter-tabs">{["All proposals", "Draft", "Sent", "Viewed", "Accepted", "Rejected"].map((item) => <button className={`filter-tab ${filter === item ? "active" : ""}`} key={item} onClick={() => setFilter(item)}>{item}<span>{item === "All proposals" ? proposals.length : proposals.filter((proposal) => proposal.status === item).length}</span></button>)}</div><div className="toolbar-controls"><label className="table-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search proposals" aria-label="Search proposals" /></label></div></div>
        {filtered.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Proposal</th><th>Client</th><th>Amount</th><th>Created</th><th>Expires</th><th>Status</th><th className="action-col" /></tr></thead><tbody>{filtered.map((proposal) => { const client = clients.find((item) => item.id === proposal.clientId); return <tr key={proposal.id} className="clickable-row" onClick={() => setPreview(proposal)}><td><div className="table-person proposal-person"><span className="document-mark"><FileText size={15} /></span><div><strong>{proposal.title}</strong><span>Freelance project proposal</span></div></div></td><td><div className="table-person client-mini"><Avatar name={client?.name ?? "Client"} color={client?.color ?? "slate"} size="sm" /><span>{client?.company ?? "Client"}</span></div></td><td><strong className="table-number">{currency(proposal.amount)}</strong></td><td><span className="table-muted">{shortDate(proposal.createdDate)}</span></td><td><span className="table-muted">{shortDate(proposal.expiryDate)}</span></td><td onClick={(event) => event.stopPropagation()}><Select className="status-pill-select" value={proposal.status} aria-label={`Update ${proposal.title} status`} onChange={(event) => { updateProposalStatus(proposal.id, event.target.value as ProposalStatus); addToast("Proposal status updated.", "info"); }}>{proposalStatuses.map((item) => <option key={item}>{item}</option>)}</Select></td><td><button className="row-more" onClick={(event) => { event.stopPropagation(); setPreview(proposal); }} aria-label={`Preview ${proposal.title}`}><ArrowRight size={15} /></button></td></tr>; })}</tbody></table></div> : <EmptyState title="No proposals found" description="Create a proposal when you're ready to turn a conversation into a great project." action={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={14} />Create proposal</Button>} />}
        <div className="table-footer"><span><strong>{filtered.length}</strong> proposals</span><span className="footer-muted">Beautiful proposals help great clients say yes</span></div>
      </Panel>
      <ProposalEditor open={createOpen} onClose={() => setCreateOpen(false)} />
      <ProposalPreview proposal={preview} clientName={clients.find((client) => client.id === preview?.clientId)?.company ?? "Client"} onClose={() => setPreview(null)} />
    </div>
  );
}

function Summary({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Sparkles; tone: string }) {
  return <Panel className="finance-summary"><span className={`summary-icon summary-icon-${tone}`}><Icon size={16} /></span><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></Panel>;
}

function ProposalEditor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, addProposal, addToast } = useAppStore();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("Discovery, project direction, design exploration, and a considered handoff.");
  const [deliverables, setDeliverables] = useState("1. Project kickoff and creative direction\n2. Two focused review rounds\n3. Final, production-ready handoff");
  const [timeline, setTimeline] = useState("4-6 weeks from project kickoff");
  const [pricing, setPricing] = useState("4800");
  const [discount, setDiscount] = useState("0");
  const [terms, setTerms] = useState("50% to begin, with the balance due at final delivery.");
  const amount = Math.max(0, Number(pricing) - Number(discount));

  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date(); const expiry = new Date(now); expiry.setDate(expiry.getDate() + 21);
    const summary = `${description}\n\nScope: ${scope}\n\nDeliverables:\n${deliverables}\n\nTimeline: ${timeline}\n\nTerms: ${terms}`;
    addProposal({ id: `pr-${Date.now()}`, title, clientId, amount, createdDate: now.toISOString(), expiryDate: expiry.toISOString(), status: "Draft", description: summary });
    addToast("Proposal saved as a draft."); onClose(); setTitle(""); setDescription("");
  };

  return <Modal open={open} onClose={onClose} title="Create a proposal" description="Shape the scope and investment, then preview a client-ready document." size="lg"><form className="proposal-editor-layout" onSubmit={save}><div className="proposal-editor-fields"><div className="form-grid"><Field label="Client"><Select value={clientId} onChange={(event) => setClientId(event.target.value)}>{clients.map((client) => <option key={client.id} value={client.id}>{client.company}</option>)}</Select></Field><Field label="Proposal title"><Input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Website redesign & build" /></Field></div><Field label="Project overview"><textarea className="input textarea" required rows={2} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the outcome and why it matters..." /></Field><Field label="Scope of work"><textarea className="input textarea" rows={2} value={scope} onChange={(event) => setScope(event.target.value)} /></Field><Field label="Deliverables"><textarea className="input textarea" rows={3} value={deliverables} onChange={(event) => setDeliverables(event.target.value)} /></Field><div className="form-grid"><Field label="Timeline"><Input value={timeline} onChange={(event) => setTimeline(event.target.value)} /></Field><Field label="Investment"><Input type="number" min="0" value={pricing} onChange={(event) => setPricing(event.target.value)} /></Field></div><div className="form-grid"><Field label="Optional discount"><Input type="number" min="0" value={discount} onChange={(event) => setDiscount(event.target.value)} /></Field><Field label="Terms"><Input value={terms} onChange={(event) => setTerms(event.target.value)} /></Field></div><div className="modal-actions"><Button type="button" onClick={onClose}>Cancel</Button><Button type="submit" variant="primary"><FileText size={14} />Save proposal</Button></div></div><ProposalPreviewCard title={title || "Your proposal title"} client={clients.find((client) => client.id === clientId)?.company ?? "Client name"} description={description || "A clear, thoughtful plan built around your goals."} amount={amount} timeline={timeline} deliverables={deliverables} /></form></Modal>;
}

function ProposalPreviewCard({ title, client, description, amount, timeline, deliverables }: { title: string; client: string; description: string; amount: number; timeline: string; deliverables: string }) {
  return <div className="proposal-preview-sheet"><div className="preview-brand"><span className="brand-symbol preview-brand-symbol"><span /><span /><span /></span><span>FreelanceOS</span></div><div className="preview-document-label">PROJECT PROPOSAL</div><h3>{title}</h3><p className="preview-for">Prepared for <strong>{client}</strong></p><div className="preview-divider" /><div className="preview-section"><span>THE OPPORTUNITY</span><p>{description}</p></div><div className="preview-section"><span>DELIVERABLES</span><p className="preview-preline">{deliverables}</p></div><div className="preview-bottom"><div><small>ESTIMATED TIMELINE</small><strong>{timeline}</strong></div><div><small>PROJECT INVESTMENT</small><strong>{currency(amount)}</strong></div></div><div className="preview-signoff">A good plan for good work. <Sparkles size={12} /></div></div>;
}

function ProposalPreview({ proposal, clientName, onClose }: { proposal: Proposal | null; clientName: string; onClose: () => void }) {
  return <Modal open={Boolean(proposal)} onClose={onClose} title="Proposal preview" description="A client-ready look at this opportunity." size="lg">{proposal && <div className="proposal-detail-preview"><ProposalPreviewCard title={proposal.title} client={clientName} description={proposal.description} amount={proposal.amount} timeline="4-6 weeks from kickoff" deliverables="Strategy and project direction\nDesign exploration and review\nFinal handoff and documentation" /><div className="proposal-preview-meta"><Badge tone={statusTone[proposal.status]}>{proposal.status}</Badge><p>Created {shortDate(proposal.createdDate)} · Expires {shortDate(proposal.expiryDate)}</p><Button variant="primary" onClick={() => { useAppStore.getState().updateProposalStatus(proposal.id, "Sent"); useAppStore.getState().addToast("Proposal marked as sent."); onClose(); }}><Send size={14} />Mark as sent</Button><Button onClick={() => { navigator.clipboard?.writeText(proposal.description); useAppStore.getState().addToast("Proposal details copied.", "info"); }}>Copy proposal text</Button></div></div>}</Modal>;
}