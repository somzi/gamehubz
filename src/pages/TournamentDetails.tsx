import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, FileText, Trophy, Coins, Globe, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { TournamentBracket } from "@/components/bracket/TournamentBracket";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { AdminPlayerList } from "@/components/admin/AdminPlayerList";

// Placeholder data
const tournamentData = {
  id: "1",
  name: "Winter Championship 2024",
  description: "Annual winter tournament featuring the best players from around the world. Single elimination bracket format.",
  status: "live" as const,
  date: "Jan 15, 2024",
  format: "Single Elimination",
  rules: `1. Best of 3 matches for all rounds except Finals (Best of 5)
2. No use of exploits or glitches
3. Players must be ready 5 minutes before scheduled time
4. No-shows will result in automatic disqualification
5. All disputes must be reported to admins within 15 minutes
6. Unsportsmanlike behavior will not be tolerated`,
  maxPlayers: 16,
  playerCount: 8,
  region: "Global",
  prizePool: "$1,000",
  minLevel: 3,
  isOpen: false,
  isAdmin: true, // Placeholder: check if current user is admin
  players: [
    { id: "1", name: "ProPlayer99", level: 4, fairPlayScore: 95, noShowCount: 0, registeredAt: "Jan 10" },
    { id: "2", name: "GamerX", level: 3, fairPlayScore: 88, noShowCount: 1, registeredAt: "Jan 11" },
    { id: "3", name: "ChampionKing", level: 5, fairPlayScore: 92, noShowCount: 0, registeredAt: "Jan 11" },
    { id: "4", name: "NightHawk", level: 3, fairPlayScore: 78, noShowCount: 2, registeredAt: "Jan 12" },
    { id: "5", name: "ShadowStrike", level: 4, fairPlayScore: 85, noShowCount: 0, registeredAt: "Jan 12" },
    { id: "6", name: "BlazeMaster", level: 3, fairPlayScore: 90, noShowCount: 0, registeredAt: "Jan 13" },
    { id: "7", name: "IcePhoenix", level: 4, fairPlayScore: 97, noShowCount: 0, registeredAt: "Jan 13" },
    { id: "8", name: "ThunderBolt", level: 3, fairPlayScore: 82, noShowCount: 1, registeredAt: "Jan 14" },
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

// Placeholder: current user level
const currentUserLevel = 3;

export default function TournamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState(tournamentData.players);
  
  const isEligible = currentUserLevel >= tournamentData.minLevel;
  const canApply = tournamentData.isOpen && isEligible && players.length < tournamentData.maxPlayers;
  
  const handleRemovePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    console.log("Removed player:", playerId);
  };

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

          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{players.length}/{tournamentData.maxPlayers} players</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{tournamentData.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{tournamentData.region}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              <span>Min Level {tournamentData.minLevel}</span>
            </div>
            {tournamentData.prizePool && (
              <div className="flex items-center gap-2 col-span-2">
                <Coins className="w-4 h-4 text-accent" />
                <span className="text-accent font-semibold">{tournamentData.prizePool}</span>
              </div>
            )}
          </div>

          {canApply ? (
            <Button className="w-full gradient-accent text-primary-foreground font-semibold">
              <UserPlus className="w-4 h-4 mr-2" />
              Apply to Join
            </Button>
          ) : tournamentData.isOpen && !isEligible ? (
            <div className="text-center py-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Level {tournamentData.minLevel} required to join
              </p>
            </div>
          ) : null}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full bg-transparent border-b border-border rounded-none h-12 grid grid-cols-4">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="bracket"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
            >
              Bracket
            </TabsTrigger>
            <TabsTrigger 
              value="players"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
            >
              Players
            </TabsTrigger>
            {tournamentData.isAdmin && (
              <TabsTrigger 
                value="admin"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs"
              >
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="px-4 py-6 space-y-4">
            <div className="stat-card">
              <h3 className="font-semibold mb-2">Format</h3>
              <p className="text-muted-foreground">{tournamentData.format}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Rules</h3>
              </div>
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                {tournamentData.rules}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="bracket" className="py-4">
            <TournamentBracket rounds={bracketData} />
          </TabsContent>

          <TabsContent value="players" className="px-4 py-6">
            <div className="space-y-3">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/30 cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/players/${player.id}`)}
                >
                  <span className="w-6 text-center text-sm text-muted-foreground">
                    {index + 1}
                  </span>
                  <PlayerAvatar name={player.name} size="sm" />
                  <div className="flex-1">
                    <span className="font-medium">{player.name}</span>
                    <p className="text-xs text-muted-foreground">Level {player.level}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {tournamentData.isAdmin && (
            <TabsContent value="admin" className="px-4 py-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Registered Players</h3>
                <p className="text-sm text-muted-foreground">
                  {players.length} of {tournamentData.maxPlayers} slots filled
                </p>
              </div>
              <AdminPlayerList
                tournamentId={tournamentData.id}
                players={players}
                onRemovePlayer={handleRemovePlayer}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
