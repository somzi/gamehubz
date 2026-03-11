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
                {/* Profile Header Card */}
                <View className="mx-5 mt-4 p-5 bg-card-elevated rounded-3xl border border-white/5">
                    <View className="flex-row items-center">
                        <View className="p-[3px] rounded-full border-2 border-primary mr-4 bg-background/50">
                            <PlayerAvatar src={user?.avatarUrl} name={displayData.username} size="lg" className="border-0" />
                        </View>
                        <View className="flex-1 justify-center items-start">
                            <Text className="text-2xl font-black text-white tracking-tight leading-none mb-1 text-left">{displayData.username}</Text>
                            {displayData.nickName ? (
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="game-controller" size={14} color="#10B981" />
                                    <Text className="text-primary font-bold text-[13px] ml-1">{displayData.nickName}</Text>
                                </View>
                            ) : null}
                            <View className="flex-row items-center mt-1.5">
                                <Ionicons name="globe-outline" size={12} color="#94A3B8" />
                                <Text className="text-slate-400 text-[10px] uppercase font-black tracking-widest ml-1">{displayData.region}</Text>
                            </View>
                        </View>
                    </View>
                    {displayData.socials.length > 0 && (
                        <View className="mt-5 border-t border-white/5 pt-4">
                            <SocialLinks links={mapSocialsToLinks(displayData.socials)} className="justify-center gap-3" />
                        </View>
                    )}
                </View>

                {/* Quick Stats Row */}
                <View className="flex-row justify-between px-5 mt-5 gap-3">
                    <View className="flex-1 bg-card-elevated rounded-[20px] py-4 items-center border border-white/5 justify-center shadow-sm">
                        <Ionicons name="game-controller" size={18} color="#818CF8" />
                        <Text className="text-white text-lg font-black mt-2 leading-none">{displayData.totalMatches}</Text>
                        <Text className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">Matches</Text>
                    </View>
                    <View className="flex-1 bg-card-elevated rounded-[20px] py-4 items-center border border-white/5 justify-center shadow-sm">
                        <Ionicons name="star" size={18} color="#EAB308" />
                        <Text className="text-white text-lg font-black mt-2 leading-none">{displayData.wins}</Text>
                        <Text className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">Wins</Text>
                    </View>
                    <View className="flex-1 bg-card-elevated rounded-[20px] py-4 items-center border border-white/5 justify-center shadow-sm">
                        <Ionicons name="trophy" size={18} color="#10B981" />
                        <Text className="text-white text-lg font-black mt-2 leading-none">{displayData.tournamentsWon}</Text>
                        <Text className="text-slate-500 text-[9px] uppercase font-black tracking-widest mt-1">Trophies</Text>
                    </View>
                </View>

                {/* Tabs Section */}
                <View className="mt-8 bg-card rounded-t-[40px] flex-1 min-h-[500px] border-t border-white/5 pt-6">
                    <View className="flex-row px-8 pb-4 justify-between border-b border-white/[0.03] mb-6">
                        {tabs.map((tab) => (
                            <Pressable
                                key={tab.value}
                                onPress={() => setActiveTab(tab.value)}
                                className={cn(
                                    "items-center px-4 py-2.5 rounded-full border",
                                    activeTab === tab.value 
                                        ? "bg-primary/20 border-primary/50 shadow-sm shadow-primary/20" 
                                        : "bg-transparent border-transparent"
                                )}
                            >
                                <Text className={cn(
                                    "font-black text-[10px] tracking-widest uppercase",
                                    activeTab === tab.value ? "text-primary" : "text-slate-500"
                                )}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <View className="px-6 pb-12">
                        {activeTab === 'stats' && (
                            <View>
                                {/* Performance Form (Trend) */}
                                <Text className="text-[10px] font-black tracking-widest uppercase text-white mb-4 mt-2">Performance Form</Text>
                                <View className="flex-row items-center gap-1.5 mb-8">
                                    {performanceList.length > 0 ? (
                                        performanceList.slice(0, 10).reverse().map((match, i) => (
                                            <View
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full",
                                                    match.isWin ? "bg-primary shadow-sm shadow-primary/30" : "bg-red-500 shadow-sm shadow-red-500/30"
                                                )}
                                            />
                                        ))
                                    ) : (
                                        <View className="h-1.5 flex-1 rounded-full bg-white/5" />
                                    )}
                                </View>

                                {/* Win consistency & Circle */}
                                <View className="bg-card-elevated rounded-[28px] p-6 border border-white/5 flex-row items-center justify-between">
                                    {/* Left Side: W/D/L */}
                                    <View className="flex-1 pr-6 gap-5">
                                        <View className="flex-row items-center">
                                            <View className="w-1.5 h-6 rounded-full bg-emerald-500 mr-3 shadow-sm shadow-emerald-500/50" />
                                            <Text className="text-white text-[11px] uppercase font-black tracking-widest flex-1">Wins</Text>
                                            <Text className="text-emerald-500 text-xl font-black">{displayData.wins}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <View className="w-1.5 h-6 rounded-full bg-amber-400 mr-3 shadow-sm shadow-amber-400/50" />
                                            <Text className="text-white text-[11px] uppercase font-black tracking-widest flex-1">Draws</Text>
                                            <Text className="text-amber-400 text-xl font-black">{displayData.draws}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <View className="w-1.5 h-6 rounded-full bg-rose-500 mr-3 shadow-sm shadow-rose-500/50" />
                                            <Text className="text-white text-[11px] uppercase font-black tracking-widest flex-1">Losses</Text>
                                            <Text className="text-rose-500 text-xl font-black">{displayData.losses}</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Right Side: Circle with Win Rate */}
                                    <View className="relative items-center justify-center">
                                        <CircularProgress
                                            data={[
                                                { value: displayData.wins, color: '#10B981' },
                                                { value: displayData.draws, color: '#FBBF24' },
                                                { value: displayData.losses, color: '#F43F5E' }
                                            ]}
                                            percentage={Math.round(displayData.winPercentage)}
                                            size={120}
                                            strokeWidth={14}
                                            backgroundColor="rgba(255, 255, 255, 0.05)"
                                            showText={false}
                                        />
                                        <View className="absolute inset-0 items-center justify-center">
                                            <Text className="text-emerald-500/80 text-[9px] uppercase font-black tracking-widest mb-0.5">Win Rate</Text>
                                            <Text className="text-white text-3xl font-black tracking-tighter">{Math.round(displayData.winPercentage)}%</Text>
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
