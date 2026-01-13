import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { StatCard } from '../components/ui/StatCard';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { SocialLinks } from '../components/profile/SocialLinks';
import { FairPlayStats } from '../components/profile/FairPlayStats';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

// Mock data matching the web app
const playerData = {
    username: 'ProPlayer99',
    discordNickname: 'ProPlayer99#1234',
    inGameNickname: 'xProPlayer',
    totalMatches: 48,
    winPercentage: 67,
    wins: 32,
    losses: 16,
    level: 3,
    fairPlayScore: 95,
    noShowCount: 1,
    reportsCount: 0,
    socials: [
        { platform: 'discord' as const, username: 'ProPlayer99#1234', url: '#' },
        { platform: 'tiktok' as const, username: '@proplayer99', url: 'https://tiktok.com/@proplayer99' },
        { platform: 'instagram' as const, username: '@proplayer99', url: 'https://instagram.com/proplayer99' },
    ],
};

const matchHistory = [
    {
        id: '1',
        tournamentName: 'Winter Championship',
        opponentName: 'GamerX',
        result: 'win' as const,
        date: 'Jan 15, 2024',
    },
    {
        id: '2',
        tournamentName: 'Weekly Cup #42',
        opponentName: 'ChampionKing',
        result: 'win' as const,
        date: 'Jan 12, 2024',
    },
    {
        id: '3',
        tournamentName: 'Pro Series',
        opponentName: 'NightHawk',
        result: 'loss' as const,
        date: 'Jan 10, 2024',
    },
    {
        id: '4',
        tournamentName: 'Community Battle',
        opponentName: 'ShadowStrike',
        result: 'win' as const,
        date: 'Jan 8, 2024',
    },
];

const tabs = [
    { label: 'Stats', value: 'stats' },
    { label: 'History', value: 'history' },
    { label: 'Fair Play', value: 'fair-play' },
];

export default function ProfileScreen() {
    const [activeTab, setActiveTab] = useState('stats');

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Profile"
                rightElement={
                    <Button onPress={() => { }} variant="ghost" size="sm">
                        <Text className="text-primary font-medium">Edit</Text>
                    </Button>
                }
            />
            <ScrollView className="flex-1">
                {/* Profile Header */}
                <View className="px-4 py-6 bg-card border-b border-border/30 items-center">
                    <PlayerAvatar src={undefined} name={playerData.username} size="xl" />
                    <Text className="text-xl font-bold mt-4 text-foreground">{playerData.username}</Text>

                    <View className="mt-2 px-3 py-1 rounded-full bg-primary/20">
                        <Text className="text-primary text-xs font-semibold">Level {playerData.level}</Text>
                    </View>

                    <View className="flex-row items-center gap-2 mt-3">
                        <Ionicons name="game-controller" size={16} color="hsl(220, 15%, 55%)" />
                        <Text className="text-sm text-muted-foreground">{playerData.inGameNickname}</Text>
                    </View>

                    {/* Social icons in header */}
                    <View className="mt-4 w-full">
                        <SocialLinks links={playerData.socials} className="justify-center" />
                    </View>
                </View>

                {/* Tabs */}
                <View className="px-4 py-4">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <View className="mt-4">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Statistics</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="game-controller-outline" value={playerData.totalMatches} label="Matches" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trending-up" value={`${playerData.winPercentage}%`} label="Win Rate" variant="accent" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trophy" value={playerData.wins} label="Wins" variant="gold" />
                                    </View>
                                    <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border/30">
                                        <View className="w-8 h-8 rounded-lg items-center justify-center bg-destructive/10 mb-2">
                                            <Ionicons name="close-circle" size={18} color="hsl(0, 72%, 51%)" />
                                        </View>
                                        <Text className="text-2xl font-bold text-destructive">{playerData.losses}</Text>
                                        <Text className="text-xs text-muted-foreground">Losses</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'history' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Match History</Text>
                                <View>
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
                        )}

                        {activeTab === 'fair-play' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Fair Play</Text>
                                <FairPlayStats
                                    fairPlayScore={playerData.fairPlayScore}
                                    noShowCount={playerData.noShowCount}
                                    reportsCount={playerData.reportsCount}
                                    matchesPlayed={playerData.totalMatches}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
