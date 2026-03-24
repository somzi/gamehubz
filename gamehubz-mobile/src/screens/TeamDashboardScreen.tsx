import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Pressable,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { StatusModal } from '../components/modals/StatusModal';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { TEAM_LABELS } from '../lib/teamConstants';
import {
    getPendingTournamentTeams,
    renameTeam,
    kickMember,
    leaveTeam,
    deleteTeam,
} from '../lib/teamApi';
import { ENDPOINTS, authenticatedFetch, getErrorMessage, API_BASE_URL } from '../lib/api';
import type { TeamDto } from '../types/team';

type TeamDashboardRouteProp = RouteProp<RootStackParamList, 'TeamDashboard'>;

export default function TeamDashboardScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<TeamDashboardRouteProp>();
    const { teamId, tournamentId, tournamentStatus } = route.params;
    const { user } = useAuth();

    const [team, setTeam] = useState<TeamDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editing team name
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    // Confirmation modals
    const [confirmModal, setConfirmModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        isDestructive: boolean;
        onConfirm: () => void;
        isLoading: boolean;
    }>({
        visible: false,
        title: '',
        message: '',
        isDestructive: true,
        onConfirm: () => { },
        isLoading: false,
    });

    // Status modal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
        onClose?: () => void;
    }>({ type: 'success', title: '', message: '' });

    // Loading states for actions
    const [isRegistering, setIsRegistering] = useState(false);

    const fetchTeam = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const url = `${API_BASE_URL}/api/tournament/${tournamentId}/myTeam`;
            const response = await authenticatedFetch(url);
            if (!response.ok) {
                throw new Error('Team not found');
            }
            const teamData = await response.json();
            // Handle array response if needed, although endpoint usually returns single object
            if (Array.isArray(teamData)) {
                // Try to find the team where current user is captain or member
                const myTeam = teamData.find(t => {
                    const captainId = t.captainUserId || t.CaptainUserId;
                    if (captainId?.toLowerCase() === user?.id?.toLowerCase()) return true;
                    const members = t.members || t.Members || [];
                    return members.some((m: any) => (m.userId || m.UserId)?.toLowerCase() === user?.id?.toLowerCase());
                }) || teamData[0];
                setTeam(myTeam);
            } else {
                setTeam(teamData);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : TEAM_LABELS.ERROR_FETCH_TEAMS;
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [tournamentId]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const actualTeamSize = route.params.teamSize || team?.teamSize || team?.TeamSize || 2;
    const actualMemberCount = team?.memberCount || team?.MemberCount || team?.members?.length || 1;
    const isAlreadyRegistered = team?.isAlreadyRegistered || team?.IsAlreadyRegistered || team?.isAlreadyRegistred || team?.IsAlreadyRegistred;
    const captainId = team?.captainUserId || team?.CaptainUserId;
    const isCaptain = !!user?.id && !!captainId && user.id.toLowerCase() === captainId.toLowerCase();

    // --- Actions ---

    const handleStartEditName = () => {
        setEditedName(team?.teamName || '');
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        if (!team || !editedName.trim()) return;
        setIsSavingName(true);
        try {
            const updated = await renameTeam(team.teamId, editedName.trim());
            setTeam(updated);
            setIsEditingName(false);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setStatusModalConfig({ type: 'error', title: 'Error', message });
            setShowStatusModal(true);
        } finally {
            setIsSavingName(false);
        }
    };

    const handleLeaveTeam = () => {
        setConfirmModal({
            visible: true,
            title: TEAM_LABELS.CONFIRM_LEAVE_TITLE,
            message: TEAM_LABELS.CONFIRM_LEAVE_MESSAGE,
            isDestructive: true,
            isLoading: false,
            onConfirm: async () => {
                if (!team || !user?.id) return;
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await leaveTeam(team.teamId);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    navigation.goBack();
                } catch (err: unknown) {
                    const message = getErrorMessage(err);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    setStatusModalConfig({ type: 'error', title: 'Error', message });
                    setShowStatusModal(true);
                }
            },
        });
    };

    const handleKickMember = (userId: string, username: string) => {
        setConfirmModal({
            visible: true,
            title: TEAM_LABELS.CONFIRM_KICK_TITLE,
            message: `${TEAM_LABELS.CONFIRM_KICK_MESSAGE}\n\nPlayer: ${username}`,
            isDestructive: true,
            isLoading: false,
            onConfirm: async () => {
                if (!team) return;
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await kickMember(team.teamId, userId);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    fetchTeam();
                } catch (err: unknown) {
                    const message = getErrorMessage(err);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    setStatusModalConfig({ type: 'error', title: 'Error', message });
                    setShowStatusModal(true);
                }
            },
        });
    };

    const handleDeleteTeam = () => {
        setConfirmModal({
            visible: true,
            title: TEAM_LABELS.CONFIRM_DELETE_TITLE,
            message: TEAM_LABELS.CONFIRM_DELETE_MESSAGE,
            isDestructive: true,
            isLoading: false,
            onConfirm: async () => {
                if (!team) return;
                setConfirmModal(prev => ({ ...prev, isLoading: true }));
                try {
                    await deleteTeam(team.teamId);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    navigation.goBack();
                } catch (err: unknown) {
                    const message = getErrorMessage(err);
                    setConfirmModal(prev => ({ ...prev, visible: false, isLoading: false }));
                    setStatusModalConfig({ type: 'error', title: 'Error', message });
                    setShowStatusModal(true);
                }
            },
        });
    };

    const handleRegisterTeam = async () => {
        if (!team || !user?.id) return;
        setIsRegistering(true);
        try {
            const response = await authenticatedFetch(ENDPOINTS.REGISTER_TEAM_IN_TOURNAMENT(tournamentId, team.teamId), {
                method: 'GET',
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || TEAM_LABELS.ERROR_REGISTER_TEAM);
            }
            setStatusModalConfig({
                type: 'success',
                title: 'Team Registered!',
                message: 'Your team has been successfully registered for the tournament.',
                onClose: () => {
                    navigation.navigate('TournamentDetails', { id: tournamentId });
                }
            });
            setShowStatusModal(true);
        } catch (err: unknown) {
            const message = getErrorMessage(err);
            setStatusModalConfig({ type: 'error', title: 'Error', message });
            setShowStatusModal(true);
        } finally {
            setIsRegistering(false);
        }
    };

    // --- Renders ---

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title={TEAM_LABELS.TEAM_DASHBOARD_TITLE} showBack />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text className="text-muted-foreground mt-4">Loading team...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !team) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title={TEAM_LABELS.TEAM_DASHBOARD_TITLE} showBack />
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="text-destructive mt-4 text-center font-medium">
                        {error || 'Team not found'}
                    </Text>
                    <Button onPress={fetchTeam} className="mt-6">Retry</Button>
                </View>
            </SafeAreaView>
        );
    }

    const memberProgress = actualMemberCount / actualTeamSize;

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]">
            <PageHeader title={TEAM_LABELS.TEAM_DASHBOARD_TITLE} showBack />

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Team Name Header */}
                <View className="px-6 pt-6 pb-4">
                    <View className="flex-row items-center gap-3">
                        {isEditingName ? (
                            <View className="flex-1 flex-row items-center gap-2">
                                <TextInput
                                    className="flex-1 bg-[#131B2E] px-4 h-12 rounded-xl text-white border border-[#00E5A0]/30 text-lg font-bold"
                                    value={editedName}
                                    onChangeText={setEditedName}
                                    autoFocus
                                    placeholderTextColor="#6b7280"
                                />
                                <Pressable
                                    onPress={handleSaveName}
                                    disabled={isSavingName}
                                    className="w-10 h-10 rounded-xl bg-[#00E5A0]/20 items-center justify-center border border-[#00E5A0]/30"
                                >
                                    {isSavingName ? (
                                        <ActivityIndicator size="small" color="#00E5A0" />
                                    ) : (
                                        <Ionicons name="checkmark" size={20} color="#00E5A0" />
                                    )}
                                </Pressable>
                                <Pressable
                                    onPress={() => setIsEditingName(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10"
                                >
                                    <Ionicons name="close" size={20} color="#94A3B8" />
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                <Text
                                    className="text-3xl font-black text-white flex-1"
                                    style={{ fontFamily: 'Syne' }}
                                    numberOfLines={2}
                                >
                                    {team.teamName}
                                </Text>
                                {isCaptain && Number(tournamentStatus) === 1 && (
                                    <Pressable
                                        onPress={handleStartEditName}
                                        className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center border border-white/10"
                                    >
                                        <Ionicons name="pencil" size={18} color="#94A3B8" />
                                    </Pressable>
                                )}
                            </>
                        )}
                    </View>
                </View>

                {/* Member Count Progress */}
                <View className="px-6 pb-6">
                    <View className="bg-[#131B2E] rounded-2xl border border-white/5 p-5">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="people" size={18} color="#00E5A0" />
                                <Text className="text-sm font-bold text-white">
                                    {TEAM_LABELS.MEMBERS_LABEL}
                                </Text>
                            </View>
                            <Text className="text-sm font-black text-[#00E5A0]">
                                {actualMemberCount} / {actualTeamSize}
                            </Text>
                        </View>

                        {/* Progress bar */}
                        <View className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${Math.min(memberProgress * 100, 100)}%`,
                                    backgroundColor: memberProgress >= 1 ? '#00E5A0' : '#F59E0B',
                                }}
                            />
                        </View>

                        {/* Filled dot indicators */}
                        <View className="flex-row gap-2 mt-3 justify-center">
                            {Array.from({ length: actualTeamSize }).map((_, i) => (
                                <View
                                    key={i}
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: i < actualMemberCount ? '#00E5A0' : 'rgba(255,255,255,0.1)',
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* Member List */}
                <View className="px-6 pb-6">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Ionicons name="list-outline" size={18} color="#3B82F6" />
                        <Text className="text-sm font-black text-white uppercase tracking-widest">
                            Team Members
                        </Text>
                    </View>

                    {team.members.map((member) => {
                        const isMemberCaptain = member.isCaptain;
                        const isCurrentUser =
                            user?.id?.toLowerCase() === member.userId.toLowerCase();

                        return (
                            <View
                                key={member.userId}
                                className="bg-[#131B2E]/50 p-4 mb-2 rounded-[22px] border border-white/5 flex-row items-center gap-3"
                            >
                                <PlayerAvatar
                                    name={member.username}
                                    size="md"
                                />
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2">
                                        <Text className="font-bold text-lg text-white">
                                            {member.username}
                                        </Text>
                                        {isCurrentUser && (
                                            <Text className="text-[10px] text-slate-500 font-bold">(You)</Text>
                                        )}
                                    </View>
                                    {isMemberCaptain && (
                                        <View className="flex-row items-center gap-1 mt-0.5">
                                            <Ionicons name="shield" size={12} color="#F59E0B" />
                                            <Text className="text-[11px] font-black text-[#F59E0B] uppercase tracking-wider">
                                                {TEAM_LABELS.CAPTAIN_BADGE}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Captain can kick non-captain members only while registration is open (Status 1) */}
                                {isCaptain && !isMemberCaptain && Number(tournamentStatus) === 1 && (
                                    <Pressable
                                        onPress={() => handleKickMember(member.userId, member.username)}
                                        className="w-10 h-10 rounded-xl bg-red-500/10 items-center justify-center border border-red-500/20"
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                    </Pressable>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Action Buttons */}
                <View className="px-6 pb-6 gap-3">
                    {/* Captain: Register Team - Only when full and not yet registered */}
                    {isCaptain && actualMemberCount === actualTeamSize && (
                        isAlreadyRegistered ? (
                            <View className="w-full bg-[#10B981]/10 p-4 rounded-2xl border border-[#10B981]/20 flex-row justify-center gap-2 items-center">
                                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                <Text className="text-[#10B981] font-black uppercase tracking-widest text-sm">Registered</Text>
                            </View>
                        ) : (
                            <Button
                                className="w-full bg-[#00E5A0]"
                                onPress={handleRegisterTeam}
                                loading={isRegistering}
                            >
                                {TEAM_LABELS.REGISTER_TEAM_BUTTON}
                            </Button>
                        )
                    )}

                    {/* Regular member: Leave Team - Only while registration is open (Status 1) */}
                    {!isCaptain && Number(tournamentStatus) === 1 && (
                        <Button
                            variant="outline"
                            className="w-full border-red-500/30"
                            onPress={handleLeaveTeam}
                        >
                            {TEAM_LABELS.LEAVE_TEAM_BUTTON}
                        </Button>
                    )}

                    {/* Captain: Delete Team - Only while registration is open (Status 1) */}
                    {isCaptain && Number(tournamentStatus) === 1 && (
                        <Button
                            variant="destructive"
                            className="w-full"
                            onPress={handleDeleteTeam}
                        >
                            {TEAM_LABELS.DELETE_TEAM_BUTTON}
                        </Button>
                    )}
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <ConfirmationModal
                visible={confirmModal.visible}
                onClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isDestructive={confirmModal.isDestructive}
                isLoading={confirmModal.isLoading}
            />

            {/* Status Modal */}
            {showStatusModal && (
                <StatusModal
                    visible={showStatusModal}
                    type={statusModalConfig.type}
                    title={statusModalConfig.title}
                    message={statusModalConfig.message}
                    onClose={() => {
                        setShowStatusModal(false);
                        if (statusModalConfig.onClose) {
                            statusModalConfig.onClose();
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
}
