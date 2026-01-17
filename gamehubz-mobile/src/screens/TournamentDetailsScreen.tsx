import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentBracket } from '../components/bracket/TournamentBracket';
import { TournamentGroups } from '../components/bracket/TournamentGroups';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import { ENDPOINTS } from '../lib/api';

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

export default function TournamentDetailsScreen() {
    const route = useRoute<TournamentDetailsRouteProp>();
    const { id } = route.params;
    const [activeTab, setActiveTab] = useState('bracket');
    const [stages, setStages] = useState<any[]>([]);
    const [loadingBracket, setLoadingBracket] = useState(false);
    const [bracketError, setBracketError] = useState<string | null>(null);

    const fetchBracket = async () => {
        if (!id) return;
        setLoadingBracket(true);
        setBracketError(null);
        try {
            const url = ENDPOINTS.GET_TOURNAMENT_STRUCTURE(id);
            console.log('Fetching bracket from:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch bracket: ${response.status}`);
            }
            const data = await response.json();
            setStages(data.stages || []);
        } catch (err) {
            console.error('Bracket fetch error:', err);
            setBracketError('Failed to load bracket structure');
        } finally {
            setLoadingBracket(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'bracket') {
            fetchBracket();
        }
    }, [id, activeTab]);

    const tabs = [
        { label: 'Overview', value: 'overview' },
        { label: 'Bracket / League', value: 'bracket' },
        { label: 'Players', value: 'players' },
    ];

    const renderStages = () => {
        if (stages.length === 0) {
            return (
                <View className="py-20 items-center justify-center">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4">Bracket not available yet</Text>
                </View>
            );
        }

        return stages.map((stage, index) => (
            <View key={stage.stageId || index} className="mb-8">
                {stages.length > 1 && (
                    <View className="px-4 py-2 bg-muted/20 border-y border-border/10 mb-4">
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Stage {index + 1}: {stage.name}
                        </Text>
                    </View>
                )}

                {stage.rounds && stage.rounds.length > 0 ? (
                    <TournamentBracket rounds={stage.rounds} />
                ) : stage.groups && stage.groups.length > 0 ? (
                    <TournamentGroups groups={stage.groups} />
                ) : (
                    <View className="py-10 items-center justify-center">
                        <Text className="text-muted-foreground">No matches scheduled for this stage</Text>
                    </View>
                )}
            </View>
        ));
    };

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
                            {loadingBracket ? (
                                <View className="py-20 items-center justify-center">
                                    <ActivityIndicator size="large" color="#8B5CF6" />
                                    <Text className="text-muted-foreground mt-4">Loading structure...</Text>
                                </View>
                            ) : bracketError ? (
                                <View className="py-20 items-center justify-center px-4">
                                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                                    <Text className="text-destructive mt-4 text-center">{bracketError}</Text>
                                    <Button onPress={fetchBracket} variant="outline" size="sm" className="mt-4">
                                        Retry
                                    </Button>
                                </View>
                            ) : (
                                renderStages()
                            )}
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
