import { Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedCard } from "@/components/cards/FeedCard";
import { ObligationCard } from "@/components/cards/ObligationCard";
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

const obligationsData = [
  {
    id: "1",
    tournamentName: "Winter Championship",
    matchType: "Quarterfinal",
    scheduledTime: "Today at 18:00",
    opponentName: "ProPlayer99",
    status: "live" as const,
    isUrgent: true,
  },
  {
    id: "2",
    tournamentName: "Weekly Cup #42",
    matchType: "Semi-final",
    scheduledTime: "Tomorrow at 20:00",
    opponentName: "GamerX",
    status: "scheduled" as const,
    isUrgent: false,
  },
];

// Matches that need scheduling
const schedulingMatchesData = [
  {
    id: "match-1",
    tournamentName: "Spring Showdown",
    roundName: "Round of 16",
    opponentName: "NightOwl",
    status: "pending_availability" as const,
    deadline: "Jan 25, 2024",
    opponentAvailability: ["Jan 23-14:00", "Jan 23-16:00", "Jan 24-18:00"],
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
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Home" />

      <div className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Stats Overview */}
        <div className="flex gap-3">
          <StatCard icon={Trophy} value={1} label="Live Now" variant="gold" />
          <StatCard icon={Users} value={8} label="Players" variant="accent" />
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

        {/* Schedule Your Matches */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Schedule Matches</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Tap a match to set your availability or confirm ready status
          </p>
          <div className="space-y-3">
            {schedulingMatchesData.map((match) => (
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

        {/* My Tournament Obligations */}
        <section>
          <h2 className="text-lg font-semibold mb-4">My Matches</h2>
          <div className="space-y-3">
            {obligationsData.map((item) => (
              <ObligationCard
                key={item.id}
                tournamentName={item.tournamentName}
                matchType={item.matchType}
                scheduledTime={item.scheduledTime}
                opponentName={item.opponentName}
                status={item.status}
                isUrgent={item.isUrgent}
                onClick={() => navigate("/tournaments/1")}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
