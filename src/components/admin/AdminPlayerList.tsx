import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, UserX, Eye, AlertTriangle } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Player {
  id: string;
  name: string;
  level: number;
  fairPlayScore: number;
  noShowCount: number;
  registeredAt: string;
}

interface AdminPlayerListProps {
  tournamentId: string;
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
}

export function AdminPlayerList({ tournamentId, players, onRemovePlayer }: AdminPlayerListProps) {
  const navigate = useNavigate();
  const [playerToRemove, setPlayerToRemove] = useState<Player | null>(null);
  
  const handleRemove = () => {
    if (playerToRemove) {
      onRemovePlayer(playerToRemove.id);
      setPlayerToRemove(null);
    }
  };

  return (
    <>
      <div className="space-y-2">
        {players.map((player, index) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30"
          >
            <span className="w-6 text-center text-sm text-muted-foreground font-medium">
              {index + 1}
            </span>
            <PlayerAvatar name={player.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{player.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Lvl {player.level}</span>
                <span>•</span>
                <span className={player.fairPlayScore < 70 ? "text-destructive" : ""}>
                  FP: {player.fairPlayScore}%
                </span>
                {player.noShowCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-destructive flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      {player.noShowCount} no-shows
                    </span>
                  </>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="gradient-card border-border/50">
                <DropdownMenuItem onClick={() => navigate(`/players/${player.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPlayerToRemove(player)}
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Remove Player
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        
        {players.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No players registered yet</p>
          </div>
        )}
      </div>
      
      <AlertDialog open={!!playerToRemove} onOpenChange={() => setPlayerToRemove(null)}>
        <AlertDialogContent className="gradient-card border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Player</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-semibold text-foreground">{playerToRemove?.name}</span> from this tournament? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
