import { Calendar, ChevronRight, Globe, Coins } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { Button } from "@/components/ui/button";
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
  region?: string;
  prizePool?: string;
  showApply?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TournamentCard({
  name,
  description,
  status,
  date,
  players,
  region,
  prizePool,
  showApply,
  onClick,
  className,
}: TournamentCardProps) {
  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Placeholder for API integration
    console.log("Apply to tournament:", name);
  };

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

      {/* Region and Prize Pool */}
      {(region || prizePool) && (
        <div className="flex items-center gap-4 mb-3 text-xs">
          {region && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Globe className="w-3 h-3" />
              <span>{region}</span>
            </div>
          )}
          {prizePool && (
            <div className="flex items-center gap-1 text-accent">
              <Coins className="w-3 h-3" />
              <span className="font-medium">{prizePool}</span>
            </div>
          )}
        </div>
      )}

      <AvatarStack players={players} max={4} className="mb-4" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        
        {showApply ? (
          <Button
            size="sm"
            className="gradient-accent text-primary-foreground font-semibold h-7 px-3 text-xs"
            onClick={handleApply}
          >
            Apply
          </Button>
        ) : (
          <button className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
            View Bracket
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
