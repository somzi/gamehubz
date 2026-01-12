import { useNavigate } from "react-router-dom";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  score?: number;
}

interface BracketMatchProps {
  player1?: Player;
  player2?: Player;
  winnerId?: string;
  className?: string;
}

export function BracketMatch({ player1, player2, winnerId, className }: BracketMatchProps) {
  const navigate = useNavigate();

  const handlePlayerClick = (playerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/players/${playerId}`);
  };

  const renderPlayer = (player?: Player) => {
    if (!player) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-muted" />
          <span className="text-sm text-muted-foreground">TBD</span>
        </div>
      );
    }

    const isWinner = winnerId === player.id;

    return (
      <div
        onClick={(e) => handlePlayerClick(player.id, e)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all cursor-pointer hover:scale-[1.02]",
          isWinner ? "bg-success/20 border border-success/30" : "bg-muted/30 hover:bg-muted/50"
        )}
      >
        <PlayerAvatar src={player.avatar} name={player.name} size="sm" className="w-6 h-6" />
        <span className={cn("text-sm font-medium flex-1", isWinner && "text-success")}>
          {player.name}
        </span>
        {player.score !== undefined && (
          <span className={cn("text-sm font-bold", isWinner && "text-success")}>
            {player.score}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-1 w-48", className)}>
      {renderPlayer(player1)}
      {renderPlayer(player2)}
    </div>
  );
}
