import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

import { API_BASE_URL, ENDPOINTS } from '../lib/api';

// v2 - forcing refresh
type HubsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Hub {
    id: string;
    name: string;
    description: string;
    userId: string;
    userDisplayName: string | null;
    userHubs?: any[];
    tournaments?: any[];
    numberOfUsers: number;
    numberOfTournaments: number;
}

export default function HubsScreen() {
    const navigation = useNavigation<HubsScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            console.log('HubsScreen focused, fetching hubs...');
            fetchHubs();
        }, [])
    );

    const fetchHubs = async () => {
        try {
            const apiUrl = ENDPOINTS.HUBS;

            console.log('Fetching hubs from:', apiUrl);

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const text = await response.text();
                // Check if the response is HTML (often 404/500 from proxy/server)
                const isHtml = text.trim().startsWith('<');
                console.error('API Error Response:', isHtml ? 'HTML Error Page' : text);
                throw new Error(`Failed to fetch hubs: ${response.status}`);
            }

            const data = await response.json();

            // Handle response format: { items: Hub[], count: number }
            // If data is array use it, otherwise check for .items
            const hubsList = Array.isArray(data) ? data : (data.items || []);

            // Validate data is an array to prevent crash
            if (!Array.isArray(hubsList)) {
                console.error('Invalid data format received:', data);
                throw new Error('Invalid items format received from server');
            }

            setHubs(hubsList);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load hubs. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const filteredHubs = hubs.filter((hub) =>
        hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hub.description && hub.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Hubs"
                rightElement={
                    <Button onPress={() => setIsModalOpen(true)} size="sm" className="h-9 px-4">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="add" size={18} color="#FFFFFF" />
                            <Text className="text-white font-bold">Create</Text>
                        </View>
                    </Button>
                }
            />
            <View className="px-4 py-4 flex-1">
                <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search hubs..."
                    className="mb-4"
                />

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                ) : error ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-destructive mb-4">{error}</Text>
                        <Button onPress={fetchHubs} size="sm">Retry</Button>
                    </View>
                ) : (
                    <ScrollView className="flex-1">
                        <View className="space-y-3 pb-8">
                            {filteredHubs.length === 0 ? (
                                <View className="items-center py-12 opacity-50">
                                    <Ionicons name="people-outline" size={48} color="#71717A" />
                                    <Text className="text-muted-foreground mt-4 font-medium">No hubs found</Text>
                                </View>
                            ) : (
                                filteredHubs.map((hub) => (
                                    <Card
                                        key={hub.id}
                                        onPress={() => navigation.navigate('HubProfile', { id: hub.id })}
                                    >
                                        <View className="flex-row gap-4">
                                            <PlayerAvatar name={hub.name} size="lg" className="w-16 h-16" />
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-foreground">{hub.name}</Text>
                                                <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                                                    {hub.description}
                                                </Text>
                                                <View className="flex-row items-center gap-4 mt-3">
                                                    <View className="flex-row items-center gap-1">
                                                        <Ionicons name="people-outline" size={12} color="#A1A1AA" />
                                                        <Text className="text-xs text-muted-foreground font-medium">
                                                            {hub.numberOfUsers}
                                                        </Text>
                                                    </View>
                                                    <View className="flex-row items-center gap-1">
                                                        <Ionicons name="trophy-outline" size={12} color="#A1A1AA" />
                                                        <Text className="text-xs text-muted-foreground font-medium">
                                                            {hub.numberOfTournaments} Tournaments
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </Card>
                                ))
                            )}
                        </View>
                    </ScrollView>
                )}
            </View>

            <Modal
                visible={isModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-card p-6 rounded-t-3xl border-t border-border space-y-4">
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-xl font-bold text-foreground">Create New Hub</Text>
                            <Pressable onPress={() => setIsModalOpen(false)}>
                                <Ionicons name="close" size={24} color="#71717A" />
                            </Pressable>
                        </View>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-sm font-medium text-muted-foreground mb-1">Hub Name</Text>
                                <TextInput
                                    className="bg-secondary p-3 rounded-lg text-foreground border border-border/30"
                                    placeholder="e.g. Pro Players Guild"
                                    placeholderTextColor="#71717A"
                                />
                            </View>
                            <View>
                                <Text className="text-sm font-medium text-muted-foreground mb-1">Description</Text>
                                <TextInput
                                    className="bg-secondary p-3 rounded-lg text-foreground border border-border/30 h-20"
                                    placeholder="Describe your community..."
                                    placeholderTextColor="#71717A"
                                    multiline
                                />
                            </View>
                            <Button onPress={() => setIsModalOpen(false)} className="mt-4">
                                Create Hub
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
