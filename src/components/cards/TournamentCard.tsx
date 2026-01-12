import { Calendar, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface TournamentCardProps {
  id: string;
  name: string;
  description?: string;
  status: "live" | "upcoming" | "completed";
  date: string;
  players: Player[];
  onClick?: () => void;
  className?: string;
}

export function TournamentCard({
  name,
  description,
  status,
  date,
  players,
  onClick,
  className,
}: TournamentCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "tournament-card cursor-pointer group",
        status === "live" && "border-live/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate pr-2">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <AvatarStack players={players} max={4} className="mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <button className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
          View Bracket
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
