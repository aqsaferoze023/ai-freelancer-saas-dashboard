import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  seedActivity,
  seedClients,
  seedEvents,
  seedInvoices,
  seedNotifications,
  seedProjects,
  seedProposals,
  seedTasks,
  seedTimeEntries,
} from "../data/mockData";
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
} from "../types";

interface ToastMessage {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
}

interface AppState {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  proposals: Proposal[];
  timeEntries: TimeEntry[];
  events: CalendarEvent[];
  activity: Activity[];
  notifications: NotificationItem[];
  theme: "light" | "dark";
  timerSeconds: number;
  timerStartedAt: number | null;
  toasts: ToastMessage[];
  toggleTask: (id: string) => void;
  updateTaskStatus: (id: string, status: Task["status"]) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  archiveProject: (id: string) => void;
  addTask: (task: Task) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  addProposal: (proposal: Proposal) => void;
  updateProposalStatus: (id: string, status: Proposal["status"]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  addEvent: (event: CalendarEvent) => void;
  toggleTheme: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: (entry?: TimeEntry) => void;
  addToast: (message: string, tone?: ToastMessage["tone"]) => void;
  dismissToast: (id: string) => void;
  markNotificationsRead: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      clients: seedClients,
      projects: seedProjects,
      tasks: seedTasks,
      invoices: seedInvoices,
      proposals: seedProposals,
      timeEntries: seedTimeEntries,
      events: seedEvents,
      activity: seedActivity,
      notifications: seedNotifications,
      theme: "light",
      timerSeconds: 0,
      timerStartedAt: null,
      toasts: [],
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((task) => task.id === id ? { ...task, status: task.status === "Done" ? "To Do" : "Done" } : task),
      })),
      updateTaskStatus: (id, status) => set((state) => ({ tasks: state.tasks.map((task) => task.id === id ? { ...task, status } : task) })),
      addClient: (client) => set((state) => ({ clients: [client, ...state.clients] })),
      updateClient: (client) => set((state) => ({ clients: state.clients.map((item) => item.id === client.id ? client : item) })),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (project) => set((state) => ({ projects: state.projects.map((item) => item.id === project.id ? project : item) })),
      archiveProject: (id) => set((state) => ({ projects: state.projects.map((item) => item.id === id ? { ...item, archived: true } : item) })),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      addInvoice: (invoice) => set((state) => ({ invoices: [invoice, ...state.invoices] })),
      updateInvoiceStatus: (id, status) => set((state) => ({ invoices: state.invoices.map((item) => item.id === id ? { ...item, status } : item) })),
      addProposal: (proposal) => set((state) => ({ proposals: [proposal, ...state.proposals] })),
      updateProposalStatus: (id, status) => set((state) => ({ proposals: state.proposals.map((item) => item.id === id ? { ...item, status } : item) })),
      addTimeEntry: (entry) => set((state) => ({ timeEntries: [entry, ...state.timeEntries] })),
      addEvent: (event) => set((state) => ({ events: [event, ...state.events] })),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      startTimer: () => set((state) => state.timerStartedAt ? state : { timerStartedAt: Date.now() }),
      pauseTimer: () => set((state) => state.timerStartedAt ? {
        timerSeconds: state.timerSeconds + Math.floor((Date.now() - state.timerStartedAt) / 1000),
        timerStartedAt: null,
      } : state),
      stopTimer: (entry) => set((state) => ({
        timerSeconds: 0,
        timerStartedAt: null,
        timeEntries: entry ? [entry, ...state.timeEntries] : state.timeEntries,
      })),
      addToast: (message, tone = "success") => set((state) => ({
        toasts: [...state.toasts, { id: `${Date.now()}-${Math.random()}`, message, tone }],
      })),
      dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      markNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, unread: false })) })),
    }),
    {
      name: "freelanceos-local-workspace",
      partialize: (state) => ({
        clients: state.clients,
        projects: state.projects,
        tasks: state.tasks,
        invoices: state.invoices,
        proposals: state.proposals,
        timeEntries: state.timeEntries,
        events: state.events,
        activity: state.activity,
        notifications: state.notifications,
        theme: state.theme,
        timerSeconds: state.timerSeconds,
        timerStartedAt: state.timerStartedAt,
      }),
    },
  ),
);