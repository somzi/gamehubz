import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';
import { SocialType, UserSocial } from '../types/auth';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { SelectInput } from '../components/ui/SelectInput';
import { StatusModal } from '../components/modals/StatusModal';

type EditProfileNavigationProp = StackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
    const navigation = useNavigation<EditProfileNavigationProp>();
    const { user, updateProfile, saveUserSocial, deleteUserSocial, refreshUser, isLoading, logout } = useAuth();

    const [username, setUsername] = useState(user?.username || '');
    const [nickName, setNickName] = useState(user?.nickName || '');

    // New social input state
    const [newSocialType, setNewSocialType] = useState<SocialType | undefined>(undefined);
    const [newSocialUsername, setNewSocialUsername] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
        onClose?: () => void;
    }>({ type: 'success', title: '', message: '' });

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setNickName(user.nickName || '');
        }
    }, [user]);

    const socialTypeOptions = [
        { label: 'Instagram', value: SocialType.Instagram },
        { label: 'X (Twitter)', value: SocialType.X },
        { label: 'Facebook', value: SocialType.Facebook },
        { label: 'TikTok', value: SocialType.TikTok },
        { label: 'YouTube', value: SocialType.YouTube },
        { label: 'Discord', value: SocialType.Discord },
    ];

    const getSocialIcon = (type: SocialType) => {
        switch (type) {
            case SocialType.Instagram: return 'logo-instagram';
            case SocialType.X: return 'logo-twitter'; // X logo not always available, using twitter
            case SocialType.Facebook: return 'logo-facebook';
            case SocialType.TikTok: return 'logo-tiktok'; // Ionicons might not have tiktok
            case SocialType.YouTube: return 'logo-youtube';
            case SocialType.Discord: return 'logo-discord';
            default: return 'link-outline';
        }
    };

    // Some icons might be missing in default Ionicons set (like Tiktok), handling gracefully
    const getSocialLabel = (type: SocialType) => {
        return socialTypeOptions.find(opt => opt.value === type)?.label || 'Social';
    };

    const handleAddSocial = async () => {
        if (!newSocialType) {
            setStatusModalConfig({
                type: 'error',
                title: 'Missing Platform',
                message: 'Please select a social platform'
            });
            setShowStatusModal(true);
            return;
        }
        if (!newSocialUsername.trim()) {
            setStatusModalConfig({
                type: 'error',
                title: 'Missing Username',
                message: 'Please enter your username/handle'
            });
            setShowStatusModal(true);
            return;
        }

        // Check if already exists in context user socials
        if (user?.userSocials?.some(s => s.socialType === newSocialType)) {
            setStatusModalConfig({
                type: 'error',
                title: 'Platform Exists',
                message: 'You have already added this platform.'
            });
            setShowStatusModal(true);
            return;
        }

        const success = await saveUserSocial({
            socialType: newSocialType,
            username: newSocialUsername.trim()
        });

        if (success) {
            setNewSocialType(undefined);
            setNewSocialUsername('');
        } else {
            setStatusModalConfig({
                type: 'error',
                title: 'Failed',
                message: 'Failed to add social account'
            });
            setShowStatusModal(true);
        }
    };

    const handleRemoveSocial = (social: UserSocial) => {
        if (!social.id) return;

        Alert.alert(
            'Remove Social Account',
            `Are you sure you want to remove your ${getSocialLabel(social.socialType!)} account?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteUserSocial(social.id!);
                        if (!success) {
                            setStatusModalConfig({
                                type: 'error',
                                title: 'Failed',
                                message: 'Failed to remove social account'
                            });
                            setShowStatusModal(true);
                        }
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!username.trim()) {
            setStatusModalConfig({
                type: 'error',
                title: 'Empty Username',
                message: 'Username cannot be empty'
            });
            setShowStatusModal(true);
            return;
        }

        const success = await updateProfile({
            id: user?.id,
            username: username.trim(),
            nickName: nickName.trim(),
            // No longer sending userSocials here as they are synced individually
        });

        if (success) {
            setStatusModalConfig({
                type: 'success',
                title: 'Profile Updated',
                message: 'Profile updated successfully',
                onClose: () => navigation.goBack()
            });
            setShowStatusModal(true);
        } else {
            setStatusModalConfig({
                type: 'error',
                title: 'Update Failed',
                message: 'Failed to update profile'
            });
            setShowStatusModal(true);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Edit Profile" showBack />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 py-6">
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-foreground mb-4">Basic Info</Text>
                        <Input
                            label="Username"
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Enter username"
                        />
                        <View className="h-4" />
                        <Input
                            label="Nickname"
                            value={nickName}
                            onChangeText={setNickName}
                            placeholder="In-game nick"
                        />
                    </View>

                    <View className="mb-8">
                        <Text className="text-lg font-bold text-foreground mb-4">Social Accounts</Text>

                        {/* List of added socials */}
                        {user?.userSocials && user.userSocials.length > 0 ? (
                            <View className="mb-4 gap-3">
                                {user.userSocials.map((social) => (
                                    <View
                                        key={social.socialType!}
                                        className="flex-row items-center justify-between p-3 bg-card rounded-xl border border-border/30"
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
                                                <Ionicons name={getSocialIcon(social.socialType!) as any} size={16} color="hsl(45, 90%, 55%)" />
                                            </View>
                                            <View>
                                                <Text className="text-sm font-bold text-foreground">{getSocialLabel(social.socialType!)}</Text>
                                                <Text className="text-xs text-muted-foreground">{social.username}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleRemoveSocial(social)}
                                            className="p-2"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text className="text-muted-foreground italic mb-4">No social accounts connected</Text>
                        )}

                        {/* Add New Social Form */}
                        <View className="p-4 bg-muted/10 rounded-xl border border-dashed border-border/50">
                            <Text className="text-sm font-medium text-muted-foreground mb-3">Add New Account</Text>

                            <SelectInput
                                placeholder="Select Platform"
                                options={socialTypeOptions}
                                value={newSocialType}
                                onSelect={setNewSocialType}
                                className="mb-3"
                            />

                            {newSocialType && (
                                <View className="mb-3">
                                    <Input
                                        placeholder="Username / Handle"
                                        value={newSocialUsername}
                                        onChangeText={setNewSocialUsername}
                                    />
                                </View>
                            )}

                            <Button
                                onPress={handleAddSocial}
                                variant="outline"
                                size="sm"
                                disabled={!newSocialType || !newSocialUsername}
                                loading={isLoading}
                            >
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="add" size={16} color="white" />
                                    <Text className="text-white font-bold">Add Account</Text>
                                </View>
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <View className="p-4 border-t border-border/30 bg-background gap-3">
                    <Button onPress={handleSave} loading={isLoading} size="lg">
                        Save Changes
                    </Button>
                    <Button
                        onPress={handleLogout}
                        variant="ghost"
                        size="lg"
                        className="border border-red-500/50"
                    >
                        <Text className="text-red-500 font-bold">Log Out</Text>
                    </Button>
                </View>
            </KeyboardAvoidingView>

            <StatusModal
                visible={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    if (statusModalConfig.onClose) statusModalConfig.onClose();
                }}
                type={statusModalConfig.type}
                title={statusModalConfig.title}
                message={statusModalConfig.message}
            />
        </SafeAreaView>
    );
}
