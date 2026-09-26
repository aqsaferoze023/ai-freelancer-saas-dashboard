import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export function StatCard({
  label,
  value,
  change,
  detail,
  icon: Icon,
  tone = "wine",
  trend = "up",
  index = 0,
}: {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: LucideIcon;
  tone?: string;
  trend?: "up" | "down";
  index?: number;
}) {
  const UpIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const spark = trend === "up" ? "M1 22 C9 20, 11 13, 18 15 S29 10, 35 11 S44 3, 52 6 S61 2, 68 1" : "M1 3 C9 4, 11 10, 18 9 S29 14, 35 12 S44 20, 52 18 S61 23, 68 22";
  return (
    <motion.div className="stat-card panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, duration: 0.28 }}>
      <div className="stat-topline"><span className={cn("stat-icon", `stat-icon-${tone}`)}><Icon size={17} strokeWidth={1.9} /></span><span className="stat-label">{label}</span></div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot"><span className={cn("stat-change", trend === "up" ? "positive" : "negative")}><UpIcon size={13} />{change}</span><span className="stat-detail">{detail}</span></div>
      <svg className={cn("stat-spark", trend === "down" && "stat-spark-down")} viewBox="0 0 70 24" aria-hidden="true"><path d={spark} /></svg>
    </motion.div>
  );
}