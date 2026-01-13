import { CalendarDays, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedCard } from "@/components/cards/FeedCard";
import { MatchScheduleCard } from "@/components/match/MatchScheduleCard";
import { PageHeader } from "@/components/layout/PageHeader";

// Placeholder data - ready for API integration
const feedData = [
  {
    id: "1",
    hubName: "Esports Hub",
    message: "announced a new tournament",
    tournamentName: "Winter Championship 2024",
    timestamp: "2h ago",
  },
  {
    id: "2",
    hubName: "Gaming League",
    message: "started a live tournament",
    tournamentName: "Pro Series Finals",
    timestamp: "4h ago",
  },
  {
    id: "3",
    hubName: "Community Arena",
    message: "registration is now open",
    tournamentName: "Spring Showdown",
    timestamp: "6h ago",
  },
];

// Matches needing scheduling
const pendingSchedulingMatches = [
  {
    id: "match-1",
    tournamentName: "Spring Showdown",
    roundName: "Round of 16",
    opponentName: "NightOwl",
    status: "pending_availability" as const,
    deadline: "Jan 25, 2024",
    opponentAvailability: ["2024-01-23-14", "2024-01-23-16", "2024-01-24-18"],
  },
];

// Scheduled and ready matches
const scheduledMatches = [
  {
    id: "match-2",
    tournamentName: "Pro League Season 3",
    roundName: "Quarterfinal",
    opponentName: "ShadowBlade",
    status: "scheduled" as const,
    scheduledTime: "Jan 24 at 20:00",
  },
  {
    id: "match-3",
    tournamentName: "Community Cup",
    roundName: "Semi-final",
    opponentName: "ThunderStrike",
    status: "ready_phase" as const,
    scheduledTime: "Now",
    opponentReady: true,
  },
  {
    id: "match-4",
    tournamentName: "Winter Championship",
    roundName: "Quarterfinal",
    opponentName: "ProPlayer99",
    status: "ready_phase" as const,
    scheduledTime: "Today at 18:00",
    opponentReady: false,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Home" />

      <div className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Community News Feed */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Community Feed</h2>
          <div className="space-y-3">
            {feedData.map((item) => (
              <FeedCard
                key={item.id}
                hubName={item.hubName}
                message={item.message}
                tournamentName={item.tournamentName}
                timestamp={item.timestamp}
                onClick={() => navigate("/tournaments/1")}
              />
            ))}
          </div>
        </section>

        {/* Needs Scheduling Panel */}
        {pendingSchedulingMatches.length > 0 && (
          <section className="p-4 rounded-xl bg-accent/10 border border-accent/30">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Schedule Your Matches</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set your availability to find a match time
            </p>
            <div className="space-y-3">
              {pendingSchedulingMatches.map((match) => (
                <MatchScheduleCard
                  key={match.id}
                  matchId={match.id}
                  tournamentName={match.tournamentName}
                  roundName={match.roundName}
                  opponentName={match.opponentName}
                  status={match.status}
                  deadline={match.deadline}
                  opponentAvailability={match.opponentAvailability}
                />
              ))}
            </div>
          </section>
        )}

        {/* My Matches - Scheduled/Ready */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">My Matches</h2>
          </div>
          <div className="space-y-3">
            {scheduledMatches.map((match) => (
              <MatchScheduleCard
                key={match.id}
                matchId={match.id}
                tournamentName={match.tournamentName}
                roundName={match.roundName}
                opponentName={match.opponentName}
                status={match.status}
                scheduledTime={match.scheduledTime}
                opponentReady={match.opponentReady}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
