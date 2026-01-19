import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { SocialLinks } from '../components/profile/SocialLinks';
import { Ionicons } from '@expo/vector-icons';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { UserInfo, SocialType } from '../types/auth';
import { PlayerMatchesDto } from '../types/user';
import { cn } from '../lib/utils';
import { getSocialUrl } from '../lib/social';
import { Button } from '../components/ui/Button';

import { StackNavigationProp } from '@react-navigation/stack';

type PlayerProfileRouteProp = RouteProp<RootStackParamList, 'PlayerProfile'>;

const tabs = [
    { label: 'Stats', value: 'stats' },
    { label: 'Tournaments', value: 'tournaments' },
    { label: 'Matches', value: 'matches' },
];

export default function PlayerProfileScreen() {
    const route = useRoute<PlayerProfileRouteProp>();
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { id } = route.params;

    const [activeTab, setActiveTab] = useState('stats');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [playerMatches, setPlayerMatches] = useState<PlayerMatchesDto | null>(null);
    const [userTournaments, setUserTournaments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlayerData = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const [infoRes, statsRes, tournamentsRes] = await Promise.all([
                    authenticatedFetch(ENDPOINTS.GET_USER_INFO(id)),
                    authenticatedFetch(ENDPOINTS.GET_PLAYER_STATS(id)),
                    authenticatedFetch(ENDPOINTS.GET_PROFILE_TOURNAMENTS(id))
                ]);

                if (infoRes.ok) {
                    const infoData = await infoRes.json();
                    setUserInfo(infoData.result || infoData);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setPlayerMatches(statsData.result || statsData);
                }

                if (tournamentsRes.ok) {
                    const tournamentsData = await tournamentsRes.json();
                    setUserTournaments(tournamentsData.result || tournamentsData);
                }

                if (!infoRes.ok && !statsRes.ok) {
                    throw new Error('Could not load player data');
                }
            } catch (err: any) {
                console.error('Player data fetch error:', err);
                setError(err.message || 'Failed to load player profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayerData();
    }, [id]);

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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <View className="flex-row items-center px-6 py-2">
                    <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text className="text-muted-foreground mt-4">Loading stats...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !userInfo) {
        return (
            <SafeAreaView className="flex-1 bg-background" edges={['top']}>
                <View className="flex-row items-center px-6 py-2">
                    <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                </View>
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="text-destructive mt-4 text-center font-medium">{error || 'Player not found'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const displayData = {
        username: userInfo.username || 'Unknown',
        region: getRegionName(userInfo.region),
        totalMatches: playerMatches?.stats?.totalMatches || 0,
        winPercentage: playerMatches?.stats?.winRate || 0,
        wins: playerMatches?.stats?.wins || 0,
        losses: playerMatches?.stats?.losses || 0,
        draws: 20, // Mocked to match design
        trophies: 48, // Mocked to match design
        socials: userInfo.userSocials || []
    };

    const matches = playerMatches?.lastMatches || [];

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Header: Back Button only */}
            <View className="flex-row items-center px-6 py-2">
                <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View className="items-center mt-4">
                    <View className="relative">
                        <View className="p-1 rounded-full border-2 border-primary">
                            <PlayerAvatar name={displayData.username} size="xl" className="border-0" />
                        </View>
                        <View className="absolute bottom-1 right-1 bg-primary px-2 py-0.5 rounded-full border-2 border-background">
                            <Text className="text-[10px] font-bold text-white">118</Text>
                        </View>
                    </View>
                    <Text className="text-2xl font-bold mt-4 text-white">{displayData.username}</Text>
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
                    <View className="flex-row px-4 py-6 justify-around">
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

                    <View className="px-6 pb-20">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-lg font-bold text-white mb-2">Performance Trend</Text>
                                <Text className="text-gray-500 text-xs mb-4">Last 10 Games Overview</Text>
                                <View className="bg-card-elevated rounded-3xl p-6 border border-white/5">
                                    <View className="flex-row items-end justify-between h-32 mb-4 px-2">
                                        {[40, 45, 42, 55, 60, 65, 80, 75, 85, 90].map((h, i) => (
                                            <View key={i} className="items-center">
                                                <View
                                                    style={{ height: `${h}%` }}
                                                    className="w-1.5 bg-primary/20 rounded-t-full relative"
                                                >
                                                    <View className="absolute top-0 left-0 right-0 h-1.5 w-1.5 bg-primary rounded-full" />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                    <View className="flex-row justify-between border-t border-white/5 pt-4">
                                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(w => (
                                            <Text key={w} className="text-[10px] text-gray-500 font-bold">{w}</Text>
                                        ))}
                                    </View>
                                </View>

                                <Text className="text-lg font-bold text-white mt-8 mb-4">Statistics</Text>
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
                                                <Text className="text-yellow-500 text-2xl font-bold">12</Text>
                                            </View>
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <View className="mb-5">
                                                <Text className="text-gray-400 text-xs mb-1">Wins</Text>
                                                <Text className="text-emerald-500 text-2xl font-bold">{displayData.wins}</Text>
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
                            <View>
                                <Text className="text-lg font-bold text-white mb-4">Tournaments</Text>
                                {userTournaments.length > 0 ? (
                                    userTournaments.map((t) => (
                                        <Pressable
                                            key={t.id}
                                            onPress={() => navigation.navigate('TournamentDetails', { id: t.id })}
                                            className="bg-card-elevated p-6 rounded-3xl mb-4 border border-white/5"
                                        >
                                            <View className="flex-row justify-between items-start mb-4">
                                                <View className="flex-1">
                                                    <Text className="text-white font-bold text-lg">{t.name || t.title}</Text>
                                                    <View className="flex-row items-center mt-2 flex-wrap">
                                                        <View className="flex-row items-center mr-4 mb-1">
                                                            <Ionicons name="calendar-outline" size={14} color="#64748B" />
                                                            <Text className="text-gray-500 text-xs ml-1">
                                                                {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'N/A'}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center mb-1">
                                                            <Ionicons name="people-outline" size={14} color="#64748B" />
                                                            <Text className="text-gray-500 text-xs ml-1">{t.numberOfParticipants || 0} players</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                            <View className="flex-row justify-between items-center mt-2">
                                                <View className={cn("px-4 py-2 rounded-full flex-row items-center bg-primary/20")}>
                                                    <Ionicons name="trophy" size={14} className="text-primary" />
                                                    <Text className={cn("ml-2 font-bold text-sm text-primary")}>Participating</Text>
                                                </View>
                                                <Text className="text-emerald-500 font-bold text-lg">
                                                    {t.prizeCurrency === 1 ? '$' : t.prizeCurrency === 2 ? '€' : ''}{t.prize}
                                                </Text>
                                            </View>
                                        </Pressable>
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
                            <View>
                                <Text className="text-lg font-bold text-white mb-4">Match History</Text>
                                {matches.length > 0 ? (
                                    matches.map((match, idx) => (
                                        <MatchHistoryCard
                                            key={idx}
                                            tournamentName={match.tournamentName}
                                            opponentName={match.opponentName}
                                            result={match.isWin ? 'win' : 'loss'}
                                            date={match.scheduledTime ? new Date(match.scheduledTime).toLocaleDateString() : 'N/A'}
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
