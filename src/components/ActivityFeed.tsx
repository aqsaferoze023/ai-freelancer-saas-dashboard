import { ArrowDownLeft, Clock3, FileCheck2, FileText, MessageCircle, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import type { Activity } from "../types";
import { cn } from "../utils/cn";

const activityIcons: Record<Activity["icon"], LucideIcon> = {
  invoice: FileCheck2,
  comment: MessageCircle,
  proposal: FileText,
  time: Clock3,
  project: Sparkles,
  client: UserRound,
};

export function ActivityFeed({ items, compact = false }: { items: Activity[]; compact?: boolean }) {
  return (
    <div className={cn("activity-list", compact && "activity-list-compact")}>
      {items.map((item) => {
        const Icon = activityIcons[item.icon] ?? ArrowDownLeft;
        return (
          <div className="activity-item" key={item.id}>
            <span className={`activity-icon activity-${item.color}`}><Icon size={14} /></span>
            <div className="activity-copy"><p>{item.title}</p>{item.detail && <span>{item.detail}</span>}</div>
            <time>{item.time}</time>
          </div>
        );
      })}
    </div>
  );
}