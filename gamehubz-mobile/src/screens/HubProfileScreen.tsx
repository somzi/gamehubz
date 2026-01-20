import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { StatCard } from '../components/ui/StatCard';
import { TournamentCard } from '../components/cards/TournamentCard';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from '../components/ui/Tabs';
import { cn } from '../lib/utils';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { EditHubModal } from '../components/modals/EditHubModal';

type HubProfileRouteProp = RouteProp<RootStackParamList, 'HubProfile'>;

export default function HubProfileScreen() {
    const route = useRoute<HubProfileRouteProp>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
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
            <View className="space-y-3 pb-8">
                {tournaments.map((tournament: any) => (
                    <TournamentCard
                        key={tournament.id}
                        name={tournament.name}
                        status={tournament.status === 3 ? 'completed' : (tournament.status === 2 ? 'live' : 'upcoming')}
                        date={new Date(tournament.startDate).toLocaleDateString()}
                        region={tournament.region === 1 ? 'North America' : 'Europe'}
                        prizePool={`${tournament.prizeCurrency === 1 ? '$' : '€'}${tournament.prize}`}
                        players={new Array(tournament.numberOfParticipants || 0).fill({})}
                        onClick={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
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
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Hub Profile" showBack />
            <ScrollView className="flex-1">
                <View className="animate-slide-up">
                    {/* Profile Header */}
                    <View className="px-4 py-8 bg-card border-b border-border/30">
                        <View className="flex-row items-center gap-4 mb-6">
                            <PlayerAvatar name={hubData.name} size="lg" className="w-20 h-20" />
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-foreground">{hubData.name}</Text>
                                <Text className="text-sm text-muted-foreground mt-1 leading-5">
                                    {hubData.description || 'No description provided.'}
                                </Text>
                            </View>
                        </View>

                        {isOwner ? (
                            <Button
                                onPress={() => setShowEditModal(true)}
                                variant="default"
                                className="w-full"
                            >
                                <Text className="font-bold text-white">Edit Hub</Text>
                            </Button>
                        ) : (
                            <Button
                                onPress={handleFollowToggle}
                                variant={isFollowing ? "secondary" : "default"}
                                className="w-full"
                            >
                                <Text className={cn("font-bold", !isFollowing ? "text-white" : "text-foreground")}>
                                    {isFollowing ? "Following" : "Follow Hub"}
                                </Text>
                            </Button>
                        )}
                    </View>

                    <View className="px-4 py-6 space-y-6">
                        {/* Stats */}
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <StatCard icon="people" value={(hubData.numberOfUsers || 0).toLocaleString()} label="Followers" />
                            </View>
                            <View className="flex-1">
                                <StatCard icon="trophy" value={hubData.numberOfTournaments || 0} label="Tournaments" variant="gold" />
                            </View>
                        </View>

                        {/* Tournament Tabs */}
                        <View className="space-y-4">
                            <Tabs
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                            />
                            {renderTournamentList()}
                        </View>
                    </View>
                </View>
            </ScrollView>

            <EditHubModal
                visible={showEditModal}
                hubId={id}
                initialName={hubData?.name || ''}
                initialDescription={hubData?.description || ''}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdateHub}
            />
        </SafeAreaView>
    );
}
