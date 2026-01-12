import { cn } from "@/lib/utils";

type Status = "live" | "upcoming" | "completed" | "scheduled";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  live: "badge-live",
  upcoming: "badge-upcoming",
  completed: "badge-completed",
  scheduled: "bg-accent/20 text-accent text-xs font-semibold px-2 py-0.5 rounded-full",
};

const statusLabels: Record<Status, string> = {
  live: "Live",
  upcoming: "Upcoming",
  completed: "Completed",
  scheduled: "Scheduled",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusStyles[status], className)}>
      {statusLabels[status]}
    </span>
  );
}
