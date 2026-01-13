import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
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

// Mock data matching the web app
const playerData = {
    username: 'ProPlayer99',
    discordNickname: 'ProPlayer99#1234',
    inGameNickname: 'xProPlayer',
    totalMatches: 48,
    winPercentage: 67,
    wins: 32,
    losses: 16,
    level: 3,
    fairPlayScore: 95,
    noShowCount: 1,
    reportsCount: 0,
    socials: [
        { platform: 'discord' as const, username: 'ProPlayer99#1234', url: '#' },
        { platform: 'tiktok' as const, username: '@proplayer99', url: 'https://tiktok.com/@proplayer99' },
        { platform: 'instagram' as const, username: '@proplayer99', url: 'https://instagram.com/proplayer99' },
    ],
};

const matchHistory = [
    {
        id: '1',
        tournamentName: 'Winter Championship',
        opponentName: 'GamerX',
        result: 'win' as const,
        date: 'Jan 15, 2024',
    },
    {
        id: '2',
        tournamentName: 'Weekly Cup #42',
        opponentName: 'ChampionKing',
        result: 'win' as const,
        date: 'Jan 12, 2024',
    },
    {
        id: '3',
        tournamentName: 'Pro Series',
        opponentName: 'NightHawk',
        result: 'loss' as const,
        date: 'Jan 10, 2024',
    },
    {
        id: '4',
        tournamentName: 'Community Battle',
        opponentName: 'ShadowStrike',
        result: 'win' as const,
        date: 'Jan 8, 2024',
    },
];

const tabs = [
    { label: 'Stats', value: 'stats' },
    { label: 'History', value: 'history' },
    { label: 'Fair Play', value: 'fair-play' },
];

import { EditProfileModal } from '../components/profile/EditProfileModal';

export default function ProfileScreen() {
    const [activeTab, setActiveTab] = useState('stats');
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [profileData, setProfileData] = useState(playerData);

    const handleSaveProfile = (data: { discord: string; tiktok: string; instagram: string }) => {
        setProfileData(prev => ({
            ...prev,
            socials: prev.socials.map(s => {
                if (s.platform === 'discord') return { ...s, username: data.discord };
                if (s.platform === 'tiktok') return { ...s, username: data.tiktok };
                if (s.platform === 'instagram') return { ...s, username: data.instagram };
                return s;
            })
        }));
    };

    const getSocialValue = (platform: string) =>
        profileData.socials.find(s => s.platform === platform)?.username || '';



    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Profile"
                showNotifications={true}
                rightElement={
                    <Button
                        onPress={() => setIsEditModalVisible(true)}
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
                    <PlayerAvatar src={undefined} name={profileData.username} size="xl" />
                    <Text className="text-xl font-bold mt-4 text-foreground">{profileData.username}</Text>

                    <View className="mt-2 px-3 py-1 rounded-full bg-primary/20">
                        <Text className="text-primary text-xs font-semibold">Level {profileData.level}</Text>
                    </View>

                    <View className="flex-row items-center gap-2 mt-3">
                        <Ionicons name="game-controller" size={16} color="hsl(220, 15%, 55%)" />
                        <Text className="text-sm text-muted-foreground">{profileData.inGameNickname}</Text>
                    </View>

                    {/* Social icons in header */}
                    <View className="mt-4 w-full">
                        <SocialLinks links={profileData.socials} className="justify-center" />
                    </View>
                </View>

                <EditProfileModal
                    visible={isEditModalVisible}
                    onClose={() => setIsEditModalVisible(false)}
                    onSave={handleSaveProfile}
                    initialData={{
                        discord: getSocialValue('discord'),
                        tiktok: getSocialValue('tiktok'),
                        instagram: getSocialValue('instagram'),
                    }}
                />


                {/* Tabs */}
                <View className="px-4 py-4">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

                    <View className="mt-4">
                        {activeTab === 'stats' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Statistics</Text>
                                <View className="flex-row flex-wrap gap-3">
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="game-controller-outline" value={profileData.totalMatches} label="Matches" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trending-up" value={`${profileData.winPercentage}%`} label="Win Rate" variant="accent" />
                                    </View>
                                    <View className="flex-1 min-w-[45%]">
                                        <StatCard icon="trophy" value={profileData.wins} label="Wins" variant="gold" />
                                    </View>
                                    <View className="flex-1 min-w-[45%] bg-card p-4 rounded-xl border border-border/30">
                                        <View className="w-8 h-8 rounded-lg items-center justify-center bg-destructive/10 mb-2">
                                            <Ionicons name="close-circle" size={18} color="hsl(0, 72%, 51%)" />
                                        </View>
                                        <Text className="text-2xl font-bold text-destructive">{profileData.losses}</Text>
                                        <Text className="text-xs text-muted-foreground">Losses</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {activeTab === 'history' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Match History</Text>
                                <View>
                                    {matchHistory.map((match) => (
                                        <MatchHistoryCard
                                            key={match.id}
                                            tournamentName={match.tournamentName}
                                            opponentName={match.opponentName}
                                            result={match.result}
                                            date={match.date}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {activeTab === 'fair-play' && (
                            <View>
                                <Text className="text-lg font-bold mb-4 text-foreground">Fair Play</Text>
                                <FairPlayStats
                                    fairPlayScore={profileData.fairPlayScore}
                                    noShowCount={profileData.noShowCount}
                                    reportsCount={profileData.reportsCount}
                                    matchesPlayed={profileData.totalMatches}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView >
    );
}
