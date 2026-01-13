import { CalendarDays, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedCard } from "@/components/cards/FeedCard";
import { MatchScheduleCard } from "@/components/match/MatchScheduleCard";
import { StatCard } from "@/components/ui/StatCard";
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

// All matches consolidated - including ones needing scheduling
const myMatchesData = [
  {
    id: "match-1",
    tournamentName: "Spring Showdown",
    roundName: "Round of 16",
    opponentName: "NightOwl",
    status: "pending_availability" as const,
    deadline: "Jan 25, 2024",
    opponentAvailability: ["2024-01-23-14", "2024-01-23-16", "2024-01-24-18"],
  },
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

  // Count active matches (not completed)
  const activeMatchCount = myMatchesData.length;
  const urgentCount = myMatchesData.filter(
    (m) => m.status === "ready_phase" || m.status === "pending_availability"
  ).length;

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Home" />

      <div className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Stats Overview */}
        <div className="flex gap-3">
          <StatCard icon={Flame} value={activeMatchCount} label="Active Matches" variant="accent" />
          <StatCard icon={CalendarDays} value={urgentCount} label="Need Action" variant="gold" />
        </div>

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

        {/* My Matches - Consolidated */}
        <section>
          <h2 className="text-lg font-semibold mb-2">My Matches</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tap a match to set availability or confirm ready
          </p>
          <div className="space-y-3">
            {myMatchesData.map((match) => (
              <MatchScheduleCard
                key={match.id}
                matchId={match.id}
                tournamentName={match.tournamentName}
                roundName={match.roundName}
                opponentName={match.opponentName}
                status={match.status}
                deadline={match.deadline}
                scheduledTime={match.scheduledTime}
                opponentAvailability={match.opponentAvailability}
                opponentReady={match.opponentReady}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
