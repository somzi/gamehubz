import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

interface AvailabilityPickerProps {
  matchId: string;
  deadline: string;
  opponentName: string;
  opponentAvailability?: string[];
  onSubmit: (selectedSlots: string[]) => void;
}

// Placeholder time slots for a week
const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dates = ["Jan 20", "Jan 21", "Jan 22", "Jan 23", "Jan 24"];
  const times = ["14:00", "16:00", "18:00", "20:00"];
  
  dates.forEach((date) => {
    times.forEach((time) => {
      slots.push({
        id: `${date}-${time}`,
        date,
        time,
        available: false,
      });
    });
  });
  
  return slots;
};

export function AvailabilityPicker({
  matchId,
  deadline,
  opponentName,
  opponentAvailability = [],
  onSubmit,
}: AvailabilityPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(generateTimeSlots());
  const [submitted, setSubmitted] = useState(false);
  
  const selectedSlots = slots.filter((s) => s.available).map((s) => s.id);
  
  const toggleSlot = (slotId: string) => {
    if (submitted) return;
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId ? { ...slot, available: !slot.available } : slot
      )
    );
  };
  
  const handleSubmit = () => {
    onSubmit(selectedSlots);
    setSubmitted(true);
  };
  
  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Deadline: {deadline}</span>
      </div>
      
      <p className="text-sm">
        Select your available times to play against <span className="font-semibold text-primary">{opponentName}</span>
      </p>
      
      <div className="space-y-3">
        {Object.entries(groupedSlots).map(([date, dateSlots]) => (
          <div key={date}>
            <p className="text-xs font-medium text-muted-foreground mb-2">{date}</p>
            <div className="flex flex-wrap gap-2">
              {dateSlots.map((slot) => {
                const isOpponentAvailable = opponentAvailability.includes(slot.id);
                return (
                  <button
                    key={slot.id}
                    onClick={() => toggleSlot(slot.id)}
                    disabled={submitted}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                      slot.available
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary border-border/50 text-muted-foreground hover:border-primary/50",
                      isOpponentAvailable && slot.available && "ring-2 ring-accent",
                      submitted && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {slot.time}
                      {isOpponentAvailable && (
                        <Check className="w-3 h-3 text-accent" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {opponentAvailability.length > 0 && (
        <p className="text-xs text-accent flex items-center gap-1">
          <Check className="w-3 h-3" />
          Green ring = opponent is also available
        </p>
      )}
      
      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedSlots.length === 0}
          className="w-full gradient-accent"
        >
          Submit Availability ({selectedSlots.length} slots)
        </Button>
      ) : (
        <div className="text-center py-3 rounded-xl bg-primary/10 border border-primary/20">
          <Check className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-sm font-medium text-primary">Availability Submitted</p>
          <p className="text-xs text-muted-foreground mt-1">
            Waiting for {opponentName} to submit theirs
          </p>
        </div>
      )}
    </div>
  );
}
