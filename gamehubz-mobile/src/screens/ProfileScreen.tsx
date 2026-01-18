import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { StatCard } from '../components/ui/StatCard';
import { MatchHistoryCard } from '../components/cards/MatchHistoryCard';
import { SocialLinks } from '../components/profile/SocialLinks';
import { FairPlayStats } from '../components/profile/FairPlayStats';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
    { label: 'Stats', value: 'stats' },
    { label: 'History', value: 'history' },
    { label: 'Fair Play', value: 'fair-play' },
];

// import { EditProfileModal } from '../components/profile/EditProfileModal';

import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { SocialType, UserInfo, RegionType } from '../types/auth';
import { PlayerMatchesDto } from '../types/user';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
// Duplicate import removed

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
                // Fetch stats and refresh user context
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

    const getRegionLabel = (region?: RegionType) => {
        if (!region) return '';
        return RegionType[region] || 'Global';
    };

    // Use authentic user data or fallback 
    const displayData = {
        username: user?.username || 'Guest',
        region: user?.region,
        totalMatches: playerMatches?.stats?.totalMatches || 0,
        winPercentage: playerMatches?.stats?.winRate || 0,
        wins: playerMatches?.stats?.wins || 0,
        losses: playerMatches?.stats?.losses || 0,
        socials: user?.userSocials || []
    };

    const matches = playerMatches?.lastMatches || [];

    const mapSocialsToLinks = (socials: any[]) => {
        return socials.map(s => {
            const type = s.socialType || s.type; // Check normalized socialType first
            let platform: any = 'discord';
            let url = '#';

            switch (type) {
                case SocialType.Instagram:
                    platform = 'instagram';
                    url = `https://instagram.com/${s.username}`;
                    break;
                case SocialType.X:
                    platform = 'twitter';
                    url = `https://x.com/${s.username}`;
                    break;
                case SocialType.Facebook:
                    platform = 'facebook';
                    url = `https://facebook.com/${s.username}`;
                    break;
                case SocialType.TikTok:
                    platform = 'tiktok';
                    url = `https://tiktok.com/@${s.username}`;
                    break;
                case SocialType.YouTube:
                    platform = 'youtube';
                    url = `https://youtube.com/@${s.username}`;
                    break;
                case SocialType.Discord:
                    platform = 'discord';
                    url = `https://discord.com/users/${s.username}`; // Discord handles differently but this is a common placeholder
                    break;
            }
            return { platform, username: s.username, url };
        });
    };

    const mapMatchToCard = (match: any) => ({
        tournamentName: match.tournamentName,
        opponentName: match.opponentName,
        result: match.isWin ? 'win' as const : 'loss' as const,
        date: match.scheduledTime ? new Date(match.scheduledTime).toLocaleDateString() : 'N/A'
    });

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Profile"
                showNotifications={true}
                rightElement={
                    <Button
                        onPress={() => navigation.navigate('EditProfile')}
                        variant="ghost"
                        size="sm"
                    >
                        <Text className="text-primary font-medium">Edit</Text>
                    </Button>
                }
            />
            <ScrollView className="flex-1">
                {/* Profile Header */}
                <View className="px-4 py-6 bg-card border-b border-border/30 items-center">
                    <PlayerAvatar src={undefined} name={displayData.username} size="xl" />
                    <Text className="text-xl font-bold mt-4 text-foreground">{displayData.username}</Text>

                    {displayData.region && (
                        <View className="mt-2 px-3 py-1 rounded-full bg-primary/20">
                            <Text className="text-primary text-xs font-semibold uppercase">{getRegionLabel(displayData.region)}</Text>
                        </View>
                    )}

                    <View className="flex-row items-center gap-2 mt-3">
                        <Ionicons name="game-controller" size={16} color="hsl(220, 15%, 55%)" />
                        <Text className="text-sm text-muted-foreground">{displayData.username}</Text>
                    </View>

                    {/* Social icons in header */}
                    <View className="mt-4 w-full">
                        <SocialLinks links={mapSocialsToLinks(displayData.socials)} className="justify-center" />
                    </View>
                </View>


                {/* Tabs */}
                <View className="px-4 py-4">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <View className="mt-4">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Statistics</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="game-controller-outline" value={displayData.totalMatches} label="Matches" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trending-up" value={`${displayData.winPercentage}%`} label="Win Rate" variant="accent" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trophy" value={displayData.wins} label="Wins" variant="gold" />
                                    </View>
                                    <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border/30">
                                        <View className="w-8 h-8 rounded-lg items-center justify-center bg-destructive/10 mb-2">
                                            <Ionicons name="close-circle" size={18} color="hsl(0, 72%, 51%)" />
                                        </View>
                                        <Text className="text-2xl font-bold text-destructive">{displayData.losses}</Text>
                                        <Text className="text-xs text-muted-foreground">Losses</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'history' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Match History</Text>
                                <View>
                                    {matches.length > 0 ? (
                                        matches.map((match, idx) => {
                                            const cardData = mapMatchToCard(match);
                                            return (
                                                <MatchHistoryCard
                                                    key={idx}
                                                    tournamentName={cardData.tournamentName}
                                                    opponentName={cardData.opponentName}
                                                    result={cardData.result}
                                                    date={cardData.date}
                                                />
                                            );
                                        })
                                    ) : (
                                        <Text className="text-muted-foreground italic text-center py-8">No matches found</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {activeTab === 'fair-play' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Fair Play</Text>
                                <FairPlayStats
                                    fairPlayScore={100}
                                    noShowCount={0}
                                    reportsCount={0}
                                    matchesPlayed={displayData.totalMatches}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
