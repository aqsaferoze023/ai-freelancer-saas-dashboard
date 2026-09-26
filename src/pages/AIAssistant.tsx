import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight, Bot, Clipboard, Clock3, FileText, Lightbulb, LoaderCircle, Mail, MessageCircle, RefreshCw, Send, Sparkles, WandSparkles } from "lucide-react";
import { Avatar, Badge, Button, Field, Input, Panel, Select } from "../components/ui";
import { useAppStore } from "../store/useAppStore";
import { generateAssistantResponse, type AssistantAction } from "../services/aiService";
import { currency } from "../utils/format";

interface ChatMessage { id: string; role: "assistant" | "user"; text: string; time: string; }

const workflowOptions: { id: AssistantAction; title: string; description: string; icon: typeof Sparkles }[] = [
  { id: "briefing", title: "Daily briefing", description: "See what deserves your attention today.", icon: Lightbulb },
  { id: "proposal", title: "Proposal generator", description: "Turn a project idea into a clear scope.", icon: FileText },
  { id: "email", title: "Client email", description: "Write polished client communication.", icon: Mail },
  { id: "planner", title: "Project planner", description: "Break big work into manageable steps.", icon: WandSparkles },
  { id: "reminder", title: "Invoice follow-up", description: "Nudge overdue invoices with care.", icon: Clock3 },
];

const initialMessage: ChatMessage = { id: "briefing-welcome", role: "assistant", time: "9:04 AM", text: "Your AI briefing\n\nYou have 3 tasks due today, one overdue invoice worth $2,400, and your NovaBrand project is approaching its deadline in 10 days. Your highest-impact next step is to send the FitTrack review notes before the afternoon design block.\n\nWant me to help shape your next step?" };

