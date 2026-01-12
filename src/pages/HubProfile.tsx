import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Users, Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatCard } from "@/components/ui/StatCard";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Placeholder data
const hubData = {
  id: "1",
  name: "Esports Hub",
  description: "Premier competitive gaming community hosting weekly tournaments and championships for players of all skill levels.",
  followers: 1250,
  tournaments: 45,
  ongoingTournaments: 2,
};

const ongoingTournaments = [
  {
    id: "1",
    name: "Winter Championship 2024",
    description: "Annual championship event",
    status: "live" as const,
    date: "Jan 15, 2024",
    players: [
      { id: "1", name: "Player1" },
      { id: "2", name: "Player2" },
      { id: "3", name: "Player3" },
      { id: "4", name: "Player4" },
    ],
  },
];

const pastTournaments = [
  {
    id: "2",
    name: "Fall Series Finals",
    status: "completed" as const,
    date: "Dec 10, 2023",
    players: [{ id: "1", name: "Winner" }],
  },
  {
    id: "3",
    name: "Summer Cup",
    status: "completed" as const,
    date: "Aug 20, 2023",
    players: [{ id: "1", name: "Winner" }],
  },
];

export default function HubProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Hub" showBack />

      <div className="animate-slide-up">
        {/* Profile Header */}
        <div className="px-4 py-6 gradient-card border-b border-border/30">
          <div className="flex items-start gap-4 mb-4">
            <PlayerAvatar name={hubData.name} size="xl" />
            <div className="flex-1">
              <h1 className="text-xl font-bold">{hubData.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {hubData.description}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsFollowing(!isFollowing)}
            variant={isFollowing ? "secondary" : "default"}
            className={!isFollowing ? "gradient-accent text-primary-foreground w-full" : "w-full"}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <div className="flex gap-3">
            <StatCard icon={Users} value={hubData.followers.toLocaleString()} label="Followers" />
            <StatCard icon={Trophy} value={hubData.tournaments} label="Tournaments" variant="gold" />
            <StatCard icon={Calendar} value={hubData.ongoingTournaments} label="Ongoing" variant="accent" />
          </div>
        </div>

        {/* Ongoing Tournaments */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-4">Ongoing Tournaments</h2>
          <div className="space-y-3">
            {ongoingTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                {...tournament}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Past Tournaments */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-4">Past Tournaments</h2>
          <div className="space-y-2">
            {pastTournaments.map((tournament) => (
              <div
                key={tournament.id}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
                className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/30 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div>
                  <p className="font-medium">{tournament.name}</p>
                  <p className="text-sm text-muted-foreground">{tournament.date}</p>
                </div>
                <span className="badge-completed">{tournament.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
