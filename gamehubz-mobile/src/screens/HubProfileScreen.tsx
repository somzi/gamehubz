import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { TournamentCard } from '../components/cards/TournamentCard';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from '../components/ui/Tabs';
import { cn } from '../lib/utils';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SocialLinks } from '../components/profile/SocialLinks';
import { SocialType } from '../types/auth';
import { getSocialUrl } from '../lib/social';

type HubProfileRouteProp = RouteProp<RootStackParamList, 'HubProfile'>;

export default function HubProfileScreen() {
    const route = useRoute<HubProfileRouteProp>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [activeTab, setActiveTab] = useState('live');
    const [hubData, setHubData] = useState<any>(null);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isListLoading, setIsListLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHubDetails();
    }, [id]);

    useEffect(() => {
        // Reset list when tab changes
        setTournaments([]);
        setPage(0);
        setHasMore(true);
        fetchTournaments(0, activeTab);
    }, [activeTab]);

    const fetchHubDetails = async () => {
        try {
            setIsLoading(true);
            const response = await authenticatedFetch(ENDPOINTS.GET_HUB(id));
            if (!response.ok) {
                throw new Error('Failed to fetch hub details');
            }
            const data = await response.json();
            setHubData(data.result || data);
            setIsFollowing(data.result?.isUserFollowHub || data.isUserFollowHub || false);
            setIsOwner(data.result?.isUserOwner || data.isUserOwner || false);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching hub details:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTournaments = async (currentPage: number, tab: string) => {
        if (!hasMore && currentPage > 0) return;

        try {
            setIsListLoading(true);
            let status = 1; // Default to Upcoming (1)

            if (tab === 'live') status = 3; // InProgress
            else if (tab === 'past') status = 4; // Completed
            else if (tab === 'upcoming') status = 1; // RegistrationOpen (and others potentially handled by backend)

            const response = await authenticatedFetch(ENDPOINTS.GET_HUB_TOURNAMENTS(id, status, currentPage));

            if (response.ok) {
                const data = await response.json();
                const newTournaments = data.tournaments || [];
                const totalCount = data.count || 0;

                if (currentPage === 0) {
                    setTournaments(newTournaments);
                } else {
                    setTournaments(prev => [...prev, ...newTournaments]);
                }

                setHasMore(newTournaments.length === 10); // Assuming pageSize is 10
            }
        } catch (err) {
            console.error('Error fetching tournaments:', err);
        } finally {
            setIsListLoading(false);
        }
    };

    const loadMoreTournaments = () => {
        if (!isListLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchTournaments(nextPage, activeTab);
        }
    };

    const handleFollowToggle = async () => {
        if (!user?.id) return;

        try {
            if (isFollowing) {
                // Unfollow - send userId and hubId as query parameters
                const response = await authenticatedFetch(ENDPOINTS.UNFOLLOW_HUB(user.id, id), {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setIsFollowing(false);
                }
            } else {
                // Follow
                const response = await authenticatedFetch(ENDPOINTS.FOLLOW_HUB, {
                    method: 'POST',
                    body: JSON.stringify({
                        id: null,
                        userId: user.id,
                        hubId: id,
                    }),
                });

                if (response.ok) {
                    setIsFollowing(true);
                }
            }
        } catch (error) {
            console.error('Error toggling follow status:', error);
        }
    };

    const handleUpdateHub = async (name: string, description: string) => {
        try {
            const response = await authenticatedFetch(ENDPOINTS.UPDATE_HUB, {
                method: 'POST',
                body: JSON.stringify({
                    id: id,
                    name: name,
                    description: description,
                }),
            });

            if (response.ok) {
                // Refresh hub details after update
                await fetchHubDetails();
            }
        } catch (error) {
            console.error('Error updating hub:', error);
            throw error;
        }
    };

    const mapSocialsToLinks = (socials: any[]) => {
        if (!socials || socials.length === 0) return [];
        return socials.map(s => {
            const type = s.socialType !== undefined ? s.socialType : s.type;
            let platform: any = 'discord';

            switch (type) {
                case SocialType.Instagram: platform = 'instagram'; break;
                case SocialType.X: platform = 'twitter'; break;
                case SocialType.Facebook: platform = 'facebook'; break;
                case SocialType.TikTok: platform = 'tiktok'; break;
                case SocialType.YouTube: platform = 'youtube'; break;
                case SocialType.Discord: platform = 'discord'; break;
                case SocialType.Telegram: platform = 'telegram'; break;
            }

            const url = s.url && s.url !== '#' ? s.url : getSocialUrl(platform, s.username);
            return { platform, username: s.username, url };
        });
    };

    const tabs = [
        { label: 'Live', value: 'live' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
    ];

    const renderTournamentList = () => {
        if (tournaments.length === 0 && !isListLoading) {
            return (
                <View className="items-center py-12 opacity-50">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4 font-medium">No tournaments found</Text>
                </View>
            );
        }

        return (
            <View className="gap-3 pb-8">
                {tournaments.map((tournament: any) => (
                    <TournamentCard
                        key={tournament.id}
                        name={tournament.name}
                        status={tournament.status === 3 ? 'live' : (tournament.status === 4 ? 'completed' : 'upcoming')}
                        date={new Date(tournament.startDate).toLocaleDateString()}
                        region={tournament.region === 1 ? 'North America' : 'Europe'}
                        prizePool={`${tournament.prizeCurrency === 1 ? '$' : '€'}${tournament.prize}`}
                        players={new Array(tournament.numberOfParticipants || 0).fill({})}
                        onClick={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
                        hubName={hubData.name}
                        hubAvatarUrl={hubData.avatarUrl || hubData.logoUrl}
                    />
                ))}
                {isListLoading && <ActivityIndicator size="small" color="#8B5CF6" className="py-4" />}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title="Hub Profile" showBack />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !hubData) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title="Hub Profile" showBack />
                <View className="flex-1 items-center justify-center p-6">
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="text-destructive mt-4 text-center">{error || 'Hub not found'}</Text>
                    <Button onPress={fetchHubDetails} className="mt-4">Retry</Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            <PageHeader
                title="Hub Profile"
                showBack
                rightElement={isOwner ? (
                    <Pressable
                        onPress={() => navigation.navigate('ManageHub', { hubId: id })}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10"
                    >
                        <Ionicons name="settings-outline" size={20} color="#FAFAFA" />
                    </Pressable>
                ) : null}
            />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 50) {
                        loadMoreTournaments();
                    }
                }}
                scrollEventThrottle={16}
            >
                {/* ─── Hero Section ─── */}
                <View className="px-6 pt-6 pb-8">
                    {/* Avatar + Name */}
                    <View className="items-center">
                        <View className="rounded-[28px] border-[3px] border-[#10B981]/30 p-1 mb-5">
                            <PlayerAvatar
                                name={hubData.name}
                                src={hubData.avatarUrl || hubData.logoUrl}
                                size="xl"
                                className="w-24 h-24 rounded-[24px]"
                            />
                        </View>

                        <View className="flex-row items-center gap-2 mb-1">
                            <Text className="text-2xl font-black text-white tracking-tight">
                                {hubData.name}
                            </Text>
                            <View className="w-5 h-5 rounded-full bg-[#10B981] items-center justify-center">
                                <Ionicons name="checkmark" size={12} color="#fff" />
                            </View>
                        </View>

                        {hubData.description ? (
                            <Text className="text-[13px] text-slate-400 text-center leading-5 mt-1 px-4 max-w-[300px]">
                                {hubData.description}
                            </Text>
                        ) : null}

                        {/* Social Icons Row */}
                        {hubData.hubSocials && hubData.hubSocials.length > 0 && (
                            <View className="mt-5">
                                <SocialLinks links={mapSocialsToLinks(hubData.hubSocials)} className="justify-center" />
                            </View>
                        )}
                    </View>

                    {/* Follow / Manage Button */}
                    {!isOwner && (
                        <Pressable
                            onPress={handleFollowToggle}
                            className={cn(
                                "mt-6 w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 border",
                                isFollowing
                                    ? "bg-white/5 border-white/10"
                                    : "bg-[#10B981] border-[#10B981]/50"
                            )}
                            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                        >
                            <Ionicons
                                name={isFollowing ? "checkmark-circle" : "add-circle"}
                                size={18}
                                color={isFollowing ? "#94A3B8" : "#fff"}
                            />
                            <Text className={cn(
                                "font-black text-sm tracking-wide",
                                isFollowing ? "text-slate-400" : "text-white"
                            )}>
                                {isFollowing ? "Following" : "Follow Hub"}
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* ─── Stats Row ─── */}
                <View className="flex-row px-4 py-5 gap-3">
                    <View className="flex-1 bg-[#131B2E] rounded-3xl p-5 border border-white/5 items-center">
                        <View className="w-11 h-11 rounded-2xl bg-indigo-500/10 items-center justify-center mb-3 border border-indigo-500/20">
                            <Ionicons name="people" size={22} color="#818CF8" />
                        </View>
                        <Text className="text-2xl font-black text-white mb-0.5">
                            {(hubData.numberOfUsers || 0).toLocaleString()}
                        </Text>
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Followers
                        </Text>
                    </View>
                    <View className="flex-1 bg-[#131B2E] rounded-3xl p-5 border border-white/5 items-center">
                        <View className="w-11 h-11 rounded-2xl bg-amber-500/10 items-center justify-center mb-3 border border-amber-500/20">
                            <Ionicons name="trophy" size={22} color="#FBBF24" />
                        </View>
                        <Text className="text-2xl font-black text-white mb-0.5">
                            {hubData.numberOfTournaments || 0}
                        </Text>
                        <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Tournaments
                        </Text>
                    </View>
                </View>

                {/* ─── Tournament Section ─── */}
                <View className="px-4 pb-6">
                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                    <View className="mt-4">
                        {renderTournamentList()}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
