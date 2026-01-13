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

const ongoingTournaments = [
    {
        id: "1",
        name: "Winter Championship 2024",
        status: "live" as const,
        date: "Jan 15, 2024",
        region: "Europe",
        prizePool: "$1,000",
        players: new Array(64).fill({}),
    },
];

const pastTournaments = [
    {
        id: "2",
        name: "Fall Series Finals",
        status: "completed" as const,
        date: "Dec 10, 2023",
    },
    {
        id: "3",
        name: "Summer Cup",
        status: "completed" as const,
        date: "Aug 20, 2023",
    },
];

export default function HubProfileScreen() {
    const route = useRoute<HubProfileRouteProp>();
    const navigation = useNavigation<any>();
    const [isFollowing, setIsFollowing] = useState(false);

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

                    <View className="px-4 py-6 space-y-8">
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

                        {/* Ongoing Tournaments */}
                        <View>
                            <Text className="text-lg font-bold mb-4 text-foreground">Ongoing Tournaments</Text>
                            <View className="space-y-3">
                                {ongoingTournaments.map((tournament) => (
                                    <TournamentCard
                                        key={tournament.id}
                                        {...tournament}
                                        onClick={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
                                    />
                                ))}
                            </View>
                        </View>

                        {/* Past Tournaments */}
                        <View className="pb-8">
                            <Text className="text-lg font-bold mb-4 text-foreground">Past Tournaments</Text>
                            <View className="space-y-3">
                                {pastTournaments.map((tournament) => (
                                    <Pressable
                                        key={tournament.id}
                                        onPress={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
                                        className="flex-row items-center justify-between p-4 rounded-xl bg-card border border-border/30"
                                        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    >
                                        <View>
                                            <Text className="font-bold text-foreground text-base">{tournament.name}</Text>
                                            <Text className="text-sm text-muted-foreground mt-1">{tournament.date}</Text>
                                        </View>
                                        <View className="bg-muted/50 px-2 py-1 rounded">
                                            <Text className="text-[10px] font-bold text-muted-foreground uppercase">{tournament.status}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
