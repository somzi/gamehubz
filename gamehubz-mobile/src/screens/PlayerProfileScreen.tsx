import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { StatCard } from '../components/ui/StatCard';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { SocialLinks } from '../components/profile/SocialLinks';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';

type PlayerProfileRouteProp = RouteProp<RootStackParamList, 'PlayerProfile'>;

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

export default function PlayerProfileScreen() {
    const route = useRoute<PlayerProfileRouteProp>();
    const { id } = route.params;
    const playerData = getPlayerData(id || "1");
    const matchHistory = getMatchHistory(id || "1");

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Player Profile" showBack />
            <ScrollView className="flex-1">
                <View className="animate-slide-up">
                    {/* Profile Header */}
                    <View className="px-4 py-8 items-center bg-card border-b border-border/30">
                        <PlayerAvatar name={playerData.username} size="lg" className="w-24 h-24" />
                        <Text className="text-2xl font-bold mt-4 text-foreground">{playerData.username}</Text>

                        <View className="mt-2 px-3 py-1 rounded-full bg-accent/20">
                            <Text className="text-accent text-xs font-bold uppercase">Level {playerData.level}</Text>
                        </View>

                        <View className="flex-row items-center gap-2 mt-4">
                            <Ionicons name="game-controller" size={16} color="#71717A" />
                            <Text className="text-sm text-muted-foreground font-medium">{playerData.inGameNickname}</Text>
                        </View>
                    </View>

                    <View className="px-4 py-6 space-y-6">
                        <Button onPress={() => { }} className="w-full">
                            Challenge Player
                        </Button>

                        {/* Social Links */}
                        <View>
                            <Text className="text-lg font-bold mb-4 text-foreground">Connected Accounts</Text>
                            <SocialLinks links={playerData.socials} />
                        </View>

                        {/* Stats */}
                        <View>
                            <Text className="text-lg font-bold mb-4 text-foreground">Statistics</Text>
                            <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[45%]">
                                    <StatCard icon="game-controller" value={playerData.totalMatches} label="Matches" />
                                </View>
                                <View className="flex-1 min-w-[45%]">
                                    <StatCard icon="trending-up" value={`${playerData.winPercentage}%`} label="Win Rate" variant="accent" />
                                </View>
                                <View className="flex-1 min-w-[45%]">
                                    <StatCard icon="trophy" value={playerData.wins} label="Wins" variant="gold" />
                                </View>
                                <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border/30">
                                    <View className="w-8 h-8 rounded-lg items-center justify-center bg-destructive/10 mb-2">
                                        <Ionicons name="close-circle" size={18} color="#EF4444" />
                                    </View>
                                    <Text className="text-2xl font-bold text-destructive">{playerData.losses}</Text>
                                    <Text className="text-xs text-muted-foreground">Losses</Text>
                                </View>
                            </View>
                        </View>

                        {/* Match History */}
                        <View className="pb-8">
                            <Text className="text-lg font-bold mb-4 text-foreground">Match History</Text>
                            <View className="space-y-3">
                                {matchHistory.map((match) => (
                                    <MatchHistoryCard
                                        key={match.id}
                                        tournamentName={match.tournamentName}
                                        opponentName={match.opponentName}
                                        result={match.result}
                                        date={match.date}
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
