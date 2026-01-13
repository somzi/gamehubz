import { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyAvailabilityPicker } from "./HourlyAvailabilityPicker";
import { MatchReadyButton } from "./MatchReadyButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MatchStatus = "pending_availability" | "scheduled" | "ready_phase" | "completed";

interface MatchScheduleCardProps {
  matchId: string;
  tournamentName: string;
  roundName: string;
  opponentName: string;
  status: MatchStatus;
  deadline?: string;
  scheduledTime?: string;
  opponentAvailability?: string[];
  opponentReady?: boolean;
}

export function MatchScheduleCard({
  matchId,
  tournamentName,
  roundName,
  opponentName,
  status,
  deadline = "Jan 22, 2024",
  scheduledTime,
  opponentAvailability = [],
  opponentReady = false,
}: MatchScheduleCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<MatchStatus>(status);
  const [matchTime, setMatchTime] = useState(scheduledTime);
  
  const handleAvailabilitySubmit = (slots: string[]) => {
    console.log("Availability submitted:", slots);
    // Simulate auto-scheduling when both players have availability
    if (opponentAvailability.length > 0) {
      const commonSlot = slots.find((s) => opponentAvailability.includes(s));
      if (commonSlot) {
        setMatchTime(commonSlot.replace("-", " at "));
        setCurrentStatus("scheduled");
      }
    }
  };
  
  const handleReady = () => {
    console.log("Player ready for match:", matchId);
  };

  const getStatusContent = () => {
    switch (currentStatus) {
      case "pending_availability":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Set your availability</span>
          </div>
        );
      case "scheduled":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-accent font-medium">{matchTime}</span>
          </div>
        );
      case "ready_phase":
        return (
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary font-medium">Ready check active</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card 
        className="gradient-card border-border/30 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{tournamentName}</CardTitle>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {roundName}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            vs <span className="font-semibold">{opponentName}</span>
          </p>
          {getStatusContent()}
        </CardContent>
      </Card>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="gradient-card border-border/50 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {tournamentName} - {roundName}
            </DialogTitle>
          </DialogHeader>
          
          {currentStatus === "pending_availability" && (
            <HourlyAvailabilityPicker
              matchId={matchId}
              deadline={deadline}
              opponentName={opponentName}
              opponentAvailability={opponentAvailability}
              onSubmit={handleAvailabilitySubmit}
            />
          )}
          
          {(currentStatus === "scheduled" || currentStatus === "ready_phase") && matchTime && (
            <MatchReadyButton
              matchId={matchId}
              scheduledTime={matchTime}
              opponentName={opponentName}
              opponentReady={opponentReady}
              onReady={handleReady}
            />
          )}
          
          {currentStatus === "completed" && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Match completed</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
