import { useNavigate } from "react-router-dom";
import { Trophy, Users } from "lucide-react";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder data
const tournamentsData = {
  live: [
    {
      id: "1",
      name: "Winter Championship 2024",
      description: "Annual winter tournament with top players...",
      status: "live" as const,
      date: "Jan 15, 2024",
      players: [
        { id: "1", name: "Player1" },
        { id: "2", name: "Player2" },
        { id: "3", name: "Player3" },
        { id: "4", name: "Player4" },
        { id: "5", name: "Player5" },
        { id: "6", name: "Player6" },
        { id: "7", name: "Player7" },
        { id: "8", name: "Player8" },
      ],
    },
  ],
  upcoming: [
    {
      id: "2",
      name: "Spring Showdown",
      description: "Competitive bracket for all skill levels",
      status: "upcoming" as const,
      date: "Feb 1, 2024",
      players: [
        { id: "1", name: "Player1" },
        { id: "2", name: "Player2" },
        { id: "3", name: "Player3" },
      ],
    },
    {
      id: "3",
      name: "Pro Series Week 5",
      description: "Weekly competitive series",
      status: "upcoming" as const,
      date: "Feb 8, 2024",
      players: [
        { id: "1", name: "Player1" },
        { id: "2", name: "Player2" },
      ],
    },
  ],
  completed: [
    {
      id: "4",
      name: "Fall Championship",
      description: "Previous season finale",
      status: "completed" as const,
      date: "Dec 15, 2023",
      players: [
        { id: "1", name: "Player1" },
        { id: "2", name: "Player2" },
        { id: "3", name: "Player3" },
        { id: "4", name: "Player4" },
      ],
    },
  ],
};

export default function Tournaments() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader 
        title="Tournaments" 
        rightElement={
          <Trophy className="w-6 h-6 text-accent" />
        }
      />

      <div className="px-4 py-6 space-y-6 animate-slide-up">
        {/* Stats */}
        <div className="flex gap-3">
          <StatCard icon={Trophy} value={1} label="Live Now" variant="gold" />
          <StatCard icon={Users} value={8} label="Players" variant="accent" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="w-full bg-secondary">
            <TabsTrigger value="live" className="flex-1">Live</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-4 space-y-3">
            {tournamentsData.live.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                {...tournament}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              />
            ))}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {tournamentsData.upcoming.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                {...tournament}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {tournamentsData.completed.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                {...tournament}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <FloatingActionButton onClick={() => console.log("Create tournament")} />
    </div>
  );
}
