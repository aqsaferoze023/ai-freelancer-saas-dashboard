export type ClientStatus = "Active" | "Lead" | "Inactive";
export type ProjectStatus = "Planning" | "In Progress" | "Review" | "Completed" | "On Hold";
export type Priority = "Low" | "Medium" | "High" | "Urgent";
export type TaskStatus = "Backlog" | "To Do" | "In Progress" | "Review" | "Done";
export type InvoiceStatus = "Draft" | "Pending" | "Paid" | "Overdue";
export type ProposalStatus = "Draft" | "Sent" | "Viewed" | "Accepted" | "Rejected";
export type EventType = "Deadline" | "Meeting" | "Task" | "Invoice" | "Proposal";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: ClientStatus;
  totalRevenue: number;
  activeProjects: number;
  lastContact: string;
  color: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: ProjectStatus;
  progress: number;
  deadline: string;
  budget: number;
  amountPaid: number;
  description: string;
  hours: number;
  team: string[];
  archived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  priority: Priority;
  dueTime: string;
  dueDate: string;
  status: TaskStatus;
  category?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  projectId?: string;
  amount: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  notes?: string;
}

export interface Proposal {
  id: string;
  title: string;
  clientId: string;
  amount: number;
  createdDate: string;
  expiryDate: string;
  status: ProposalStatus;
  description: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  task: string;
  date: string;
  hours: number;
  billable: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  projectId?: string;
  clientId?: string;
}

export interface Activity {
  id: string;
  title: string;
  detail?: string;
  time: string;
  icon: "invoice" | "comment" | "proposal" | "time" | "project" | "client";
  color: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export type CreateKind = "client" | "project" | "task" | "proposal" | "invoice";