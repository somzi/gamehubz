import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Image } from 'react-native';
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
import { PlayerAvatar } from '../components/ui/PlayerAvatar';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

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
    id?: string;
    matchId?: string;
    tournamentName: string;
    hubName: string;
    scheduledTime: string | null;
    opponentName: string;
    status: number;
}

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [actionRequiredMatches, setActionRequiredMatches] = useState<MatchOverviewDto[]>([]);
    const [myMatches, setMyMatches] = useState<MatchOverviewDto[]>([]);
    const [loading, setLoading] = useState(true);

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
            const response = await authenticatedFetch(ENDPOINTS.GET_USER_HOME_MATCHES(user.id));
            if (response.ok) {
                const data: MatchOverviewDto[] = await response.json();
                setActionRequiredMatches(data.filter(m => !m.scheduledTime));
                setMyMatches(data.filter(m => m.scheduledTime));
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
                <View className="p-1 px-1.5 bg-white/5 rounded-lg border border-white/10">
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text className="text-sm font-bold text-slate-400 uppercase tracking-[2px]">{title}</Text>
                {badge !== undefined && badge > 0 && (
                    <View className="bg-primary/20 border border-primary/30 px-1.5 py-0.5 rounded-md ml-1">
                        <Text className="text-[10px] font-black text-primary">{badge}</Text>
                    </View>
                )}
            </View>
            <Ionicons
                name={expandedSections[sectionKey] ? "chevron-up" : "chevron-down"}
                size={16}
                color="#64748B"
            />
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Dashboard" showNotifications={true} className="border-b-0" />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMatches} tintColor="#10B981" />}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="px-4 py-4 space-y-32">



                    {/* Action Required */}
                    {actionRequiredMatches.length > 0 && (
                        <View>
                            {renderSectionHeader('Attention', 'alert-circle', '#EAB308', 'actionRequired', actionRequiredMatches.length)}
                            {expandedSections.actionRequired && (
                                <View className="gap-3 mt-1">
                                    {actionRequiredMatches.map((match, index) => (
                                        <MatchScheduleCard
                                            key={match.matchId || `pending-${index}`}
                                            matchId={match.id || match.matchId || ''}
                                            tournamentName={match.tournamentName}
                                            roundName={match.hubName}
                                            opponentName={match.opponentName}
                                            status="pending_availability"
                                            onMatchUpdate={fetchMatches}
                                            onPress={() => { }}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Community News Feed */}
                    <View>
                        {renderSectionHeader('Highlights', 'planet-outline', '#10B981', 'communityFeed')}

                        {expandedSections.communityFeed && (
                            <View className="gap-3 mt-1">
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

                    {/* My Matches */}
                    <View>
                        {renderSectionHeader('Active Matches', 'game-controller-outline', '#6366F1', 'myMatches')}

                        {expandedSections.myMatches && (
                            <View className="gap-3 mt-1">
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
                                            onMatchUpdate={fetchMatches}
                                            onPress={() => { }}
                                        />
                                    ))
                                ) : (
                                    <View className="py-10 items-center justify-center border border-dashed border-white/5 rounded-3xl">
                                        <Ionicons name="calendar-outline" size={24} color="#334155" />
                                        <Text className="text-slate-500 text-xs font-medium mt-3">No upcoming matches</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

