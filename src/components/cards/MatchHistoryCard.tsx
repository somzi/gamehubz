import { cn } from "@/lib/utils";
import { Trophy, X } from "lucide-react";

interface MatchHistoryCardProps {
  tournamentName: string;
  opponentName: string;
  result: "win" | "loss";
  date: string;
  onClick?: () => void;
  className?: string;
}

export function MatchHistoryCard({
  tournamentName,
  opponentName,
  result,
  date,
  onClick,
  className,
}: MatchHistoryCardProps) {
  const isWin = result === "win";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl bg-card border border-border/30 cursor-pointer active:scale-[0.98] transition-transform",
        className
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          isWin ? "bg-success/20" : "bg-destructive/20"
        )}
      >
        {isWin ? (
          <Trophy className="w-5 h-5 text-success" />
        ) : (
          <X className="w-5 h-5 text-destructive" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{tournamentName}</p>
        <p className="text-sm text-muted-foreground">vs {opponentName}</p>
      </div>

      <div className="text-right">
        <p className={cn("font-semibold", isWin ? "text-success" : "text-destructive")}>
          {isWin ? "Win" : "Loss"}
        </p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
