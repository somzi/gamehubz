import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, startOfToday } from "date-fns";

interface HourlyAvailabilityPickerProps {
  matchId: string;
  deadline: string;
  opponentName: string;
  opponentAvailability?: string[];
  onSubmit: (selectedSlots: string[]) => void;
}

const HOURS = [10, 12, 14, 16, 18, 20, 22]; // 10am to 10pm, every 2 hours

export function HourlyAvailabilityPicker({
  matchId,
  deadline,
  opponentName,
  opponentAvailability = [],
  onSubmit,
}: HourlyAvailabilityPickerProps) {
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate 5 days starting from today + weekOffset
  const days = useMemo(() => {
    const startDate = addDays(startOfToday(), weekOffset * 5);
    return Array.from({ length: 5 }, (_, i) => {
      const date = addDays(startDate, i);
      return {
        date,
        label: format(date, "EEE"),
        fullLabel: format(date, "MMM d"),
        key: format(date, "yyyy-MM-dd"),
      };
    });
  }, [weekOffset]);

  const toggleSlot = (dayKey: string, hour: number) => {
    if (submitted) return;
    const slotId = `${dayKey}-${hour}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slotId)) {
        next.delete(slotId);
      } else {
        next.add(slotId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    onSubmit(Array.from(selectedSlots));
    setSubmitted(true);
  };

  const formatHour = (hour: number) => {
    return `${hour}:00`;
  };

  const isOpponentAvailable = (dayKey: string, hour: number) => {
    return opponentAvailability.includes(`${dayKey}-${hour}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Deadline: {deadline}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0 || submitted}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setWeekOffset((w) => w + 1)}
            disabled={submitted}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm">
        Tap times you're available to play{" "}
        <span className="font-semibold text-primary">{opponentName}</span>
      </p>

      {/* Hourly Grid */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="min-w-[320px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-1 mb-2">
            <div /> {/* Empty cell for time column */}
            {days.map((day) => (
              <div key={day.key} className="text-center">
                <p className="text-xs font-medium text-foreground">{day.label}</p>
                <p className="text-[10px] text-muted-foreground">{day.fullLabel}</p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="space-y-1">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[48px_repeat(5,1fr)] gap-1">
                <div className="flex items-center justify-end pr-2">
                  <span className="text-[10px] text-muted-foreground">
                    {formatHour(hour)}
                  </span>
                </div>
                {days.map((day) => {
                  const slotId = `${day.key}-${hour}`;
                  const isSelected = selectedSlots.has(slotId);
                  const opponentAvail = isOpponentAvailable(day.key, hour);

                  return (
                    <button
                      key={slotId}
                      onClick={() => toggleSlot(day.key, hour)}
                      disabled={submitted}
                      className={cn(
                        "h-8 rounded-md transition-all text-xs font-medium border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/50 border-border/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary",
                        opponentAvail && isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-background",
                        opponentAvail && !isSelected && "border-accent/50",
                        submitted && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 mx-auto" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {opponentAvailability.length > 0 && (
        <p className="text-xs text-accent flex items-center gap-1">
          <Check className="w-3 h-3" />
          Highlighted borders = opponent is available
        </p>
      )}

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={selectedSlots.size === 0}
          className="w-full gradient-accent"
        >
          Confirm Availability ({selectedSlots.size} slots)
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
