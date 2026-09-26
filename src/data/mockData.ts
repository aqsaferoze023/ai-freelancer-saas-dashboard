import type {
  Activity,
  CalendarEvent,
  Client,
  Invoice,
  NotificationItem,
  Project,
  Proposal,
  Task,
  TimeEntry,
  User,
} from "../types";

const day = (offset: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString();
};

export const currentUser: User = {
  id: "u-alex",
  name: "Alex Carter",
  email: "alex@freelanceos.com",
  role: "Independent designer",
  avatar: "AC",
};

export const seedClients: Client[] = [
  { id: "c-nova", name: "Maya Chen", company: "NovaBrand Inc.", email: "maya@novabrand.co", phone: "+1 (415) 555-0142", status: "Active", totalRevenue: 18400, activeProjects: 2, lastContact: day(-1), color: "rose", notes: "Brand refresh and web launch. Prefers async updates on Slack." },
  { id: "c-fit", name: "Jordan Lee", company: "FitTrack Co.", email: "jordan@fittrack.io", phone: "+1 (212) 555-0185", status: "Active", totalRevenue: 12600, activeProjects: 1, lastContact: day(-2), color: "sage", notes: "Mobile product team. Weekly check-ins on Tuesdays." },
  { id: "c-lumina", name: "Priya Kapoor", company: "Lumina Tech", email: "priya@luminatech.com", phone: "+1 (646) 555-0161", status: "Active", totalRevenue: 23200, activeProjects: 1, lastContact: day(-3), color: "violet", notes: "Long-term SaaS partner. Send invoices to finance@luminatech.com." },
  { id: "c-acme", name: "Marcus Reed", company: "Acme Corporation", email: "marcus@acmecorp.com", phone: "+1 (312) 555-0108", status: "Lead", totalRevenue: 4200, activeProjects: 1, lastContact: day(-4), color: "amber", notes: "Interested in a marketing site and campaign landing pages." },
  { id: "c-bright", name: "Sofia Martinez", company: "BrightMind Studio", email: "sofia@brightmind.studio", phone: "+1 (206) 555-0133", status: "Active", totalRevenue: 8900, activeProjects: 1, lastContact: day(-6), color: "sky", notes: "Small team with quick feedback cycles." },
  { id: "c-pixel", name: "Ethan Brooks", company: "Pixel & Co.", email: "ethan@pixeland.co", phone: "+1 (512) 555-0170", status: "Inactive", totalRevenue: 5600, activeProjects: 0, lastContact: day(-24), color: "slate", notes: "Past identity project. Check in next quarter." },
];

export const seedProjects: Project[] = [
  { id: "p-nova", name: "NovaBrand Website", clientId: "c-nova", status: "In Progress", progress: 75, deadline: day(10), budget: 6400, amountPaid: 4800, description: "A confident, conversion-focused brand website for NovaBrand's next chapter.", hours: 42, team: ["AC", "JM"] },
  { id: "p-fit", name: "FitTrack Mobile App", clientId: "c-fit", status: "Review", progress: 45, deadline: day(23), budget: 5000, amountPaid: 2200, description: "Product design for a habit-building fitness companion.", hours: 36, team: ["AC", "JL"] },
  { id: "p-lumina", name: "Lumina SaaS Dashboard", clientId: "c-lumina", status: "In Progress", progress: 90, deadline: day(36), budget: 8000, amountPaid: 7500, description: "An approachable analytics experience for growing teams.", hours: 64, team: ["AC"] },
  { id: "p-acme", name: "Acme Marketing Website", clientId: "c-acme", status: "Planning", progress: 20, deadline: day(46), budget: 6000, amountPaid: 1200, description: "A new digital storefront for Acme's business services.", hours: 12, team: ["AC", "MR"] },
  { id: "p-bright", name: "BrightMind Brand Refresh", clientId: "c-bright", status: "On Hold", progress: 55, deadline: day(54), budget: 3200, amountPaid: 1600, description: "A warmer visual identity system and launch-ready brand kit.", hours: 19, team: ["AC"] },
];

