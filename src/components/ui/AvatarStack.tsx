import { cn } from "@/lib/utils";
import { PlayerAvatar } from "./PlayerAvatar";

interface Player {
  id: string;
  name: string;
  avatar?: string;
}

interface AvatarStackProps {
  players: Player[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function AvatarStack({ players, max = 4, size = "sm", className }: AvatarStackProps) {
  const displayed = players.slice(0, max);
  const remaining = players.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex -space-x-2">
        {displayed.map((player) => (
          <PlayerAvatar
            key={player.id}
            src={player.avatar}
            name={player.name}
            size={size}
            className="ring-2 ring-background"
          />
        ))}
        {remaining > 0 && (
          <div className={cn(
            "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
            size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
          )}>
            +{remaining}
          </div>
        )}
      </div>
      <span className="ml-3 text-sm text-muted-foreground">
        {players.length} players
      </span>
    </div>
  );
}
