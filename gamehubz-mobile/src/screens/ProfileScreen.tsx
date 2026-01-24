import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDetailedData = useCallback(async () => {
        if (!user?.id) return;
        setIsLoadingData(true);
        setError(null);
        try {
            const [statsRes, tournamentsRes] = await Promise.all([
                authenticatedFetch(ENDPOINTS.GET_PLAYER_STATS(user.id)),
                authenticatedFetch(ENDPOINTS.GET_PROFILE_TOURNAMENTS(user.id))
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                const s = statsData.result || statsData;
                const normalizedStats: PlayerMatchesDto = {
                    stats: {
                        totalMatches: s.stats?.TotalMatches || s.stats?.totalMatches || 0,
                        wins: s.stats?.Wins || s.stats?.wins || 0,
                        losses: s.stats?.Losses || s.stats?.losses || 0,
                        draws: s.stats?.Draws || s.stats?.draws || 0,
                        tournamentsWon: s.stats?.tournamentsWon || s.stats?.tournamentsWon || 0,
                        winRate: s.stats?.WinRate || s.stats?.winRate || 0,
                    },
                    lastMatches: (s.lastMatches || []).map((m: any) => ({
                        tournamentName: m.TournamentName || m.tournamentName,
                        opponentName: m.OpponentName || m.opponentName,
                        isWin: m.IsWin !== undefined ? m.IsWin : m.isWin,
                        userScore: m.UserScore !== undefined ? m.UserScore : m.userScore,
                        opponentScore: m.OpponentScore !== undefined ? m.OpponentScore : m.opponentScore,
                        scheduledTime: m.ScheduledTime || m.scheduledTime
                    }))
                };
                setPlayerMatches(normalizedStats);
            }

            if (tournamentsRes.ok) {
                const tournamentsData = await tournamentsRes.json();
                const items = tournamentsData.result || tournamentsData;
                setUserTournaments(Array.isArray(items) ? items : []);
            }
        } catch (error: any) {
            console.error('Error fetching profile detailed data:', error);
            setError('Failed to refresh stats/tournaments');
        } finally {
            setIsLoadingData(false);
        }
    }, [user?.id]);

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

    const matches = playerMatches?.lastMatches || [];

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
            >
                {/* Profile Header Section */}
                <View className="items-center mt-4">
                    <View className="relative">
                        <View className="p-1 rounded-full border-2 border-primary">
                            <PlayerAvatar src={undefined} name={displayData.username} size="xl" className="border-0" />
                        </View>
                    </View>
                    <Text className="text-2xl font-bold mt-4 text-white">{displayData.username}</Text>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="game-controller-outline" size={14} color="#10B981" />
                        <Text className="text-primary font-bold text-sm ml-1">{displayData.nickName}</Text>
                    </View>
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="globe-outline" size={14} color="#94A3B8" />
                        <Text className="text-gray-400 text-sm ml-1">{displayData.region}</Text>
                    </View>

                    {/* Socials in Header */}
                    <View className="mt-4">
                        <SocialLinks links={mapSocialsToLinks(displayData.socials)} className="justify-center" />
                    </View>
                </View>

                {/* Tabs Section */}
                <View className="mt-8 bg-card rounded-t-[40px] flex-1 min-h-[500px] border-t border-white/5">
                    <View className="flex-row px-4 py-4 justify-around">
                        {tabs.map((tab) => (
                            <Pressable
                                key={tab.value}
                                onPress={() => setActiveTab(tab.value)}
                                className={cn(
                                    "flex-row items-center px-4 py-2 rounded-xl",
                                    activeTab === tab.value ? "bg-card-elevated border border-white/10" : "border border-transparent"
                                )}
                            >
                                <Ionicons
                                    name={tab.value === 'stats' ? 'stats-chart' : tab.value === 'tournaments' ? 'trophy' : 'time'}
                                    size={16}
                                    color={activeTab === tab.value ? "#10B981" : "#64748B"}
                                />
                                <Text className={cn(
                                    "ml-2 font-semibold text-sm",
                                    activeTab === tab.value ? "text-white" : "text-gray-500"
                                )}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <View className="px-6 pb-12">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-lg font-bold text-white mb-2">Performance Trend</Text>
                                <Text className="text-gray-500 text-xs mb-4">Last {Math.min(matches.length, 10)} Games Overview</Text>
                                <View className="bg-card-elevated rounded-3xl p-6 border border-white/5">
                                    {matches.length > 0 ? (
                                        <>
                                            <View className="flex-row items-center justify-between mb-4 px-2">
                                                {matches.slice(0, 10).map((match, i) => (
                                                    <View key={i} className="items-center">
                                                        <View
                                                            className={cn(
                                                                "w-8 h-8 rounded-full items-center justify-center",
                                                                match.isWin ? "bg-accent/20" : "bg-destructive/20"
                                                            )}
                                                        >
                                                            <Text className={cn(
                                                                "font-bold text-sm",
                                                                match.isWin ? "text-accent" : "text-destructive"
                                                            )}>
                                                                {match.isWin ? 'W' : 'L'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                            <View className="flex-row justify-between border-t border-white/5 pt-4 px-2">
                                                {matches.slice(0, 10).map((_, i) => (
                                                    <View key={i} className="w-8 items-center">
                                                        <Text key={i} className="text-[10px] text-gray-500 font-bold">{i + 1}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    ) : (
                                        <Text className="text-gray-500 text-center py-8">No match history available</Text>
                                    )}
                                </View>

                                <Text className="text-lg font-bold text-white mt-6 mb-4">Statistics</Text>
                                <View className="bg-card-elevated rounded-3xl p-6 flex-row items-center border border-white/5">
                                    <View className="mr-8">
                                        <CircularProgress percentage={Math.round(displayData.winPercentage)} size={90} strokeWidth={10} color="#10B981" />
                                    </View>
                                    <View className="flex-1 flex-row">
                                        <View className="flex-1">
                                            <View className="mb-5">
                                                <Text className="text-gray-400 text-xs mb-1">Total Matches</Text>
                                                <Text className="text-white text-2xl font-bold">{displayData.totalMatches}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-gray-400 text-xs mb-1">Tournaments Won</Text>
                                                <Text className="text-yellow-500 text-2xl font-bold">{displayData.tournamentsWon}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <View className="mb-5">
                                                <Text className="text-gray-400 text-xs mb-1">Wins</Text>
                                                <Text className="text-emerald-500 text-2xl font-bold">{displayData.wins}</Text>
                                            </View>
                                            <View className="mb-5">
                                                <Text className="text-gray-400 text-xs mb-1">Draws</Text>
                                                <Text className="text-blue-400 text-2xl font-bold">{displayData.draws}</Text>
                                            </View>
                                            <View>
                                                <Text className="text-gray-400 text-xs mb-1">Losses</Text>
                                                <Text className="text-rose-500 text-2xl font-bold">{displayData.losses}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'tournaments' && (
                            <View className="gap-3">
                                <Text className="text-lg font-bold text-white">Tournaments</Text>
                                {userTournaments.length > 0 ? (
                                    userTournaments.map((t) => (
                                        <TournamentCard
                                            key={t.id}
                                            name={t.name || t.title}
                                            status={getTournamentStatus(t.status)}
                                            date={t.startDate ? new Date(t.startDate).toLocaleDateString() : 'N/A'}
                                            region="Global" // Map properly if available
                                            prizePool={`${t.prizeCurrency === 1 ? '$' : t.prizeCurrency === 2 ? '€' : ''}${t.prize}`}
                                            players={new Array(t.numberOfParticipants || 0).fill({})}
                                            onClick={() => navigation.navigate('TournamentDetails', { id: t.id })}
                                        />
                                    ))
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
                                <Text className="text-lg font-bold text-white">Match History</Text>
                                {matches.length > 0 ? (
                                    matches.map((match, idx) => (
                                        <MatchHistoryCard
                                            key={idx}
                                            tournamentName={match.tournamentName}
                                            opponentName={match.opponentName}
                                            result={match.isWin ? 'win' : 'loss'}
                                            userScore={match.userScore ?? undefined}
                                            opponentScore={match.opponentScore ?? undefined}
                                            date={match.scheduledTime ? new Date(match.scheduledTime).toLocaleDateString() : (match.isWin ? 'W' : 'L')}
                                        />
                                    ))
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
