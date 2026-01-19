import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { CircularProgress } from '../components/ui/CircularProgress';
import { SocialLinks } from '../components/profile/SocialLinks';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { PlayerMatchesDto } from '../types/user';
import { SocialType } from '../types/auth';
import { cn } from '../lib/utils';
import { getSocialUrl } from '../lib/social';

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
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;
            setIsLoadingData(true);
            try {
                const [statsRes] = await Promise.all([
                    authenticatedFetch(ENDPOINTS.GET_PLAYER_STATS(user.id)),
                    refreshUser()
                ]);

                if (statsRes.ok) {
                    const statsData: PlayerMatchesDto = await statsRes.json();
                    setPlayerMatches(statsData);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [user?.id]);

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
        region: getRegionName(user?.region),
        totalMatches: playerMatches?.stats?.totalMatches || 0,
        winPercentage: playerMatches?.stats?.winRate || 0,
        wins: playerMatches?.stats?.wins || 0,
        losses: playerMatches?.stats?.losses || 0,
        draws: 20, // Mocked as per design
        trophies: 48, // Mocked as per design
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

    const mockTournamentResults = [
        { id: '1', title: 'Winter Championship 2026', date: 'Jan 15, 2026', players: 128, rank: '1st Place', prize: '$500', rankColor: 'bg-yellow-500/20', textColor: 'text-yellow-500' },
        { id: '2', title: 'New Year Cup', date: 'Jan 5, 2026', players: 64, rank: '3rd Place', prize: '$100', rankColor: 'bg-orange-500/20', textColor: 'text-orange-500' },
        { id: '3', title: 'Holiday Tournament', date: 'Dec 25, 2025', players: 32, rank: '5th Place', prize: '$50', rankColor: 'bg-blue-500/20', textColor: 'text-blue-500' },
    ];



    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            {/* Custom Header Icons */}
            <View className="flex-row justify-end items-center px-6 py-2">
                <Pressable onPress={() => navigation.navigate('EditProfile')} className="p-2">
                    <Ionicons name="settings-outline" size={24} color="white" />
                </Pressable>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View className="items-center mt-4">
                    <View className="relative">
                        <View className="p-1 rounded-full border-2 border-primary">
                            <PlayerAvatar src={undefined} name={displayData.username} size="xl" className="border-0" />
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
                                {mockTournamentResults.map((t) => (
                                    <View key={t.id} className="bg-card-elevated p-6 rounded-3xl mb-4 border border-white/5">
                                        <View className="flex-row justify-between items-start mb-4">
                                            <View className="flex-1">
                                                <Text className="text-white font-bold text-lg">{t.title}</Text>
                                                <View className="flex-row items-center mt-2 flex-wrap">
                                                    <View className="flex-row items-center mr-4 mb-1">
                                                        <Ionicons name="calendar-outline" size={14} color="#64748B" />
                                                        <Text className="text-gray-500 text-xs ml-1">{t.date}</Text>
                                                    </View>
                                                    <View className="flex-row items-center mb-1">
                                                        <Ionicons name="people-outline" size={14} color="#64748B" />
                                                        <Text className="text-gray-500 text-xs ml-1">{t.players} players</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                        <View className="flex-row justify-between items-center mt-2">
                                            <View className={cn("px-4 py-2 rounded-full flex-row items-center", t.rankColor)}>
                                                <Ionicons name="trophy" size={14} className={t.textColor} />
                                                <Text className={cn("ml-2 font-bold text-sm", t.textColor)}>{t.rank}</Text>
                                            </View>
                                            <Text className="text-emerald-500 font-bold text-xl">{t.prize}</Text>
                                        </View>
                                    </View>
                                ))}
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