export const seedTasks: Task[] = [
  { id: "t-1", title: "Design homepage mockup", projectId: "p-nova", priority: "High", dueTime: "9:00 AM", dueDate: day(0), status: "Done" },
  { id: "t-2", title: "Client meeting (FitTrack)", projectId: "p-fit", priority: "Medium", dueTime: "11:00 AM", dueDate: day(0), status: "In Progress" },
  { id: "t-3", title: "Write proposal", projectId: "p-acme", priority: "High", dueTime: "2:00 PM", dueDate: day(0), status: "To Do" },
  { id: "t-4", title: "Update project documentation", projectId: "p-lumina", priority: "Low", dueTime: "4:00 PM", dueDate: day(0), status: "To Do" },
  { id: "t-5", title: "Send invoice reminder", projectId: "p-nova", priority: "Urgent", dueTime: "5:00 PM", dueDate: day(0), status: "To Do" },
  { id: "t-6", title: "Prepare sprint handoff", projectId: "p-fit", priority: "Medium", dueTime: "6:00 PM", dueDate: day(0), status: "To Do" },
  { id: "t-7", title: "Polish mobile navigation", projectId: "p-nova", priority: "High", dueTime: "10:30 AM", dueDate: day(1), status: "To Do" },
  { id: "t-8", title: "Review onboarding flow", projectId: "p-fit", priority: "Medium", dueTime: "1:00 PM", dueDate: day(1), status: "To Do" },
  { id: "t-9", title: "Export illustration set", projectId: "p-lumina", priority: "Low", dueTime: "3:00 PM", dueDate: day(1), status: "To Do" },
  { id: "t-10", title: "Share homepage concepts", projectId: "p-nova", priority: "High", dueTime: "11:00 AM", dueDate: day(2), status: "To Do" },
  { id: "t-11", title: "Map account settings", projectId: "p-fit", priority: "Medium", dueTime: "2:30 PM", dueDate: day(2), status: "To Do" },
  { id: "t-12", title: "QA dashboard filters", projectId: "p-lumina", priority: "Urgent", dueTime: "4:00 PM", dueDate: day(3), status: "To Do" },
  { id: "t-13", title: "Review copy with Maya", projectId: "p-nova", priority: "Medium", dueTime: "10:00 AM", dueDate: day(3), status: "To Do" },
  { id: "t-14", title: "Create project timeline", projectId: "p-acme", priority: "Low", dueTime: "1:00 PM", dueDate: day(4), status: "To Do" },
  { id: "t-15", title: "Prototype activity feed", projectId: "p-lumina", priority: "High", dueTime: "3:00 PM", dueDate: day(4), status: "To Do" },
  { id: "t-16", title: "Confirm testing plan", projectId: "p-fit", priority: "Medium", dueTime: "11:30 AM", dueDate: day(5), status: "To Do" },
  { id: "t-17", title: "Audit brand assets", projectId: "p-bright", priority: "Low", dueTime: "2:00 PM", dueDate: day(6), status: "To Do" },
  { id: "t-18", title: "Send monthly update", projectId: "p-nova", priority: "High", dueTime: "9:30 AM", dueDate: day(7), status: "To Do" },
  { id: "t-19", title: "Finalize empty states", projectId: "p-lumina", priority: "Medium", dueTime: "1:30 PM", dueDate: day(8), status: "To Do" },
  { id: "t-20", title: "Invoice final milestone", projectId: "p-fit", priority: "High", dueTime: "4:30 PM", dueDate: day(9), status: "To Do" },
];

export const seedInvoices: Invoice[] = [
  { id: "i-1", number: "INV-1042", clientId: "c-nova", projectId: "p-nova", amount: 850, issueDate: day(-12), dueDate: day(8), status: "Paid", items: [{ id: "ii-1", description: "Homepage design milestone", quantity: 1, rate: 850 }] },
  { id: "i-2", number: "INV-1041", clientId: "c-fit", projectId: "p-fit", amount: 1250, issueDate: day(-9), dueDate: day(5), status: "Pending", items: [{ id: "ii-2", description: "Product design sprint", quantity: 10, rate: 125 }] },
  { id: "i-3", number: "INV-1040", clientId: "c-lumina", projectId: "p-lumina", amount: 2400, issueDate: day(-22), dueDate: day(-4), status: "Overdue", items: [{ id: "ii-3", description: "Dashboard design milestone", quantity: 1, rate: 2400 }] },
  { id: "i-4", number: "INV-1039", clientId: "c-nova", projectId: "p-nova", amount: 1800, issueDate: day(-30), dueDate: day(-12), status: "Paid", items: [{ id: "ii-4", description: "Brand strategy and direction", quantity: 12, rate: 150 }] },
  { id: "i-5", number: "INV-1038", clientId: "c-acme", projectId: "p-acme", amount: 1200, issueDate: day(-3), dueDate: day(11), status: "Pending", items: [{ id: "ii-5", description: "Project kickoff", quantity: 8, rate: 150 }] },
  { id: "i-6", number: "INV-1037", clientId: "c-bright", projectId: "p-bright", amount: 800, issueDate: day(-35), dueDate: day(-18), status: "Paid", items: [{ id: "ii-6", description: "Identity exploration", quantity: 1, rate: 800 }] },
  { id: "i-7", number: "INV-1036", clientId: "c-lumina", projectId: "p-lumina", amount: 1600, issueDate: day(0), dueDate: day(14), status: "Pending", items: [{ id: "ii-7", description: "Product design retainer", quantity: 8, rate: 200 }] },
  { id: "i-8", number: "INV-1035", clientId: "c-fit", projectId: "p-fit", amount: 950, issueDate: day(-48), dueDate: day(-28), status: "Paid", items: [{ id: "ii-8", description: "Discovery and research", quantity: 1, rate: 950 }] },
];

