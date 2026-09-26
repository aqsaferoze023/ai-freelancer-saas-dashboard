import { ArrowUpRight, CalendarDays, CircleDollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import type { Client, Project } from "../types";
import { currency, shortDate } from "../utils/format";
import { Avatar, Badge, Progress } from "./ui";

const statusTone: Record<Project["status"], string> = {
  Planning: "neutral",
  "In Progress": "green",
  Review: "amber",
  Completed: "blue",
  "On Hold": "rose",
};

export function ProjectRows({ projects, clients, limit }: { projects: Project[]; clients: Client[]; limit?: number }) {
  const visible = projects.filter((project) => !project.archived).slice(0, limit);
  return (
    <div className="project-list">
      {visible.map((project) => {
        const client = clients.find((item) => item.id === project.clientId);
        return (
          <Link to={`/projects/${project.id}`} className="project-row" key={project.id}>
            <Avatar name={project.name} color={client?.color ?? "slate"} />
            <div className="project-row-main">
              <div className="project-row-title"><strong>{project.name}</strong><Badge tone={statusTone[project.status]}>{project.status}</Badge></div>
              <span className="project-client-name">{client?.company ?? "Independent project"}</span>
              <div className="project-progress-line"><Progress value={project.progress} /><span>{project.progress}%</span></div>
              <div className="project-row-meta"><span><CalendarDays size={11} />{shortDate(project.deadline)}</span><span><CircleDollarSign size={11} />{currency(project.amountPaid)} / {currency(project.budget)}</span></div>
            </div>
            <ArrowUpRight size={14} className="project-row-arrow" />
          </Link>
        );
      })}
      {!visible.length && <div className="inline-empty">No active projects yet.</div>}
    </div>
  );
}