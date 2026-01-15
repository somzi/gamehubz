import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
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

type HubProfileRouteProp = RouteProp<RootStackParamList, 'HubProfile'>;

const hubData = {
    id: "1",
    name: "Esports Hub",
    description: "Premier competitive gaming community hosting weekly tournaments and championships for players of all skill levels.",
    followers: 1250,
    tournaments: 45,
    ongoingTournaments: 2,
};

const tournamentsData: Record<string, any[]> = {
    ongoing: [
        {
            id: "1",
            name: "Winter Championship 2024",
            status: "live" as const,
            date: "Jan 15, 2024",
            region: "Europe",
            prizePool: "$1,000",
            players: new Array(64).fill({}),
        },
    ],
    upcoming: [
        {
            id: "upcoming-1",
            name: "Spring Open Qualifiers",
            status: "upcoming" as const,
            date: "Feb 5, 2024",
            region: "Europe",
            prizePool: "$2,500",
            players: new Array(12).fill({}),
        },
    ],
    past: [
        {
            id: "2",
            name: "Fall Series Finals",
            status: "completed" as const,
            date: "Dec 10, 2023",
            region: "Europe",
            prizePool: "$5,000",
            players: new Array(128).fill({}),
        },
        {
            id: "3",
            name: "Summer Cup",
            status: "completed" as const,
            date: "Aug 20, 2023",
            region: "Europe",
            prizePool: "$1,500",
            players: new Array(32).fill({}),
        },
    ],
};

export default function HubProfileScreen() {
    const route = useRoute<HubProfileRouteProp>();
    const navigation = useNavigation<any>();
    const [isFollowing, setIsFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('ongoing');

    const tabs = [
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Past', value: 'past' },
    ];

    const renderTournamentList = () => {
        const data = tournamentsData[activeTab];

        if (!data || data.length === 0) {
            return (
                <View className="items-center py-12 opacity-50">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4 font-medium">No tournaments found</Text>
                </View>
            );
        }

        return (
            <View className="space-y-3 pb-8">
                {data.map((tournament) => (
                    <TournamentCard
                        key={tournament.id}
                        {...tournament}
                        onClick={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
                    />
                ))}
            </View>
        );
    };

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
                                    {hubData.description}
                                </Text>
                            </View>
                        </View>

                        <Button
                            onPress={() => setIsFollowing(!isFollowing)}
                            variant={isFollowing ? "secondary" : "default"}
                            className="w-full"
                        >
                            <Text className={cn("font-bold", !isFollowing ? "text-white" : "text-foreground")}>
                                {isFollowing ? "Following" : "Follow Hub"}
                            </Text>
                        </Button>
                    </View>

                    <View className="px-4 py-6 space-y-6">
                        {/* Stats */}
                        <View className="flex-row gap-3">
                            <View className="flex-1">
                                <StatCard icon="people" value={hubData.followers.toLocaleString()} label="Followers" />
                            </View>
                            <View className="flex-1">
                                <StatCard icon="trophy" value={hubData.tournaments} label="Tournaments" variant="gold" />
                            </View>
                            <View className="flex-1">
                                <StatCard icon="calendar" value={hubData.ongoingTournaments} label="Ongoing" variant="accent" />
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
        </SafeAreaView>
    );
}
