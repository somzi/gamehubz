import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { SocialLinks } from '../components/profile/SocialLinks';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { PlayerMatchesDto } from '../types/user';
import { SocialType } from '../types/auth';
import { cn } from '../lib/utils';
import { getSocialUrl } from '../lib/social';
import { TournamentCard } from '../components/cards/TournamentCard';
import { Tabs } from '../components/ui/Tabs';

const tabs = [
    { label: 'Stats', value: 'stats' },
    { label: 'Tournaments', value: 'tournaments' },
    { label: 'Matches', value: 'matches' },
];

export default function ProfileScreen() {
    const { user, refreshUser } = useAuth();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState('stats');
    const [playerMatches, setPlayerMatches] = useState<PlayerMatchesDto | null>(null);
    const [userTournaments, setUserTournaments] = useState<any[]>([]);
    const [tournamentsPage, setTournamentsPage] = useState(0);
    const [hasMoreTournaments, setHasMoreTournaments] = useState(true);
    const [isLoadingMoreTournaments, setIsLoadingMoreTournaments] = useState(false);

    const [userMatches, setUserMatches] = useState<any[]>([]);
    const [matchesPage, setMatchesPage] = useState(0);
    const [hasMoreMatches, setHasMoreMatches] = useState(true);
    const [isLoadingMoreMatches, setIsLoadingMoreMatches] = useState(false);

    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetailedData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoadingData(true);
        setError(null);
        setTournamentsPage(0);
        setHasMoreTournaments(true);
        setMatchesPage(0);
        setHasMoreMatches(true);
        try {
            const [statsRes, tournamentsRes, matchesRes] = await Promise.all([
                authenticatedFetch(ENDPOINTS.GET_PLAYER_STATS(user.id)),
                authenticatedFetch(ENDPOINTS.GET_PROFILE_TOURNAMENTS(user.id, 0)),
                authenticatedFetch(ENDPOINTS.GET_PROFILE_MATCHES(user.id, 0))
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const s = statsData.result || statsData;
                const normalizedStats: PlayerMatchesDto = {
                    stats: s.stats || s.Stats ? {
                        totalMatches: s.stats?.TotalMatches || s.stats?.totalMatches || s.Stats?.TotalMatches || s.Stats?.totalMatches || 0,
                        wins: s.stats?.Wins || s.stats?.wins || s.Stats?.Wins || s.Stats?.wins || 0,
                        losses: s.stats?.Losses || s.stats?.losses || s.Stats?.Losses || s.Stats?.losses || 0,
                        draws: s.stats?.Draws || s.stats?.draws || s.Stats?.Draws || s.Stats?.draws || 0,
                        tournamentsWon: s.stats?.tournamentsWon || s.Stats?.tournamentsWon || s.stats?.tournamentsWon || 0,
                        winRate: s.stats?.WinRate || s.stats?.winRate || s.Stats?.WinRate || s.Stats?.winRate || 0,
                    } : null,
                    performance: (s.performance || s.Performance || []).map((m: any) => ({
                        isWin: m.IsWin !== undefined ? m.IsWin : m.isWin
                    }))
                };
                setPlayerMatches(normalizedStats);
            }

            if (tournamentsRes.ok) {
                const tournamentsData = await tournamentsRes.json();
                const items = tournamentsData.items || tournamentsData.Items || tournamentsData.result || tournamentsData;
                const itemsArray = Array.isArray(items) ? items : [];
                setUserTournaments(itemsArray);
                setHasMoreTournaments(itemsArray.length === 10); // Assume 10 is page size
            }

            if (matchesRes.ok) {
                const matchesData = await matchesRes.json();
                const items = matchesData.items || matchesData.Items || matchesData.result || matchesData;
                const itemsArray = Array.isArray(items) ? items : [];
                setUserMatches(itemsArray);
                setHasMoreMatches(itemsArray.length === 10);
            }
        } catch (error: any) {
            console.error('Error fetching profile detailed data:', error);
            setError('Failed to refresh stats/tournaments/matches');
        } finally {
            setIsLoadingData(false);
        }
    }, [user?.id]);

    const loadMoreTournaments = async () => {
        if (!user?.id || isLoadingMoreTournaments || !hasMoreTournaments) return;

        setIsLoadingMoreTournaments(true);
        const nextPage = tournamentsPage + 1;

        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_PROFILE_TOURNAMENTS(user.id, nextPage));
            if (response.ok) {
                const data = await response.json();
                const items = data.items || data.Items || data.result || data;
                const itemsArray = Array.isArray(items) ? items : [];

                setUserTournaments(prev => [...prev, ...itemsArray]);
                setTournamentsPage(nextPage);
                setHasMoreTournaments(itemsArray.length === 10);
            } else {
                setHasMoreTournaments(false);
            }
        } catch (error) {
            console.error('Error fetching more tournaments:', error);
            setHasMoreTournaments(false);
        } finally {
            setIsLoadingMoreTournaments(false);
        }
    };

    const loadMoreMatches = async () => {
        if (!user?.id || isLoadingMoreMatches || !hasMoreMatches) return;

        setIsLoadingMoreMatches(true);
        const nextPage = matchesPage + 1;

        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_PROFILE_MATCHES(user.id, nextPage));
            if (response.ok) {
                const data = await response.json();
                const items = data.items || data.Items || data.result || data;
                const itemsArray = Array.isArray(items) ? items : [];

                setUserMatches(prev => [...prev, ...itemsArray]);
                setMatchesPage(nextPage);
                setHasMoreMatches(itemsArray.length === 10);
            } else {
                setHasMoreMatches(false);
            }
        } catch (error) {
            console.error('Error fetching more matches:', error);
            setHasMoreMatches(false);
        } finally {
            setIsLoadingMoreMatches(false);
        }
    };

    useEffect(() => {
        fetchDetailedData();
    }, [fetchDetailedData]);

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                refreshUser();
            }
        }, [user?.id, refreshUser])
    );

    const getRegionName = (region?: number) => {
        switch (region) {
            case 1: return 'North America';
            case 2: return 'Europe';
            case 3: return 'Asia';
            case 4: return 'South America';
            case 5: return 'Africa';
            case 6: return 'Oceania';
            default: return 'Global';
        }
    };

    const displayData = {
        username: user?.username || 'Guest',
        nickName: user?.nickName || 'No Nickname',
        region: getRegionName(user?.region),
        totalMatches: playerMatches?.stats?.totalMatches || 0,
        winPercentage: playerMatches?.stats?.winRate || 0,
        wins: playerMatches?.stats?.wins || 0,
        losses: playerMatches?.stats?.losses || 0,
        draws: playerMatches?.stats?.draws || 0,
        tournamentsWon: playerMatches?.stats?.tournamentsWon || 0,
        socials: user?.userSocials || []
    };

    const performanceList = playerMatches?.performance || [];

    const mapSocialsToLinks = (socials: any[]) => {
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

    const getTournamentStatus = (status: number): 'live' | 'upcoming' | 'completed' => {
        switch (status) {
            case 3: return 'live';
            case 4: return 'completed';
            default: return 'upcoming';
        }
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 50;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            if (activeTab === 'tournaments' && hasMoreTournaments && !isLoadingMoreTournaments) {
                loadMoreTournaments();
            } else if (activeTab === 'matches' && hasMoreMatches && !isLoadingMoreMatches) {
                loadMoreMatches();
            }
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Custom Header Icons */}
            <View className="flex-row justify-end items-center px-6 py-2">
                <Pressable onPress={() => navigation.navigate('EditProfile')} className="p-2">
                    <Ionicons name="settings-outline" size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 150 }}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Profile Header Section */}
                <View className="px-6 mt-2">
                    <View className="bg-card-elevated rounded-[32px] p-5 border border-white/5">
                        <View className="flex-row items-center">
                            <View className="mr-5">
                                <View className="p-[3px] rounded-full border-2 border-[#10B981]">
                                    <PlayerAvatar src={user?.avatarUrl} name={displayData.username} size="lg" className="border-0" />
                                </View>
                            </View>
                            <View className="flex-1 justify-center">
                                <Text className="text-3xl font-black text-white">{displayData.username}</Text>
                                <View className="flex-row items-center mt-1.5">
                                    <Ionicons name="game-controller" size={16} color="#10B981" />
                                    <Text className="text-[#10B981] font-bold text-base ml-1.5">{displayData.nickName}</Text>
                                </View>
                                <View className="flex-row items-center mt-1.5">
                                    <Ionicons name="globe-outline" size={16} color="#94A3B8" />
                                    <Text className="text-gray-400 font-bold text-xs ml-1.5 uppercase tracking-widest">{displayData.region}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="mt-5 border-t border-white/5 pt-4 items-center">
                            <SocialLinks links={mapSocialsToLinks(displayData.socials)} className="justify-center" />
                        </View>
                    </View>
                </View>

                {/* Quick Stats Grid */}
                <View className="flex-row px-6 mt-4 justify-between">
                    <View className="w-[31%] bg-card-elevated rounded-[24px] py-4 items-center border border-white/5">
                        <Ionicons name="game-controller" size={20} color="#8B5CF6" className="mb-2" />
                        <Text className="text-white text-xl font-black">{displayData.totalMatches}</Text>
                        <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-1">Matches</Text>
                    </View>
                    <View className="w-[31%] bg-card-elevated rounded-[24px] py-4 items-center border border-white/5">
                        <Ionicons name="star" size={20} color="#EAB308" className="mb-2" />
                        <Text className="text-white text-xl font-black">{displayData.wins}</Text>
                        <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-1">Wins</Text>
                    </View>
                    <View className="w-[31%] bg-card-elevated rounded-[24px] py-4 items-center border border-white/5">
                        <Ionicons name="trophy" size={20} color="#10B981" className="mb-2" />
                        <Text className="text-white text-xl font-black">{displayData.tournamentsWon || 0}</Text>
                        <Text className="text-gray-500 text-[9px] uppercase font-bold tracking-widest mt-1">Trophies</Text>
                    </View>
                </View>

                {/* Tabs Section */}
                <View className="mt-8 flex-1 min-h-[500px]">
                    <View className="px-6 mb-8 mt-2">
                        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    </View>

                    <View className="px-6 pb-12 pt-4 bg-transparent flex-1">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-[11px] font-black text-white uppercase tracking-widest mb-4">Performance Form</Text>
                                <View className="flex-row gap-1.5 mb-8">
                                    {performanceList.length > 0 ? performanceList.slice(0, 10).map((match, i) => (
                                        <View
                                            key={i}
                                            className={cn(
                                                "flex-1 h-1.5 rounded-full",
                                                match.isWin ? "bg-[#10B981]" : "bg-[#EF4444]"
                                            )}
                                        />
                                    )) : (
                                        <Text className="text-gray-500 text-xs italic">No performance data yet</Text>
                                    )}
                                    {/* Fill empty with disabled gray if needed */}
                                    {performanceList.length > 0 && Array.from({ length: Math.max(0, 10 - performanceList.length) }).map((_, i) => (
                                        <View key={`empty-${i}`} className="flex-1 h-1.5 rounded-full bg-white/10" />
                                    ))}
                                </View>

                                <View className="bg-card-elevated rounded-[32px] p-6 flex-row items-center justify-between border border-white/5">
                                    {/* Left Side Info */}
                                    <View className="flex-1 pr-4">
                                        <View className="flex-row items-center mb-5">
                                            <View className="w-1.5 h-4 bg-[#10B981] rounded-full mr-3" />
                                            <Text className="text-white text-xs font-black uppercase tracking-widest w-16">Wins</Text>
                                            <Text className="text-[#10B981] text-lg font-black ml-auto">{displayData.wins}</Text>
                                        </View>
                                        <View className="flex-row items-center mb-5">
                                            <View className="w-1.5 h-4 bg-[#EAB308] rounded-full mr-3" />
                                            <Text className="text-white text-xs font-black uppercase tracking-widest w-16">Draws</Text>
                                            <Text className="text-[#EAB308] text-lg font-black ml-auto">{displayData.draws}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <View className="w-1.5 h-4 bg-[#EF4444] rounded-full mr-3" />
                                            <Text className="text-white text-xs font-black uppercase tracking-widest w-16">Losses</Text>
                                            <Text className="text-[#EF4444] text-lg font-black ml-auto">{displayData.losses}</Text>
                                        </View>
                                    </View>

                                    {/* Right Side Chart */}
                                    <View className="w-[120px] h-[120px] relative items-center justify-center">
                                        <CircularProgress
                                            percentage={Math.round(displayData.winPercentage)}
                                            size={120}
                                            strokeWidth={14}
                                            color="#10B981"
                                            showText={false}
                                        />
                                        <View className="absolute inset-0 items-center justify-center">
                                            <Text className="text-[#10B981] text-[8px] uppercase font-black tracking-widest mb-[-2px]">Win Rate</Text>
                                            <Text className="text-white text-2xl font-black">{Math.round(displayData.winPercentage)}%</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'tournaments' && (
                            <View className="gap-3">
                                {userTournaments.length > 0 ? (
                                    <>
                                        {userTournaments.map((t) => (
                                            <TournamentCard
                                                key={t.id}
                                                name={t.name || t.title}
                                                status={getTournamentStatus(t.status)}
                                                date={t.startDate ? new Date(t.startDate).toLocaleDateString() : 'N/A'}
                                                region="Global" // Map properly if available
                                                prizePool={`${t.prizeCurrency === 1 ? '$' : t.prizeCurrency === 2 ? '€' : ''}${t.prize}`}
                                                players={new Array(t.numberOfParticipants || 0).fill({})}
                                                onClick={() => navigation.navigate('TournamentDetails', { id: t.id })}
                                                hubName={t.hubName || t.HubName}
                                                hubAvatarUrl={t.hubAvatarUrl || t.HubAvatarUrl}
                                            />
                                        ))}
                                        {hasMoreTournaments && isLoadingMoreTournaments && (
                                            <View className="mt-4 py-4 items-center justify-center">
                                                <ActivityIndicator size="small" color="#10B981" />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View className="items-center py-12">
                                        <Ionicons name="trophy-outline" size={48} color="#1E293B" />
                                        <Text className="text-gray-500 italic mt-4 text-center">No tournaments found.</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {activeTab === 'matches' && (
                            <View className="gap-3">
                                {userMatches.length > 0 ? (
                                    <>
                                        {userMatches.map((match, idx) => (
                                            <MatchHistoryCard
                                                key={idx}
                                                tournamentName={match.tournamentName || match.TournamentName || 'Match'}
                                                hubName={match.hubName || match.HubName || match.hub || match.Hub}
                                                userName={match.username || match.userName || match.Username || match.UserName || displayData.username}
                                                userAvatarUrl={match.userAvatarUrl || match.userAvatar || match.UserAvatarUrl || match.UserAvatar || user?.avatarUrl}
                                                opponentName={match.opponentName || match.OpponentName || 'Opponent'}
                                                opponentAvatarUrl={match.opponentAvatarUrl || match.opponentAvatar || match.OpponentAvatarUrl || match.OpponentAvatar}
                                                result={match.isWin === true || match.IsWin === true ? 'win' : match.isWin === false || match.IsWin === false ? 'loss' : 'draw'}
                                                userScore={match.userScore ?? match.UserScore ?? undefined}
                                                opponentScore={match.opponentScore ?? match.OpponentScore ?? undefined}
                                                date={match.scheduledTime || match.ScheduledTime ? new Date(match.scheduledTime || match.ScheduledTime).toLocaleDateString() : 'N/A'}
                                            />
                                        ))}
                                        {hasMoreMatches && isLoadingMoreMatches && (
                                            <View className="mt-4 py-4 items-center justify-center">
                                                <ActivityIndicator size="small" color="#10B981" />
                                            </View>
                                        )}
                                    </>
                                ) : (
                                    <View className="items-center py-12">
                                        <Ionicons name="documents-outline" size={48} color="#1E293B" />
                                        <Text className="text-gray-500 italic mt-4 text-center">No match history available yet.</Text>
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
