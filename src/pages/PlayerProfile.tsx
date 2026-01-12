import { useParams } from "react-router-dom";
import { Trophy, Target, TrendingUp, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { StatCard } from "@/components/ui/StatCard";
import { MatchHistoryCard } from "@/components/cards/MatchHistoryCard";
import { SocialLinks } from "@/components/profile/SocialLinks";

// Placeholder data - would come from API based on playerId
const getPlayerData = (id: string) => ({
  id,
  username: id === "1" ? "ProPlayer99" : `Player${id}`,
  discordNickname: `Player${id}#${Math.floor(1000 + Math.random() * 9000)}`,
  inGameNickname: `xPlayer${id}`,
  totalMatches: Math.floor(20 + Math.random() * 80),
  winPercentage: Math.floor(40 + Math.random() * 40),
  wins: Math.floor(10 + Math.random() * 40),
  losses: Math.floor(5 + Math.random() * 20),
  level: Math.floor(1 + Math.random() * 5),
  socials: [
    { platform: "discord" as const, username: `Player${id}#1234`, url: "#" },
    { platform: "tiktok" as const, username: `@player${id}`, url: `https://tiktok.com/@player${id}` },
    { platform: "instagram" as const, username: `@player${id}`, url: `https://instagram.com/player${id}` },
  ],
});

const getMatchHistory = (playerId: string) => [
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
    result: "loss" as const,
    date: "Jan 12, 2024",
  },
  {
    id: "3",
    tournamentName: "Pro Series",
    opponentName: "NightHawk",
    result: "win" as const,
    date: "Jan 10, 2024",
  },
];

export default function PlayerProfile() {
  const { id } = useParams();
  const playerData = getPlayerData(id || "1");
  const matchHistory = getMatchHistory(id || "1");

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Player Profile" showBack />

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
          </div>
        </div>

        {/* Social Links */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-3">Connected Accounts</h2>
          <SocialLinks links={playerData.socials} />
        </div>

        {/* Stats */}
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
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
        </div>

        {/* Match History */}
        <section className="px-4 py-4">
          <h2 className="text-lg font-semibold mb-4">Match History</h2>
          <div className="space-y-2">
            {matchHistory.map((match) => (
              <MatchHistoryCard
                key={match.id}
                tournamentName={match.tournamentName}
                opponentName={match.opponentName}
                result={match.result}
                date={match.date}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
