import { Trophy, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedCard } from "@/components/cards/FeedCard";
import { ObligationCard } from "@/components/cards/ObligationCard";
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
