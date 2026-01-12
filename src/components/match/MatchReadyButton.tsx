import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchReadyButtonProps {
  matchId: string;
  scheduledTime: string;
  opponentName: string;
  opponentReady: boolean;
  onReady: () => void;
}

export function MatchReadyButton({
  matchId,
  scheduledTime,
  opponentName,
  opponentReady,
  onReady,
}: MatchReadyButtonProps) {
  const [isReady, setIsReady] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [canReady, setCanReady] = useState(false);
  
  // Simulate checking if we're within the ready window (e.g., 15 mins before match)
  useEffect(() => {
    // Placeholder: In real app, compare with actual scheduled time
    setCanReady(true);
    setTimeRemaining("5:00");
    
    // Countdown timer simulation
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (!prev) return null;
        const [mins, secs] = prev.split(":").map(Number);
        if (mins === 0 && secs === 0) return "0:00";
        const newSecs = secs === 0 ? 59 : secs - 1;
        const newMins = secs === 0 ? mins - 1 : mins;
        return `${newMins}:${String(newSecs).padStart(2, "0")}`;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [scheduledTime]);
  
  const handleReady = () => {
    setIsReady(true);
    onReady();
  };
  
  const bothReady = isReady && opponentReady;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Match vs</p>
        <p className="text-lg font-bold">{opponentName}</p>
        <p className="text-sm text-primary mt-1">{scheduledTime}</p>
      </div>
      
      <div className="flex gap-3">
        {/* Your status */}
        <div className={cn(
          "flex-1 p-3 rounded-xl border text-center",
          isReady ? "bg-primary/10 border-primary/30" : "bg-secondary border-border/50"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center",
            isReady ? "bg-primary" : "bg-muted"
          )}>
            {isReady ? (
              <Check className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs font-medium">You</p>
          <p className={cn("text-xs", isReady ? "text-primary" : "text-muted-foreground")}>
            {isReady ? "Ready" : "Not Ready"}
          </p>
        </div>
        
        {/* Opponent status */}
        <div className={cn(
          "flex-1 p-3 rounded-xl border text-center",
          opponentReady ? "bg-primary/10 border-primary/30" : "bg-secondary border-border/50"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center",
            opponentReady ? "bg-primary" : "bg-muted"
          )}>
            {opponentReady ? (
              <Check className="w-4 h-4 text-primary-foreground" />
            ) : (
              <Clock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <p className="text-xs font-medium">{opponentName}</p>
          <p className={cn("text-xs", opponentReady ? "text-primary" : "text-muted-foreground")}>
            {opponentReady ? "Ready" : "Not Ready"}
          </p>
        </div>
      </div>
      
      {bothReady ? (
        <div className="text-center py-4 rounded-xl bg-accent/10 border border-accent/30">
          <Check className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="font-semibold text-accent">Both Players Ready!</p>
          <p className="text-xs text-muted-foreground mt-1">Match starting...</p>
        </div>
      ) : canReady ? (
        <div className="space-y-2">
          <Button
            onClick={handleReady}
            disabled={isReady}
            className={cn(
              "w-full font-semibold",
              isReady ? "bg-primary/50" : "gradient-accent"
            )}
          >
            {isReady ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                You're Ready
              </>
            ) : (
              "I'm Ready"
            )}
          </Button>
          {timeRemaining && !isReady && (
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Ready window closes in {timeRemaining}
            </p>
          )}
        </div>
      ) : (
        <div className="text-center py-3 rounded-xl bg-secondary border border-border/50">
          <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">
            Ready button available 15 mins before match
          </p>
        </div>
      )}
    </div>
  );
}