export default function AIAssistantPage() {
  const { clients, invoices, addToast } = useAppStore();
  const [action, setAction] = useState<AssistantAction>("briefing");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestText, setRequestText] = useState("");
  const [clientName, setClientName] = useState(clients[0]?.company ?? "");
  const [projectName, setProjectName] = useState("");
  const [budget, setBudget] = useState("");
  const [emailType, setEmailType] = useState("Follow-up email");
  const [selectedInvoice, setSelectedInvoice] = useState(invoices.find((invoice) => invoice.status === "Overdue")?.id ?? "");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const generate = async (prompt: string, showUser = true, workflow: AssistantAction = action) => {
    const cleaned = prompt.trim();
    if (!cleaned && workflow !== "briefing" && workflow !== "reminder") return;
    const invoice = invoices.find((item) => item.id === selectedInvoice);
    const contextualPrompt = workflow === "proposal"
      ? `${clientName}; ${projectName || cleaned}; budget ${budget || "to be scoped"}; ${cleaned}`
      : workflow === "email"
        ? `${emailType} for ${clientName}. ${cleaned}`
        : workflow === "planner"
          ? cleaned
          : workflow === "reminder"
            ? `${invoice?.number ?? "Overdue invoice"} for ${currency(invoice?.amount ?? 2400)} at ${clients.find((item) => item.id === invoice?.clientId)?.company ?? "your client"}`
            : cleaned;
    const promptToShow = workflow === "reminder" ? `Draft a polite reminder for ${invoice?.number ?? "the overdue invoice"} (${currency(invoice?.amount ?? 2400)}).` : workflow === "briefing" && !cleaned ? "What should I focus on today?" : cleaned || contextualPrompt;
    setRequestText(contextualPrompt);
    if (showUser) setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: promptToShow, time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()) }]);
    setInput(""); setLoading(true);
    try {
      const response = await generateAssistantResponse({ action: workflow, prompt: contextualPrompt });
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", text: response, time: new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date()) }]);
    } catch {
      addToast("The AI service could not respond. Please try again.", "error");
    } finally { setLoading(false); }
  };

  const active = workflowOptions.find((item) => item.id === action) ?? workflowOptions[0];
  const send = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); void generate(input); };
  const promptSuggestions: Record<AssistantAction, string[]> = {
    briefing: ["What should I focus on first?", "Summarize my overdue invoices", "Help me plan my week"],
    proposal: ["Make it warm and collaborative", "Focus on the business outcomes", "Include a phased rollout"],
    email: ["Keep it friendly and concise", "Make this sound more confident", "Add a clear next step"],
    planner: ["Include review milestones", "Add a little buffer for feedback", "Make a four-week plan"],
    reminder: ["Keep it warm and low-pressure", "Mention the invoice link", "Make it more direct"],
  };

  return (
    <div>
      <div className="ai-page-heading"><div><div className="eyebrow"><Sparkles size={12} /> YOUR CREATIVE PARTNER</div><h1>AI workspace</h1><p>Less admin. More thoughtful work. A helpful second brain for your business.</p></div><Badge tone="green"><span className="tiny-status-dot" />Private workspace</Badge></div>
      <div className="ai-workspace-layout"><aside className="ai-workflows"><div className="ai-workflow-label">WORKFLOWS</div>{workflowOptions.map(({ id, title, description, icon: Icon }) => <button className={`ai-workflow-option ${action === id ? "ai-workflow-active" : ""}`} key={id} onClick={() => setAction(id)}><span className="ai-workflow-icon"><Icon size={16} /></span><span><strong>{title}</strong><small>{description}</small></span>{action === id && <ArrowRight size={14} />}</button>)}<Panel className="ai-privacy-note"><span><Bot size={17} /></span><strong>Your work stays yours.</strong><p>AI responses are generated from your prompt and demo workspace data.</p><button onClick={() => addToast("Privacy controls are ready to connect to your workspace settings.", "info")}>Privacy settings<ArrowRight size={12} /></button></Panel></aside>
        <Panel className="ai-chat-panel"><div className="ai-chat-header"><div className="ai-assistant-avatar"><Bot size={20} /></div><div><div className="ai-chat-title-row"><h2>{active.title}</h2><span className="ai-online-indicator" /></div><p>{active.description}</p></div><button className="ai-chat-more" onClick={() => { setMessages([initialMessage]); addToast("Conversation reset.", "info"); }} aria-label="Reset conversation"><RefreshCw size={15} /></button></div>
          {(action === "proposal" || action === "email" || action === "reminder") && <div className="ai-context-bar">{action === "proposal" && <><Field label="CLIENT"><Select value={clientName} onChange={(event) => setClientName(event.target.value)}>{clients.map((client) => <option key={client.id}>{client.company}</option>)}</Select></Field><Field label="PROJECT"><Input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Website redesign" /></Field><Field label="BUDGET"><Input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="$4,800" /></Field></>}{action === "email" && <><Field label="EMAIL TYPE"><Select value={emailType} onChange={(event) => setEmailType(event.target.value)}><option>Follow-up email</option><option>Payment reminder</option><option>Project update</option><option>Meeting request</option><option>Thank-you message</option></Select></Field><Field label="CLIENT"><Select value={clientName} onChange={(event) => setClientName(event.target.value)}>{clients.map((client) => <option key={client.id}>{client.company}</option>)}</Select></Field></>}{action === "reminder" && <Field label="OVERDUE INVOICE"><Select value={selectedInvoice} onChange={(event) => setSelectedInvoice(event.target.value)}>{invoices.filter((invoice) => invoice.status === "Overdue").map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number} · {currency(invoice.amount)}</option>)}</Select></Field>}</div>}
          <div className="ai-messages"><div className="ai-date-divider"><span>Today</span></div><div className="assistant-message"><span className="assistant-message-icon"><Sparkles size={14} /></span><div className="assistant-message-body"><div className="assistant-message-meta"><strong>FreelanceOS AI</strong><time>9:04 AM</time></div><div className="message-prose">{initialMessage.text.split("\n").map((line, index) => line ? <p key={index}>{line}</p> : <br key={index} />)}</div><div className="message-actions"><button onClick={() => { navigator.clipboard?.writeText(initialMessage.text); addToast("Briefing copied to clipboard.", "info"); }}><Clipboard size={12} />Copy</button><button onClick={() => void generate("", false)}><RefreshCw size={12} />Regenerate</button></div></div></div>{messages.slice(1).map((message) => message.role === "user" ? <div className="user-message" key={message.id}><div className="user-message-copy"><p>{message.text}</p><time>{message.time}</time></div><Avatar name="Alex Carter" color="profile" size="sm" /></div> : <div className="assistant-message" key={message.id}><span className="assistant-message-icon"><Sparkles size={14} /></span><div className="assistant-message-body"><div className="assistant-message-meta"><strong>FreelanceOS AI</strong><time>{message.time}</time></div><div className="message-prose">{message.text.split("\n").map((line, index) => line ? <p key={index}>{line.startsWith("#") ? <strong>{line.replace(/^#+\s*/, "")}</strong> : line}</p> : <br key={index} />)}</div><div className="message-actions"><button onClick={() => { navigator.clipboard?.writeText(message.text); addToast("Response copied to clipboard.", "info"); }}><Clipboard size={12} />Copy</button><button onClick={() => void generate(requestText, false)}><RefreshCw size={12} />Regenerate</button></div></div></div>)}{loading && <div className="assistant-message loading-message"><span className="assistant-message-icon"><Sparkles size={14} /></span><div className="assistant-message-body"><div className="assistant-message-meta"><strong>FreelanceOS AI</strong><span className="typing-dots"><i /><i /><i /></span></div><p>Thinking through your request...</p></div></div>}<div ref={endRef} /></div>
          <div className="ai-prompt-suggestions"><span>Try asking</span>{promptSuggestions[action].map((prompt) => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}<ArrowDown size={11} /></button>)}</div>
          <form className="ai-composer" onSubmit={send}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={action === "proposal" ? "Share the project requirements and goals..." : action === "planner" ? "Describe the project and what needs to happen..." : action === "email" ? "Add a little context for this email..." : "Ask anything about your freelance business..."} rows={2} /><div className="ai-composer-bottom"><span><Sparkles size={12} />AI can make mistakes. Review before sharing.</span><Button variant="primary" size="sm" type="submit" disabled={loading || (!input.trim() && action !== "briefing" && action !== "reminder")}><span>{loading ? "Thinking" : "Generate"}</span>{loading ? <LoaderCircle size={14} className="spin-icon" /> : <Send size={14} />}</Button></div></form>
        </Panel>
        <aside className="ai-side-notes"><Panel className="ai-side-card"><div className="ai-side-icon"><MessageCircle size={16} /></div><span>YOUR AI BRIEFING</span><h3>A little more clarity, every day.</h3><p>Understand your priorities, client follow-ups, and cash flow in one quick read.</p><button onClick={() => { setAction("briefing"); void generate("What should I focus on today?", true, "briefing"); }}>Refresh today's briefing<ArrowRight size={13} /></button></Panel><Panel className="ai-side-card recent-ai-card"><div className="panel-overline">RECENT WORK</div><h3>Continue where you left off</h3><div className="recent-ai-row"><span><FileText size={14} /></span><div><strong>Acme website proposal</strong><small>Proposal · 2 hours ago</small></div><ArrowRight size={13} /></div><div className="recent-ai-row"><span><Mail size={14} /></span><div><strong>NovaBrand progress update</strong><small>Client email · Yesterday</small></div><ArrowRight size={13} /></div><button className="ai-history-link" onClick={() => addToast("Conversation history opened.", "info")}>View all history<ArrowRight size={12} /></button></Panel><div className="ai-suggestion-quote"><span>✦</span><p>“A good system makes the important work feel a little lighter.”</p><small>AI workspace note</small></div></aside></div>
    </div>
  );
}