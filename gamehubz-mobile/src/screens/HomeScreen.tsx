import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { FeedCard } from '../components/cards/FeedCard';
import { MatchScheduleCard } from '../components/match/MatchScheduleCard';
import { PageHeader } from '../components/layout/PageHeader';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Placeholder data for feed
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

interface MatchOverviewDto {
    id?: string; // ID from API response
    matchId?: string; // Optional since API didn't explicitly specify it, but usually needed
    tournamentName: string;
    hubName: string;
    scheduledTime: string | null;
    opponentName: string;
    status: number; // 1 = Action Required, 2 = My Matches
}

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [actionRequiredMatches, setActionRequiredMatches] = useState<MatchOverviewDto[]>([]);
    const [myMatches, setMyMatches] = useState<MatchOverviewDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Collapsible states
    const [expandedSections, setExpandedSections] = useState({
        actionRequired: true,
        communityFeed: true,
        myMatches: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const fetchMatches = async () => {
        if (!user?.id) return;

        try {
            // setLoading(true); // Don't show full loader on refresh
            const response = await authenticatedFetch(ENDPOINTS.GET_USER_HOME_MATCHES(user.id));
            if (response.ok) {
                const data: MatchOverviewDto[] = await response.json();

                // Filter matches based on status
                // Action Required if no scheduled time
                const actionNeeded = data.filter(m => !m.scheduledTime);

                // My Matches if scheduled time exists
                const scheduled = data.filter(m => m.scheduledTime);

                setActionRequiredMatches(actionNeeded);
                setMyMatches(scheduled);
            } else {
                console.error('Failed to fetch home matches', response.status);
            }
        } catch (error) {
            console.error('Error fetching home matches:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchMatches();
        }, [user?.id])
    );

    const renderSectionHeader = (title: string, icon: any, color: string, sectionKey: keyof typeof expandedSections, badge?: number) => (
        <Pressable
            onPress={() => toggleSection(sectionKey)}
            className="flex-row items-center justify-between mb-4 px-1"
        >
            <View className="flex-row items-center gap-2">
                <View className={title === 'Action Required' ? "bg-yellow-500/20 p-1.5 rounded-lg" : ""}>
                    <Ionicons name={icon} size={title === 'Action Required' ? 20 : 24} color={color} />
                </View>
                <Text className="text-xl font-bold text-foreground">{title}</Text>
                {badge !== undefined && badge > 0 && (
                    <View className="bg-destructive px-2 py-0.5 rounded-full ml-1">
                        <Text className="text-xs font-bold text-white">{badge}</Text>
                    </View>
                )}
            </View>
            <Ionicons
                name={expandedSections[sectionKey] ? "chevron-up" : "chevron-down"}
                size={20}
                color="#94A3B8"
            />
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Home"
                showNotifications={true}
            />
            <ScrollView className="flex-1" refreshControl={
                <RefreshControl refreshing={loading} onRefresh={fetchMatches} tintColor="#10B981" />
            } contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="px-4 py-6 space-y-6">
                    {/* Action Required Panel */}
                    {actionRequiredMatches.length > 0 && (
                        <View className="border-b border-border/20 pb-6">
                            {renderSectionHeader('Action Required', 'alert-circle', '#EAB308', 'actionRequired', actionRequiredMatches.length)}

                            {expandedSections.actionRequired && (
                                <View className="gap-3">
                                    <View className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-2">
                                        <Text className="text-sm text-muted-foreground ml-1">
                                            You have {actionRequiredMatches.length} matches needing action
                                        </Text>
                                    </View>
                                    {actionRequiredMatches.map((match, index) => (
                                        <MatchScheduleCard
                                            key={match.matchId || `pending-${index}`}
                                            matchId={match.id || match.matchId || ''}
                                            tournamentName={match.tournamentName}
                                            roundName={match.hubName} // Using HubName as round/context for now
                                            opponentName={match.opponentName}
                                            status="pending_availability"
                                            deadline="Action Required"
                                            onMatchUpdate={fetchMatches}
                                            onPress={() => { }}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Community News Feed */}
                    <View className="border-b border-border/20 pb-6">
                        {renderSectionHeader('Community Feed', 'newspaper-outline', '#94A3B8', 'communityFeed')}

                        {expandedSections.communityFeed && (
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
                        )}
                    </View>

                    {/* My Matches - Scheduled/Ready */}
                    <View className="pb-8">
                        {renderSectionHeader('My Matches', 'game-controller-outline', '#10B981', 'myMatches')}

                        {expandedSections.myMatches && (
                            <View className="gap-3">
                                {myMatches.length > 0 ? (
                                    myMatches.map((match, index) => (
                                        <MatchScheduleCard
                                            key={match.matchId || `scheduled-${index}`}
                                            matchId={match.matchId || ''}
                                            tournamentName={match.tournamentName}
                                            roundName={match.hubName}
                                            opponentName={match.opponentName}
                                            status="scheduled"
                                            scheduledTime={match.scheduledTime ? new Date(match.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                                            onPress={() => { }}
                                        />
                                    ))
                                ) : (
                                    <Text className="text-muted-foreground text-center py-4 italic">No upcoming matches scheduled</Text>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
