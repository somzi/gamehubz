import { Trophy, Target, TrendingUp, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatCard } from "@/components/ui/StatCard";
import { MatchHistoryCard } from "@/components/cards/MatchHistoryCard";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { FairPlayStats } from "@/components/profile/FairPlayStats";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Placeholder data
const playerData = {
  username: "ProPlayer99",
  discordNickname: "ProPlayer99#1234",
  inGameNickname: "xProPlayer",
  totalMatches: 48,
  winPercentage: 67,
  wins: 32,
  losses: 16,
  level: 3,
  fairPlayScore: 95,
  noShowCount: 1,
  reportsCount: 0,
  socials: [
    { platform: "discord" as const, username: "ProPlayer99#1234", url: "#" },
    { platform: "tiktok" as const, username: "@proplayer99", url: "https://tiktok.com/@proplayer99" },
    { platform: "instagram" as const, username: "@proplayer99", url: "https://instagram.com/proplayer99" },
  ],
};

const matchHistory = [
  {
    id: "1",
    tournamentName: "Winter Championship",
    opponentName: "GamerX",
    result: "win" as const,
    date: "Jan 15, 2024",
  },
  {
    id: "2",
    tournamentName: "Weekly Cup #42",
    opponentName: "ChampionKing",
    result: "win" as const,
    date: "Jan 12, 2024",
  },
  {
    id: "3",
    tournamentName: "Pro Series",
    opponentName: "NightHawk",
    result: "loss" as const,
    date: "Jan 10, 2024",
  },
  {
    id: "4",
    tournamentName: "Community Battle",
    opponentName: "ShadowStrike",
    result: "win" as const,
    date: "Jan 8, 2024",
  },
];

export default function Profile() {
  return (
    <div className="min-h-screen pb-24">
      <PageHeader 
        title="Profile" 
        rightElement={
          <Button variant="ghost" size="sm" className="text-primary">
            Edit
          </Button>
        }
      />

      <div className="animate-slide-up">
        {/* Profile Header */}
        <div className="px-4 py-6 gradient-card border-b border-border/30">
          <div className="flex flex-col items-center text-center">
            <PlayerAvatar name={playerData.username} size="xl" />
            <h1 className="text-xl font-bold mt-4">{playerData.username}</h1>
            
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              Level {playerData.level}
            </div>
            
            <div className="flex flex-col gap-1 mt-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                <span>{playerData.inGameNickname}</span>
              </div>
            </div>

            {/* Compact social icons in header */}
            <div className="mt-4">
              <SocialLinks links={playerData.socials} variant="compact" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="px-4 py-4">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="fair-play">Fair Play</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Target} value={playerData.totalMatches} label="Total Matches" />
              <StatCard icon={TrendingUp} value={`${playerData.winPercentage}%`} label="Win Rate" variant="accent" />
              <StatCard icon={Trophy} value={playerData.wins} label="Wins" variant="gold" />
              <div className="stat-card flex-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-destructive/20">
                  <Trophy className="w-4 h-4 text-destructive" />
                </div>
                <p className="text-2xl font-bold text-destructive">{playerData.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {matchHistory.map((match) => (
              <MatchHistoryCard
                key={match.id}
                tournamentName={match.tournamentName}
                opponentName={match.opponentName}
                result={match.result}
                date={match.date}
              />
            ))}
          </TabsContent>

          <TabsContent value="fair-play">
            <FairPlayStats
              fairPlayScore={playerData.fairPlayScore}
              noShowCount={playerData.noShowCount}
              reportsCount={playerData.reportsCount}
              matchesPlayed={playerData.totalMatches}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
