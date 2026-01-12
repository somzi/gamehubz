import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedCardProps {
  hubName: string;
  hubAvatar?: string;
  message: string;
  tournamentName?: string;
  timestamp: string;
  onClick?: () => void;
  className?: string;
}

export function FeedCard({
  hubName,
  hubAvatar,
  message,
  tournamentName,
  timestamp,
  onClick,
  className,
}: FeedCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn("feed-card cursor-pointer active:scale-[0.98] transition-transform", className)}
    >
      <div className="flex gap-3">
        <PlayerAvatar src={hubAvatar} name={hubName} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{hubName}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          {tournamentName && (
            <button className="flex items-center gap-1 text-sm font-medium text-primary mt-2 hover:gap-2 transition-all">
              {tournamentName}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">{timestamp}</span>
      </div>
    </div>
  );
}
