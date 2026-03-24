import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TEAM_LABELS } from '../../lib/teamConstants';
import { createTeam, joinTeam, getPendingTournamentTeams } from '../../lib/teamApi';
import { getErrorMessage } from '../../lib/api';
import type { TeamDto } from '../../types/team';

interface TeamRegistrationModalProps {
    visible: boolean;
    onClose: () => void;
    tournamentId: string;
    onTeamJoined: (team: TeamDto) => void;
    availableTeams?: TeamDto[];
}

export function TeamRegistrationModal({
    visible,
    onClose,
    tournamentId,
    onTeamJoined,
}: TeamRegistrationModalProps) {
    const insets = useSafeAreaInsets();
    const [teamName, setTeamName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        if (visible) {
            setTeamName('');
            setCreateError(null);
        }
    }, [visible]);

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setCreateError('Team name is required');
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        try {
            const team = await createTeam(tournamentId, teamName.trim());
            onTeamJoined(team);
            onClose();
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setCreateError(message);
        } finally {
            setIsCreating(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                }}
            >
                <View className="flex-1 justify-end">
                    <View className="bg-[#0f172a] rounded-t-[40px] border-t border-white/10 shadow-2xl max-h-[85%]">
                        {/* Header */}
                        <View className="flex-row justify-between items-center p-6 border-b border-white/5">
                            <Text className="text-xl font-bold text-white">
                                {TEAM_LABELS.REGISTRATION_MODAL_TITLE}
                            </Text>
                            <TouchableOpacity
                                onPress={onClose}
                                className="bg-white/5 p-2 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView
                            className="px-6 py-6"
                            contentContainerStyle={{ paddingBottom: 24 }}
                            showsVerticalScrollIndicator={false}
                        >
                                <View className="gap-5">
                                    {/* Team Name */}
                                    <View>
                                        <View className="flex-row items-center mb-3">
                                            <Ionicons
                                                name="flag-outline"
                                                size={16}
                                                color="#00E5A0"
                                                style={{ marginRight: 6 }}
                                            />
                                            <Text className="text-sm font-bold text-white">
                                                {TEAM_LABELS.TEAM_NAME_LABEL}
                                            </Text>
                                        </View>
                                        <TextInput
                                            className="bg-[#131B2E] p-4 rounded-xl text-white border border-white/10"
                                            placeholder={TEAM_LABELS.TEAM_NAME_PLACEHOLDER}
                                            placeholderTextColor="#6b7280"
                                            value={teamName}
                                            onChangeText={setTeamName}
                                        />
                                    </View>

                                    {createError && (
                                        <Text className="text-red-500 text-xs text-center">
                                            {createError}
                                        </Text>
                                    )}

                                    <Button
                                        onPress={handleCreateTeam}
                                        loading={isCreating}
                                        disabled={isCreating || !teamName.trim()}
                                        className="bg-[#00E5A0] py-4 rounded-2xl w-full"
                                    >
                                        {TEAM_LABELS.CREATE_TEAM_BUTTON}
                                    </Button>
                                </View>
                        </ScrollView>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
