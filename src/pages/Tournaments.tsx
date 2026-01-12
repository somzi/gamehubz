import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, DoorOpen } from "lucide-react";
import { TournamentCard } from "@/components/cards/TournamentCard";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { FloatingActionButton } from "@/components/layout/FloatingActionButton";
import { CreateTournamentDialog } from "@/components/dialogs/CreateTournamentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder data with extended fields
const tournamentsData = {
  live: [
    {
      id: "1",
      name: "Winter Championship 2024",
      description: "Annual winter tournament with top players...",
      status: "live" as const,
      date: "Jan 15, 2024",
      region: "Europe",
      minLevel: 3,
      prizePool: "$1,000",
      isOpen: false,
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
      region: "North America",
      minLevel: 2,
      prizePool: "$500",
      isOpen: true,
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
      region: "Global",
      minLevel: 4,
      prizePool: "$2,000",
      isOpen: true,
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
      region: "Europe",
      minLevel: 3,
      prizePool: "$1,500",
      isOpen: false,
      players: [
        { id: "1", name: "Player1" },
        { id: "2", name: "Player2" },
        { id: "3", name: "Player3" },
        { id: "4", name: "Player4" },
      ],
    },
  ],
  open: [
    {
      id: "5",
      name: "Community Cup #12",
      description: "Open registration for all players",
      status: "upcoming" as const,
      date: "Feb 20, 2024",
      region: "Global",
      minLevel: 1,
      prizePool: "$250",
      isOpen: true,
      players: [
        { id: "1", name: "Player1" },
      ],
    },
    {
      id: "6",
      name: "Beginner's League",
      description: "Perfect for new competitive players",
      status: "upcoming" as const,
      date: "Feb 25, 2024",
      region: "Europe",
      minLevel: 1,
      prizePool: "$100",
      isOpen: true,
      players: [],
    },
  ],
};

// Placeholder: current user's level (for eligibility check)
const currentUserLevel = 2;

export default function Tournaments() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const isEligible = (minLevel: number) => currentUserLevel >= minLevel;

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
          <StatCard icon={DoorOpen} value={tournamentsData.open.length} label="Open" variant="accent" />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="w-full bg-secondary grid grid-cols-4">
            <TabsTrigger value="live" className="text-xs px-2">Live</TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs px-2">Upcoming</TabsTrigger>
            <TabsTrigger value="open" className="text-xs px-2">Open</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs px-2">Completed</TabsTrigger>
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
                showApply={tournament.isOpen && isEligible(tournament.minLevel)}
                onClick={() => navigate(`/tournaments/${tournament.id}`)}
              />
            ))}
          </TabsContent>

          <TabsContent value="open" className="mt-4 space-y-3">
            {tournamentsData.open.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DoorOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No open tournaments</p>
              </div>
            ) : (
              tournamentsData.open.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  {...tournament}
                  showApply={isEligible(tournament.minLevel)}
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                />
              ))
            )}
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

      <FloatingActionButton onClick={() => setIsCreateDialogOpen(true)} />
      <CreateTournamentDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
