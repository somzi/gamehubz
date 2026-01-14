import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TextInput, Pressable, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { TournamentCard } from '../components/cards/TournamentCard';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/layout/PageHeader';
// import { FloatingActionButton } from '../components/layout/FloatingActionButton'; // Removed
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { CreateTournamentModal } from '../components/modals/CreateTournamentModal';

type TournamentsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Tournament {
    id: string;
    name: string;
    status: 'live' | 'upcoming' | 'completed';
    date: string;
    region: string;
    prizePool: string;
    players: any[];
    isOpen?: boolean;
    minLevel?: number;
}

// Mock data matching the web app
const tournamentsData: Record<string, Tournament[]> = {
    live: [
        {
            id: "1",
            name: "Winter Championship 2024",
            status: "live",
            date: "Jan 15, 2024",
            region: "Europe",
            prizePool: "$1,000",
            players: new Array(8).fill({}),
        },
    ],
    upcoming: [
        {
            id: "2",
            name: "Spring Showdown",
            status: "upcoming",
            date: "Feb 1, 2024",
            region: "North America",
            prizePool: "$500",
            players: new Array(3).fill({}),
            isOpen: true,
            minLevel: 2,
        },
    ],
    completed: [
        {
            id: "4",
            name: "Fall Championship",
            status: "completed",
            date: "Dec 15, 2023",
            region: "Europe",
            prizePool: "$1,500",
            players: new Array(4).fill({}),
        },
    ],
    open: [
        {
            id: "5",
            name: "Community Cup #12",
            status: "upcoming",
            date: "Feb 20, 2024",
            region: "Global",
            prizePool: "$250",
            players: new Array(1).fill({}),
            isOpen: true,
            minLevel: 1,
        },
    ],
};

const currentUserLevel = 2;

export default function TournamentsScreen() {
    const navigation = useNavigation<TournamentsScreenNavigationProp>();
    const [activeTab, setActiveTab] = useState('live');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isEligible = (minLevel: number) => currentUserLevel >= minLevel;

    const tabs = [
        { label: 'Live', value: 'live' },
        { label: 'Upcoming', value: 'upcoming' },
        { label: 'Open', value: 'open' },
        { label: 'Completed', value: 'completed' },
    ];

    const renderContent = () => {
        const data = tournamentsData[activeTab as keyof typeof tournamentsData];

        if (data.length === 0) {
            return (
                <View className="items-center py-12 opacity-50">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4">No tournaments found</Text>
                </View>
            );
        }

        return (
            <View className="space-y-3">
                {data.map((tournament) => (
                    <TournamentCard
                        key={tournament.id}
                        {...tournament}
                        showApply={tournament.isOpen && isEligible(tournament.minLevel || 0)}
                        onClick={() => navigation.navigate('TournamentDetails', { id: tournament.id })}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Tournaments"
                rightElement={<Ionicons name="trophy" size={24} color="#10B981" />}
            />
            <ScrollView className="flex-1">
                <View className="px-4 py-6 space-y-6">
                    <View className="flex-row gap-3">
                        <StatCard icon="trophy" value={1} label="Live Now" variant="gold" className="flex-1" />
                        <StatCard icon="lock-open-outline" value={tournamentsData.open.length} label="Open" variant="accent" className="flex-1" />
                    </View>

                    <Tabs
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {renderContent()}
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="absolute right-4 bg-primary flex-row items-center px-5 py-3 rounded-full shadow-lg z-50"
                style={{
                    bottom: 20, // We are inside SafeAreaView, so bottom padding is usually handled there, but let's double check.
                    // Actually, if we want it to float over scrollview, absolute is correct. 
                    // SafeAreaView usually adds padding. If we are INSIDE SafeAreaView, we might not need extra inset logic if SafeAreaView works as container.
                    // But if SafeAreaView is just padding, absolute bottom 20 might be too close to home bar if not handled?
                    // Let's use standard absolute bottom.
                }}
            >
                <Ionicons name="add" size={24} color="#FFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-base">Create Tournament</Text>
            </TouchableOpacity>

            <CreateTournamentModal
                visible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </SafeAreaView>
    );
}