export const seedProposals: Proposal[] = [
  { id: "pr-1", title: "Website redesign & build", clientId: "c-acme", amount: 6800, createdDate: day(-2), expiryDate: day(13), status: "Sent", description: "A clear, conversion-led marketing website with a flexible content system." },
  { id: "pr-2", title: "Mobile app product design", clientId: "c-fit", amount: 5200, createdDate: day(-6), expiryDate: day(9), status: "Viewed", description: "A cohesive mobile experience that helps members build healthy habits." },
  { id: "pr-3", title: "Q3 product design partnership", clientId: "c-lumina", amount: 9600, createdDate: day(-12), expiryDate: day(18), status: "Accepted", description: "A focused, embedded design partnership for the next product cycle." },
  { id: "pr-4", title: "Brand identity refresh", clientId: "c-bright", amount: 3400, createdDate: day(-20), expiryDate: day(-2), status: "Rejected", description: "A practical, distinctive identity for a growing creative studio." },
  { id: "pr-5", title: "Landing page design", clientId: "c-nova", amount: 2800, createdDate: day(-1), expiryDate: day(20), status: "Draft", description: "A focused campaign page with a clear story and a strong conversion path." },
  { id: "pr-6", title: "Visual design system", clientId: "c-pixel", amount: 4100, createdDate: day(-16), expiryDate: day(6), status: "Sent", description: "A modular visual language and component library for a growing product team." },
];

export const seedTimeEntries: TimeEntry[] = Array.from({ length: 30 }, (_, index) => ({
  id: `time-${index + 1}`,
  projectId: ["p-nova", "p-fit", "p-lumina", "p-acme", "p-bright"][index % 5],
  task: ["Design iteration", "Client feedback", "Product research", "Prototype refinement", "Project planning"][index % 5],
  date: day(-Math.floor(index / 3)),
  hours: [1.5, 2, 3.5, 1, 4][index % 5],
  billable: index % 7 !== 0,
}));

export const seedEvents: CalendarEvent[] = [
  { id: "e-1", title: "NovaBrand website deadline", date: day(10), type: "Deadline", projectId: "p-nova", clientId: "c-nova" },
  { id: "e-2", title: "FitTrack design review", date: day(2), time: "11:00 AM", type: "Meeting", projectId: "p-fit", clientId: "c-fit" },
  { id: "e-3", title: "Invoice INV-1041 due", date: day(5), type: "Invoice", clientId: "c-fit" },
  { id: "e-4", title: "Share homepage concepts", date: day(2), time: "2:00 PM", type: "Task", projectId: "p-nova" },
  { id: "e-5", title: "Lumina dashboard milestone", date: day(36), type: "Deadline", projectId: "p-lumina", clientId: "c-lumina" },
  { id: "e-6", title: "Acme proposal expires", date: day(13), type: "Proposal", clientId: "c-acme" },
  { id: "e-7", title: "Project check-in with Maya", date: day(4), time: "10:30 AM", type: "Meeting", projectId: "p-nova", clientId: "c-nova" },
  { id: "e-8", title: "Weekly planning", date: day(1), time: "9:30 AM", type: "Task" },
  { id: "e-9", title: "Acme project kickoff", date: day(8), time: "1:00 PM", type: "Meeting", projectId: "p-acme", clientId: "c-acme" },
  { id: "e-10", title: "Send monthly update", date: day(7), time: "9:00 AM", type: "Task", projectId: "p-nova" },
];

export const seedActivity: Activity[] = [
  { id: "a-1", title: "Invoice #INV-1042 was paid", detail: "NovaBrand Inc.", time: "2 hours ago", icon: "invoice", color: "green" },
  { id: "a-2", title: "Sarah added a comment to NovaBrand Website", detail: "Looks great, let's move forward.", time: "4 hours ago", icon: "comment", color: "rose" },
  { id: "a-3", title: "Proposal sent to Acme Corporation", detail: "Website redesign & build · $6,800", time: "6 hours ago", icon: "proposal", color: "purple" },
  { id: "a-4", title: "12 hours tracked on FitTrack", detail: "This week", time: "8 hours ago", icon: "time", color: "blue" },
  { id: "a-5", title: "New client inquiry from BrightMind", detail: "Brand identity refresh", time: "10 hours ago", icon: "client", color: "amber" },
  { id: "a-6", title: "Project status changed to Review", detail: "Lumina SaaS Dashboard", time: "12 hours ago", icon: "project", color: "slate" },
];

export const seedNotifications: NotificationItem[] = [
  { id: "n-1", title: "Invoice paid", detail: "NovaBrand paid invoice INV-1042.", time: "2 hours ago", unread: true },
  { id: "n-2", title: "New comment", detail: "Maya left feedback on the homepage.", time: "4 hours ago", unread: true },
  { id: "n-3", title: "Proposal viewed", detail: "Acme viewed your proposal.", time: "Yesterday", unread: false },
];