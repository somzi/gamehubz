import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { authenticatedFetch, ENDPOINTS } from '../lib/api';
import { EditHubModal } from '../components/modals/EditHubModal';
import { CreateTournamentModal } from '../components/modals/CreateTournamentModal';

type ManageHubScreenRouteProp = RouteProp<RootStackParamList, 'ManageHub'>;
type ManageHubScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    showChevron?: boolean;
}

function MenuItem({ icon, label, onPress, color = "#71717A", showChevron = true }: MenuItemProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center justify-between py-4 border-b border-white/5"
        >
            <View className="flex-row items-center gap-4">
                <Ionicons name={icon} size={22} color={color} />
                <Text className="text-white font-medium text-base">{label}</Text>
            </View>
            {showChevron && <Ionicons name="chevron-forward" size={18} color="#3F3F46" />}
        </Pressable>
    );
}

export default function ManageHubScreen() {
    const route = useRoute<ManageHubScreenRouteProp>();
    const navigation = useNavigation<ManageHubScreenNavigationProp>();
    const { hubId } = route.params;

    const [hubData, setHubData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateTournamentModal, setShowCreateTournamentModal] = useState(false);

    useEffect(() => {
        fetchHubDetails();
    }, [hubId]);

    const fetchHubDetails = async () => {
        try {
            setIsLoading(true);
            const response = await authenticatedFetch(ENDPOINTS.GET_HUB(hubId));
            if (response.ok) {
                const data = await response.json();
                setHubData(data.result || data);
            }
        } catch (error) {
            console.error('Error fetching hub details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateHub = async (name: string, description: string) => {
        try {
            const response = await authenticatedFetch(ENDPOINTS.UPDATE_HUB, {
                method: 'POST',
                body: JSON.stringify({
                    id: hubId,
                    name: name,
                    description: description,
                }),
            });

            if (response.ok) {
                await fetchHubDetails();
            } else {
                Alert.alert('Error', 'Failed to update hub.');
            }
        } catch (error) {
            console.error('Error updating hub:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
            throw error;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title="Manage Hub" showBack />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <PageHeader title="Manage Hub" showBack />

            <ScrollView className="flex-1 px-6">
                {/* Hub Info Preview */}
                <View className="items-center py-6 border-b border-white/5 mb-4">
                    <View className="w-20 h-20 rounded-3xl bg-primary/20 items-center justify-center mb-3">
                        <Ionicons name="people" size={40} color="#8B5CF6" />
                    </View>
                    <Text className="text-xl font-bold text-white text-center">{hubData?.name || 'Hub'}</Text>
                    <Text className="text-gray-500 text-sm text-center mt-1" numberOfLines={1}>
                        {hubData?.description || 'Management Dashboard'}
                    </Text>
                </View>

                {/* Management Menu */}
                <View className="space-y-1">
                    <MenuItem
                        icon="person-add-outline"
                        label="Manage Members"
                        onPress={() => navigation.navigate('HubMembers', { hubId })}
                    />
                    <MenuItem
                        icon="create-outline"
                        label="Edit Hub Info"
                        onPress={() => setShowEditModal(true)}
                    />
                    <MenuItem
                        icon="trophy-outline"
                        label="Create Tournament"
                        onPress={() => setShowCreateTournamentModal(true)}
                    />
                </View>
            </ScrollView>

            <EditHubModal
                visible={showEditModal}
                hubId={hubId}
                initialName={hubData?.name || ''}
                initialDescription={hubData?.description || ''}
                onClose={() => setShowEditModal(false)}
                onSave={handleUpdateHub}
            />
            <CreateTournamentModal
                visible={showCreateTournamentModal}
                onClose={() => setShowCreateTournamentModal(false)}
                hubId={hubId}
            />
        </SafeAreaView>
    );
}
