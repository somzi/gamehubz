import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { SearchInput } from '../components/ui/SearchInput';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import { Card } from '../components/ui/Card';

type HubsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const hubsData = [
    {
        id: "1",
        name: "Esports Hub",
        description: "Premier competitive gaming community",
        followers: 1250,
        tournaments: 45,
    },
    {
        id: "2",
        name: "Gaming League",
        description: "Professional esports organization",
        followers: 890,
        tournaments: 32,
    },
    {
        id: "3",
        name: "Community Arena",
        description: "Open tournaments for everyone",
        followers: 2100,
        tournaments: 78,
    },
    {
        id: "4",
        name: "Pro Circuit",
        description: "Elite competitive series",
        followers: 560,
        tournaments: 18,
    },
];

export default function HubsScreen() {
    const navigation = useNavigation<HubsScreenNavigationProp>();
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredHubs = hubsData.filter((hub) =>
        hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hub.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                                                    <Text className="text-xs text-muted-foreground font-medium">{hub.followers.toLocaleString()}</Text>
                                                </View>
                                                <View className="flex-row items-center gap-1">
                                                    <Ionicons name="trophy-outline" size={12} color="#A1A1AA" />
                                                    <Text className="text-xs text-muted-foreground font-medium">{hub.tournaments} Tournaments</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            ))
                        )}
                    </View>
                </ScrollView>
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
