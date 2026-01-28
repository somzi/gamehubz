import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { StatusModal } from '../components/modals/StatusModal';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { isLoading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
        onClose?: () => void;
    }>({ type: 'success', title: '', message: '' });

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setStatusModalConfig({
                type: 'error',
                title: 'Missing Fields',
                message: 'Please fill in all password fields.'
            });
            setShowStatusModal(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatusModalConfig({
                type: 'error',
                title: 'Mismatch',
                message: 'New password and retype password do not match.'
            });
            setShowStatusModal(true);
            return;
        }

        if (newPassword.length < 6) {
            setStatusModalConfig({
                type: 'error',
                title: 'Weak Password',
                message: 'New password must be at least 6 characters long.'
            });
            setShowStatusModal(true);
            return;
        }

        // TODO: Implement actual API call once endpoint is available
        // For now, simulate success
        setStatusModalConfig({
            type: 'success',
            title: 'Password Changed',
            message: 'Your password has been updated successfully.',
            onClose: () => navigation.goBack()
        });
        setShowStatusModal(true);
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader title="Change Password" showBack />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-6 py-8">
                    <View className="space-y-6">
                        <Input
                            label="Current Password"
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Enter current password"
                            secureTextEntry
                        />

                        <View className="h-4" />

                        <Input
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            secureTextEntry
                        />

                        <View className="h-2" />

                        <Input
                            label="Retype New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry
                        />

                        <Text className="text-gray-500 text-xs mt-2">
                            Password must be at least 6 characters long.
                        </Text>
                    </View>
                </ScrollView>

                <View className="p-6 border-t border-white/5">
                    <Button
                        onPress={handleChangePassword}
                        loading={isLoading}
                        size="lg"
                    >
                        Update Password
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
