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

type EditProfileNavigationProp = StackNavigationProp<RootStackParamList>;

export default function EditProfileScreen() {
    const navigation = useNavigation<EditProfileNavigationProp>();
    const { user, updateProfile, saveUserSocial, refreshUser, isLoading } = useAuth();

    const [username, setUsername] = useState(user?.username || '');

    // New social input state
    const [newSocialType, setNewSocialType] = useState<SocialType | undefined>(undefined);
    const [newSocialUsername, setNewSocialUsername] = useState('');

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (user) {
            setUsername(user.username);
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
            Alert.alert('Error', 'Please select a social platform');
            return;
        }
        if (!newSocialUsername.trim()) {
            Alert.alert('Error', 'Please enter your username/handle');
            return;
        }

        // Check if already exists in context user socials
        if (user?.userSocials?.some(s => s.socialType === newSocialType)) {
            Alert.alert('Error', 'You have already added this platform.');
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
            Alert.alert('Error', 'Failed to add social account');
        }
    };

    const handleRemoveSocial = (type: SocialType) => {
        // Since user only provided a POST for add/update, I'll keep local removal 
        // until a DELETE endpoint is provided. 
        // For now, let's just warn or keep it as UI only if it's not synced.
        // Actually, let's just keep it local for now or ask for delete endpoint.
        // If I keep it local, it will reappear on next fetch.
        Alert.alert('Note', 'Platform individual removal is not yet implemented on the server.');
    };

    const handleSave = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        const success = await updateProfile({
            id: user?.id,
            username: username.trim(),
            // No longer sending userSocials here as they are synced individually
        });

        if (success) {
            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert('Error', 'Failed to update profile');
        }
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
                                            onPress={() => handleRemoveSocial(social.socialType!)}
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

                <View className="p-4 border-t border-border/30 bg-background">
                    <Button onPress={handleSave} loading={isLoading} size="lg">
                        Save Changes
                    </Button>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
