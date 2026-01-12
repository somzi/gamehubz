import { useParams } from "react-router-dom";
import { Calendar, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { TournamentBracket } from "@/components/bracket/TournamentBracket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

// Placeholder data
const tournamentData = {
  id: "1",
  name: "Winter Championship 2024",
  description: "Annual winter tournament featuring the best players from around the world. Single elimination bracket format.",
  status: "live" as const,
  date: "Jan 15, 2024",
  format: "Single Elimination",
  playerCount: 8,
  players: [
    { id: "1", name: "ProPlayer99" },
    { id: "2", name: "GamerX" },
    { id: "3", name: "ChampionKing" },
    { id: "4", name: "NightHawk" },
    { id: "5", name: "ShadowStrike" },
    { id: "6", name: "BlazeMaster" },
    { id: "7", name: "IcePhoenix" },
    { id: "8", name: "ThunderBolt" },
  ],
};

const bracketData = [
  {
    name: "Quarterfinals",
    matches: [
      {
        id: "qf1",
        player1: { id: "1", name: "ProPlayer99", score: 2 },
        player2: { id: "2", name: "GamerX", score: 1 },
        winnerId: "1",
      },
      {
        id: "qf2",
        player1: { id: "3", name: "ChampionKing", score: 2 },
        player2: { id: "4", name: "NightHawk", score: 0 },
        winnerId: "3",
      },
      {
        id: "qf3",
        player1: { id: "5", name: "ShadowStrike", score: 1 },
        player2: { id: "6", name: "BlazeMaster", score: 2 },
        winnerId: "6",
      },
      {
        id: "qf4",
        player1: { id: "7", name: "IcePhoenix", score: 2 },
        player2: { id: "8", name: "ThunderBolt", score: 1 },
        winnerId: "7",
      },
    ],
  },
  {
    name: "Semifinals",
    matches: [
      {
        id: "sf1",
        player1: { id: "1", name: "ProPlayer99" },
        player2: { id: "3", name: "ChampionKing" },
      },
      {
        id: "sf2",
        player1: { id: "6", name: "BlazeMaster" },
        player2: { id: "7", name: "IcePhoenix" },
      },
    ],
  },
  {
    name: "Finals",
    matches: [
      {
        id: "f1",
      },
    ],
  },
];

export default function TournamentDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Tournament" showBack />

      <div className="animate-slide-up">
        {/* Hero Section */}
        <div className="px-4 py-6 gradient-card border-b border-border/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{tournamentData.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tournamentData.description}
              </p>
            </div>
            <StatusBadge status={tournamentData.status} />
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{tournamentData.playerCount} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{tournamentData.date}</span>
            </div>
          </div>

          <Button className="w-full gradient-accent text-primary-foreground font-semibold">
            Join Tournament
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bracket" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-12">
            <TabsTrigger 
              value="overview" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="bracket"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Bracket
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="px-4 py-6 space-y-4">
            <div className="stat-card">
              <h3 className="font-semibold mb-2">Format</h3>
              <p className="text-muted-foreground">{tournamentData.format}</p>
            </div>
            <div className="stat-card">
              <h3 className="font-semibold mb-2">Rules</h3>
              <p className="text-muted-foreground">
                Standard competitive rules apply. Best of 3 matches for all rounds.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="bracket" className="py-4">
            <TournamentBracket rounds={bracketData} />
          </TabsContent>

          <TabsContent value="players" className="px-4 py-6">
            <div className="space-y-3">
              {tournamentData.players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30"
                >
                  <span className="w-6 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <PlayerAvatar name={player.name} size="sm" />
                  <span className="font-medium">{player.name}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
