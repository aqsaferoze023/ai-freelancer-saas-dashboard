import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import ClientsPage, { ClientDetailPage } from "./pages/Clients";
import ProjectsPage, { ProjectDetailPage } from "./pages/Projects";
import TasksPage from "./pages/Tasks";
import ProposalsPage from "./pages/Proposals";
import InvoicesPage from "./pages/Invoices";
import TimeTrackerPage from "./pages/TimeTracker";
import CalendarPage from "./pages/Calendar";
import AIAssistantPage from "./pages/AIAssistant";
import AnalyticsPage from "./pages/Analytics";
import SettingsPage from "./pages/Settings";
import { ForgotPasswordPage, LoginPage, OnboardingPage, SignupPage } from "./pages/Auth";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return <div className="not-found"><div className="not-found-code">404</div><h1>This page took a different path.</h1><p>Let's get you back to your workspace.</p><Link to="/"><ArrowLeft size={14} />Back to dashboard</Link></div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/:clientId" element={<ClientDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="time-tracker" element={<TimeTrackerPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="ai-assistant" element={<AIAssistantPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}