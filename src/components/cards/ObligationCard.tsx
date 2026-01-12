import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObligationCardProps {
  tournamentName: string;
  matchType: string;
  scheduledTime: string;
  opponentName: string;
  opponentAvatar?: string;
  status: "live" | "scheduled" | "completed";
  isUrgent?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ObligationCard({
  tournamentName,
  matchType,
  scheduledTime,
  opponentName,
  opponentAvatar,
  status,
  isUrgent,
  onClick,
  className,
}: ObligationCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "tournament-card cursor-pointer",
        isUrgent && "border-accent/50 bg-accent/5",
        status === "live" && "border-live/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{matchType}</p>
          <h3 className="font-semibold text-foreground">{tournamentName}</h3>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            <PlayerAvatar src={opponentAvatar} name={opponentName} size="sm" />
            <span className="font-medium text-foreground">{opponentName}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-sm">
        <Clock className={cn("w-4 h-4", isUrgent ? "text-accent" : "text-muted-foreground")} />
        <span className={cn(isUrgent ? "text-accent font-medium" : "text-muted-foreground")}>
          {scheduledTime}
        </span>
      </div>
    </div>
  );
}
