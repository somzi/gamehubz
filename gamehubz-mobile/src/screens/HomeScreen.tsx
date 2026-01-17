import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { FeedCard } from '../components/cards/FeedCard';
import { MatchScheduleCard } from '../components/match/MatchScheduleCard';
import { PageHeader } from '../components/layout/PageHeader';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Placeholder data - matching web app structure
const feedData = [
    {
        id: '1',
        hubName: 'Esports Hub',
        message: 'announced a new tournament',
        tournamentName: 'Winter Championship 2024',
        timestamp: '2h ago',
    },
    {
        id: '2',
        hubName: 'Gaming League',
        message: 'started a live tournament',
        tournamentName: 'Pro Series Finals',
        timestamp: '4h ago',
    },
    {
        id: '3',
        hubName: 'Community Arena',
        message: 'registration is now open',
        tournamentName: 'Spring Showdown',
        timestamp: '6h ago',
    },
];

// Matches needing scheduling
const pendingSchedulingMatches = [
    {
        id: 'match-1',
        tournamentName: 'Spring Showdown',
        roundName: 'Round of 16',
        opponentName: 'NightOwl',
        status: 'pending_availability' as const,
        deadline: 'Jan 25, 2024',
        opponentAvailability: ['2024-01-23-14', '2024-01-23-16', '2024-01-24-18'],
    },
];

// Scheduled and ready matches
const scheduledMatches = [
    {
        id: 'match-2',
        tournamentName: 'Pro League Season 3',
        roundName: 'Quarterfinal',
        opponentName: 'ShadowBlade',
        status: 'scheduled' as const,
        scheduledTime: 'Jan 24 at 20:00',
    },
    {
        id: 'match-3',
        tournamentName: 'Community Cup',
        roundName: 'Semi-final',
        opponentName: 'ThunderStrike',
        status: 'ready_phase' as const,
        scheduledTime: 'Now',
        opponentReady: true,
    },
    {
        id: 'match-4',
        tournamentName: 'Winter Championship',
        roundName: 'Quarterfinal',
        opponentName: 'ProPlayer99',
        status: 'ready_phase' as const,
        scheduledTime: 'Today at 18:00',
        opponentReady: false,
    },
];

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Home"
                showNotifications={true}
            />
            <ScrollView className="flex-1">
                <View className="px-4 py-6 space-y-6">
                    {/* Community News Feed */}
                    <View className="border-b border-border/20 pb-6">
                        <View className="flex-row items-center gap-2 mb-4 px-1">
                            <Ionicons name="newspaper-outline" size={20} color="hsl(220, 15%, 55%)" />
                            <Text className="text-xl font-bold text-foreground">Community Feed</Text>
                        </View>
                        <View className="gap-3">
                            {feedData.map((item) => (
                                <FeedCard
                                    key={item.id}
                                    hubName={item.hubName}
                                    message={item.message}
                                    tournamentName={item.tournamentName}
                                    timestamp={item.timestamp}
                                    onClick={() => navigation.navigate('TournamentDetails', { id: '86F0D7B3-2BCC-4D30-E0FC-08DE55C5AA4E' })}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Needs Scheduling Panel */}
                    {pendingSchedulingMatches.length > 0 && (
                        <View className="border-b border-border/20 pb-6">
                            <View className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <View className="bg-accent/20 p-1.5 rounded-lg">
                                        <Ionicons name="calendar" size={20} color="hsl(45, 90%, 55%)" />
                                    </View>
                                    <Text className="text-lg font-bold text-foreground">Action Required</Text>
                                </View>
                                <Text className="text-sm text-muted-foreground mb-4 ml-1">
                                    You have {pendingSchedulingMatches.length} matches pending scheduling
                                </Text>
                                <View className="gap-3">
                                    {pendingSchedulingMatches.map((match) => (
                                        <MatchScheduleCard
                                            key={match.id}
                                            matchId={match.id}
                                            tournamentName={match.tournamentName}
                                            roundName={match.roundName}
                                            opponentName={match.opponentName}
                                            status={match.status}
                                            deadline={match.deadline}
                                            opponentAvailability={match.opponentAvailability}
                                            onPress={() => navigation.navigate('TournamentDetails', { id: '86F0D7B3-2BCC-4D30-E0FC-08DE55C5AA4E' })}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}

                    {/* My Matches - Scheduled/Ready */}
                    <View className="pb-8">
                        <View className="flex-row items-center gap-2 mb-4 px-1">
                            <Ionicons name="game-controller-outline" size={24} color="hsl(185, 75%, 45%)" />
                            <Text className="text-xl font-bold text-foreground">My Matches</Text>
                        </View>
                        <View className="gap-3">
                            {scheduledMatches.map((match) => (
                                <MatchScheduleCard
                                    key={match.id}
                                    matchId={match.id}
                                    tournamentName={match.tournamentName}
                                    roundName={match.roundName}
                                    opponentName={match.opponentName}
                                    status={match.status}
                                    scheduledTime={match.scheduledTime}
                                    opponentReady={match.opponentReady}
                                    onPress={() => navigation.navigate('TournamentDetails', { id: '1' })}
                                />
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
