import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';

type EditProfileNavigationProp = StackNavigationProp<RootStackParamList>;

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

export default function EditProfileScreen() {
    const { user, logout, refreshUser } = useAuth();
    const navigation = useNavigation<EditProfileNavigationProp>();

    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                refreshUser();
            }
        }, [user?.id, refreshUser])
    );

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: () => logout() }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={['top']}>
            <PageHeader title="Edit Profile" showBack />

            <ScrollView className="flex-1 px-6">
                {/* User Info Header (Optional but looks nice) */}
                <View className="items-center py-6">
                    <PlayerAvatar name={user?.username || 'Guest'} size="lg" />
                    <Text className="text-xl font-bold text-white mt-3">{user?.username || 'Guest'}</Text>
                    <Text className="text-gray-500 text-sm">{user?.email || ''}</Text>
                </View>

                {/* Settings Menu List */}
                <View className="space-y-1">
                    <MenuItem
                        icon="person-outline"
                        label="Manage Profile"
                        onPress={() => navigation.navigate('UpdateProfile')}
                    />
                    <MenuItem
                        icon="lock-closed-outline"
                        label="Password & Security"
                        onPress={() => navigation.navigate('ChangePassword')}
                    />
                    <MenuItem
                        icon="notifications-outline"
                        label="Notifications"
                        onPress={() => navigation.navigate('Notifications')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        label="Help Center"
                        onPress={() => navigation.navigate('HelpCenter')}
                    />
                    <MenuItem
                        icon="mail-outline"
                        label="Contact Us"
                        onPress={() => navigation.navigate('ContactUs')}
                    />
                    <MenuItem
                        icon="information-circle-outline"
                        label="About Us"
                        onPress={() => navigation.navigate('AboutUs')}
                    />
                    <MenuItem
                        icon="log-out-outline"
                        label="Log Out"
                        onPress={handleLogout}
                        color="#EF4444"
                        showChevron={false}
                    />
                </View>

                <View className="py-12 items-center opacity-30">
                    <Text className="text-white text-xs">GameHubz Mobile v1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
