import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentBracket } from '../components/bracket/TournamentBracket';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';

type TournamentDetailsRouteProp = RouteProp<RootStackParamList, 'TournamentDetails'>;

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

export default function TournamentDetailsScreen() {
    const route = useRoute<TournamentDetailsRouteProp>();
    const [activeTab, setActiveTab] = useState('bracket');

    const tabs = [
        { label: 'Overview', value: 'overview' },
        { label: 'Bracket', value: 'bracket' },
        { label: 'Players', value: 'players' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Tournament" showBack />
            <ScrollView className="flex-1">
                <View className="animate-slide-up">
                    {/* Hero Section */}
                    <View className="px-4 py-6 bg-card border-b border-border/30">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-xl font-bold text-foreground">{tournamentData.name}</Text>
                                <Text className="text-sm text-muted-foreground mt-1 leading-5">
                                    {tournamentData.description}
                                </Text>
                            </View>
                            <View className="bg-red-500 px-2 py-1 rounded">
                                <Text className="text-[10px] font-bold text-white uppercase">{tournamentData.status}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-6 mb-6">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="people-outline" size={16} color="#71717A" />
                                <Text className="text-sm text-muted-foreground">{tournamentData.playerCount} Players</Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="calendar-outline" size={16} color="#71717A" />
                                <Text className="text-sm text-muted-foreground">{tournamentData.date}</Text>
                            </View>
                        </View>

                        <Button className="w-full">
                            Join Tournament
                        </Button>
                    </View>

                    <View className="px-4 py-4">
                        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    </View>

                    {activeTab === 'overview' && (
                        <View className="px-4 py-2 space-y-4">
                            <View className="bg-card p-4 rounded-xl border border-border/30">
                                <Text className="font-bold text-foreground mb-2">Format</Text>
                                <Text className="text-muted-foreground">{tournamentData.format}</Text>
                            </View>
                            <View className="bg-card p-4 rounded-xl border border-border/30">
                                <Text className="font-bold text-foreground mb-2">Rules</Text>
                                <Text className="text-muted-foreground leading-5">
                                    Standard competitive rules apply. Best of 3 matches for all rounds. Submit scores immediately after play.
                                </Text>
                            </View>
                        </View>
                    )}

                    {activeTab === 'bracket' && (
                        <View className="py-2">
                            <TournamentBracket rounds={bracketData} />
                        </View>
                    )}

                    {activeTab === 'players' && (
                        <View className="px-4 py-2 space-y-3 pb-8">
                            {tournamentData.players.map((player, index) => (
                                <View
                                    key={player.id}
                                    className="flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/30"
                                >
                                    <Text className="w-6 text-center text-sm font-bold text-muted-foreground">
                                        {index + 1}
                                    </Text>
                                    <PlayerAvatar name={player.name} size="sm" className="w-10 h-10" />
                                    <Text className="font-bold text-foreground flex-1">{player.name}</Text>
                                    <Ionicons name="chevron-forward" size={16} color="#3F3F46" />
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
