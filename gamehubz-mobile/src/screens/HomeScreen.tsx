import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { FeedCard } from '../components/cards/FeedCard';
import { MatchScheduleCard } from '../components/match/MatchScheduleCard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { DashboardActivityDto } from '../types/dashboard';
import { HighlightsModal } from '../components/modals/HighlightsModal';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MatchOverviewDto {
    id?: string;
    matchId?: string;
    tournamentId?: string;
    tournamentName: string;
    hubName: string;
    scheduledTime: string | null;
    opponentName: string;
    opponentAvatarUrl?: string;
    status: number;
}

export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { user } = useAuth();
    const [actionRequiredMatches, setActionRequiredMatches] = useState<MatchOverviewDto[]>([]);
    const [myMatches, setMyMatches] = useState<MatchOverviewDto[]>([]);
    const [hubActivities, setHubActivities] = useState<DashboardActivityDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showHighlightsModal, setShowHighlightsModal] = useState(false);
    const [isActionRequiredCollapsed, setIsActionRequiredCollapsed] = useState(false);
    const [isActiveMatchesCollapsed, setIsActiveMatchesCollapsed] = useState(false);
    const [isHighlightsCollapsed, setIsHighlightsCollapsed] = useState(false);

    const fetchMatches = async () => {
        if (!user?.id) return;
        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_USER_HOME_MATCHES(user.id));
            if (response.ok) {
                const data: any[] = await response.json();
                const normalizedData: MatchOverviewDto[] = data.map(m => ({
                    id: m.id || m.Id,
                    matchId: m.matchId || m.MatchId,
                    tournamentId: m.tournamentId || m.TournamentId,
                    tournamentName: m.tournamentName || m.TournamentName,
                    hubName: m.hubName || m.HubName,
                    scheduledTime: m.scheduledTime || m.ScheduledTime || null,
                    opponentName: m.opponentName || m.OpponentName,
                    opponentAvatarUrl: m.opponentAvatarUrl || m.OpponentAvatarUrl,
                    status: m.status !== undefined ? m.status : m.Status
                }));
                setActionRequiredMatches(normalizedData.filter(m => !m.scheduledTime));
                setMyMatches(normalizedData.filter(m => m.scheduledTime));
            }
        } catch (error) {
            console.error('Error fetching home matches:', error);
        }
    };

    const fetchHubActivities = async () => {
        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_HUB_ACTIVITY_HOME);
            if (response.ok) {
                const data: any[] = await response.json();
                const activities: DashboardActivityDto[] = data.map(a => ({
                    hubName: a.hubName || a.HubName,
                    message: a.message || a.Message,
                    tournamentName: a.tournamentName || a.TournamentName,
                    timeAgo: a.timeAgo || a.TimeAgo,
                    createdOn: a.createdOn || a.CreatedOn,
                    type: a.type || a.Type,
                    hubAvatar: a.hubAvatar || a.HubAvatar,
                    hubAvatarUrl: a.hubAvatarUrl || a.HubAvatarUrl
                }));
                setHubActivities(activities);
            }
        } catch (error) {
            console.error('Error fetching hub activities:', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchMatches(), fetchHubActivities()]);
        setLoading(false);
    };

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [user?.id])
    );

    const totalMatches = actionRequiredMatches.length + myMatches.length;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#10B981" />}
                contentContainerStyle={{ paddingBottom: 110 }}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Hero Header ── */}
                <View className="px-5 pt-5 pb-6">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-slate-400 text-sm font-medium mb-0.5">{getGreeting()}</Text>
                            <Text className="text-white text-2xl font-black tracking-tight" numberOfLines={1}>
                                {user?.username || 'Player'} 👋
                            </Text>
                        </View>
                        <PlayerAvatar
                            src={user?.avatarUrl || undefined}
                            name={user?.username || 'P'}
                            size="lg"
                        />
                    </View>
                </View>

                <View className="px-5 gap-8">

                    {/* ── Action Required ── */}
                    {actionRequiredMatches.length > 0 && (
                        <View>
                            {/* Section Header */}
                            <View className="flex-row items-center justify-between mb-3">
                                <Pressable 
                                    onPress={() => setIsActionRequiredCollapsed(!isActionRequiredCollapsed)}
                                    className="flex-row items-center gap-2"
                                >
                                    <View className="w-1 h-5 rounded-full bg-yellow-500" />
                                    <Text className="text-white font-black text-base tracking-tight">Needs Attention</Text>
                                    <View className="bg-yellow-500/20 px-2 py-0.5 rounded-full">
                                        <Text className="text-[11px] font-black text-yellow-400">{actionRequiredMatches.length}</Text>
                                    </View>
                                    <Ionicons 
                                        name={isActionRequiredCollapsed ? "chevron-down" : "chevron-up"} 
                                        size={14} 
                                        color="#EAB308" 
                                    />
                                </Pressable>
                                <Pressable
                                    onPress={() => navigation.navigate('MyMatches')}
                                    className="flex-row items-center gap-1"
                                >
                                    <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">See All</Text>
                                    <Ionicons name="chevron-forward" size={12} color="#64748B" />
                                </Pressable>
                            </View>

                            {!isActionRequiredCollapsed && (
                                <View className="gap-2.5">
                                    {actionRequiredMatches.slice(0, 3).map((match, index) => (
                                        <MatchScheduleCard
                                            key={match.matchId || `pending-${index}`}
                                            matchId={match.id || match.matchId || ''}
                                            tournamentId={match.tournamentId || ''}
                                            tournamentName={match.tournamentName}
                                            roundName={match.hubName}
                                            opponentName={match.opponentName}
                                            opponentAvatarUrl={match.opponentAvatarUrl}
                                            status="pending_availability"
                                            onMatchUpdate={fetchMatches}
                                        />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* ── Active Matches ── */}
                    <View>
                        <View className="flex-row items-center justify-between mb-3">
                        <Pressable 
                            onPress={() => setIsActiveMatchesCollapsed(!isActiveMatchesCollapsed)}
                            className="flex-row items-center gap-2"
                        >
                            <View className="w-1 h-5 rounded-full bg-primary" />
                            <Text className="text-white font-black text-base tracking-tight">Active Matches</Text>
                            <Ionicons 
                                name={isActiveMatchesCollapsed ? "chevron-down" : "chevron-up"} 
                                size={14} 
                                color="#10B981" 
                            />
                        </Pressable>
                            <Pressable
                                onPress={() => navigation.navigate('MyMatches')}
                                className="flex-row items-center gap-1"
                            >
                                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">See All</Text>
                                <Ionicons name="chevron-forward" size={12} color="#64748B" />
                            </Pressable>
                        </View>

                        {!isActiveMatchesCollapsed && (
                            myMatches.length > 0 ? (
                                <View className="gap-2.5">
                                    {myMatches.slice(0, 3).map((match, index) => (
                                        <MatchScheduleCard
                                            key={match.matchId || `scheduled-${index}`}
                                            matchId={match.id || ''}
                                            tournamentId={match.tournamentId || ''}
                                            tournamentName={match.tournamentName}
                                            roundName={match.hubName}
                                            opponentName={match.opponentName}
                                            opponentAvatarUrl={match.opponentAvatarUrl}
                                            status="scheduled"
                                            scheduledTime={match.scheduledTime
                                                ? new Date(match.scheduledTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                : 'TBD'}
                                            onMatchUpdate={fetchMatches}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <View className="py-10 items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5">
                                    <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center mb-3">
                                        <Ionicons name="game-controller-outline" size={28} color="#10B981" />
                                    </View>
                                    <Text className="text-white font-bold text-sm">No active matches</Text>
                                    <Text className="text-slate-500 text-xs mt-1">Join a tournament to get started</Text>
                                </View>
                            )
                        )}
                    </View>

                    {/* ── Community Highlights ── */}
                    <View>
                        <View className="flex-row items-center justify-between mb-3">
                        <Pressable 
                            onPress={() => setIsHighlightsCollapsed(!isHighlightsCollapsed)}
                            className="flex-row items-center gap-2"
                        >
                            <View className="w-1 h-5 rounded-full bg-indigo-500" />
                            <Text className="text-white font-black text-base tracking-tight">Highlights</Text>
                            <Ionicons 
                                name={isHighlightsCollapsed ? "chevron-down" : "chevron-up"} 
                                size={14} 
                                color="#6366F1" 
                            />
                        </Pressable>
                            <Pressable
                                onPress={() => setShowHighlightsModal(true)}
                                className="flex-row items-center gap-1"
                            >
                                <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">See All</Text>
                                <Ionicons name="chevron-forward" size={12} color="#64748B" />
                            </Pressable>
                        </View>

                        {!isHighlightsCollapsed && (
                            hubActivities.length > 0 ? (
                                <View className="gap-2.5">
                                    {hubActivities.slice(0, 3).map((item, index) => (
                                        <FeedCard
                                            key={index}
                                            hubName={item.hubName}
                                            hubAvatar={item.hubAvatarUrl || item.hubAvatar}
                                            message={item.message}
                                            tournamentName={item.tournamentName}
                                            timestamp={item.timeAgo}
                                            onClick={() => { }}
                                        />
                                    ))}
                                </View>
                            ) : (
                                <View className="py-10 items-center justify-center bg-white/[0.02] rounded-3xl border border-white/5">
                                    <View className="w-14 h-14 rounded-2xl bg-indigo-500/10 items-center justify-center mb-3">
                                        <Ionicons name="planet-outline" size={28} color="#6366F1" />
                                    </View>
                                    <Text className="text-white font-bold text-sm">No highlights yet</Text>
                                    <Text className="text-slate-500 text-xs mt-1">Activity from your hubs will appear here</Text>
                                </View>
                            )
                        )}
                    </View>

                </View>
            </ScrollView>

            <HighlightsModal
                visible={showHighlightsModal}
                onClose={() => setShowHighlightsModal(false)}
            />
        </SafeAreaView>
    );
}
