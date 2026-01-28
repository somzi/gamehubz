import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { PageHeader } from '../components/layout/PageHeader';
import { TournamentBracket } from '../components/bracket/TournamentBracket';
import { TournamentGroups } from '../components/bracket/TournamentGroups';
import { Tabs } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button';
import { PlayerAvatar } from '../components/ui/PlayerAvatar';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ENDPOINTS, authenticatedFetch } from '../lib/api';
import { ReportResultModal } from '../components/modals/ReportResultModal';
import { TournamentRegion } from '../types/tournament';
import { StatusModal } from '../components/modals/StatusModal';
import { EditTournamentModal } from '../components/modals/EditTournamentModal';

type TournamentDetailsRouteProp = RouteProp<RootStackParamList, 'TournamentDetails'>;

export default function TournamentDetailsScreen() {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const route = useRoute<TournamentDetailsRouteProp>();
    const { id } = route.params;
    const [activeTab, setActiveTab] = useState('overview');
    const [tournament, setTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stages, setStages] = useState<any[]>([]);
    const [selectedStageIndex, setSelectedStageIndex] = useState(0);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [loadingBracket, setLoadingBracket] = useState(false);
    const [bracketError, setBracketError] = useState<string | null>(null);

    const { user } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
    const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
    const [isLoadingPending, setIsLoadingPending] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isCreatingBracket, setIsCreatingBracket] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [isUserRegistered, setIsUserRegistered] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalConfig, setStatusModalConfig] = useState<{
        type: 'success' | 'error' | 'info';
        title: string;
        message: string;
    }>({ type: 'success', title: '', message: '' });

    const handleJoin = async () => {
        if (!id || !user?.id) return;

        setIsRegistering(true);
        try {
            const payload = {
                TournamentId: id,
                UserId: user.id,
                Status: 0
            };

            const response = await authenticatedFetch(ENDPOINTS.REGISTER_TOURNAMENT, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to join tournament');
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Congratulations!',
                message: 'Successfully registered to the tournament!'
            });
            setShowStatusModal(true);
            fetchTournamentDetails(); // Refresh details
        } catch (err: any) {
            setStatusModalConfig({
                type: 'error',
                title: 'Join Failed',
                message: err.message || 'An error occurred while joining'
            });
            setShowStatusModal(true);
        } finally {
            setIsRegistering(false);
        }
    };

    const checkRegistrationStatus = async () => {
        if (!id || !user?.id) return;
        try {
            const url = ENDPOINTS.CHECK_REGISTRATION(id, user.id);
            const response = await authenticatedFetch(url);
            if (response.ok) {
                const isRegistered = await response.json();
                setIsUserRegistered(!!isRegistered);
            }
        } catch (err) {
            console.error('Check registration error:', err);
        }
    };

    const fetchTournamentDetails = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = ENDPOINTS.GET_TOURNAMENT_OVERVIEW(id);
            const response = await authenticatedFetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch tournament: ${response.status}`);
            }
            const data = await response.json();
            const rawData = data.result || data;

            // Normalize tournament data to use camelCase consistently
            const normalizedTournament = {
                ...rawData,
                id: rawData.id || rawData.Id,
                name: rawData.name || rawData.Name,
                status: rawData.status !== undefined ? rawData.status : rawData.Status,
                maxPlayers: rawData.maxPlayers || rawData.MaxPlayers,
                numberOfParticipants: rawData.numberOfParticipants || rawData.NumberOfParticipants,
                format: rawData.format !== undefined ? rawData.format : rawData.Format,
                createdBy: rawData.createdBy || rawData.CreatedBy || rawData.createdby,
                groupsCount: rawData.groupsCount || rawData.GroupsCount,
                qualifiersPerGroup: rawData.qualifiersPerGroup || rawData.QualifiersPerGroup,
                prize: rawData.prize || rawData.Prize,
                prizeCurrency: rawData.prizeCurrency || rawData.PrizeCurrency,
                startDate: rawData.startDate || rawData.StartDate,
                region: rawData.region !== undefined ? rawData.region : rawData.Region,
                description: rawData.description || rawData.Description,
                rules: rawData.rules || rawData.Rules,
                registrationDeadline: rawData.registrationDeadline || rawData.RegistrationDeadLine || rawData.registrationDeadLine,
                hubId: rawData.hubId || rawData.HubId,
            };

            setTournament(normalizedTournament);

            // Check registration status if tournament is open for registration
            if (normalizedTournament.status === 0 || normalizedTournament.status === 1) {
                checkRegistrationStatus();
            }
        } catch (err: any) {
            console.error('Tournament fetch error:', err);
            setError(err.message || 'Failed to load tournament details');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchBracket = async () => {
        if (!id) return;
        setLoadingBracket(true);
        setBracketError(null);
        try {
            const url = ENDPOINTS.GET_TOURNAMENT_STRUCTURE(id);
            console.log('Fetching bracket from:', url);
            const response = await authenticatedFetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch bracket: ${response.status}`);
            }
            const data = await response.json();
            setStages(data.stages || []);
        } catch (err) {
            console.error('Bracket fetch error:', err);
            setBracketError('Failed to load bracket structure');
        } finally {
            setLoadingBracket(false);
        }
    };

    const handleCreateBracket = async () => {
        if (!id) return;
        setIsCreatingBracket(true);
        try {
            const isGroupStage = tournament?.format === 5;

            const payload: any = {
                TournamentId: id,
                GroupsCount: isGroupStage ? (tournament.groupsCount || null) : null,
                QualifiersPerGroup: isGroupStage ? (tournament.qualifiersPerGroup || null) : null
            };

            const response = await authenticatedFetch(ENDPOINTS.CREATE_BRACKET, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                throw new Error(`Failed to create bracket: ${text}`);
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Success',
                message: 'Bracket created successfully!'
            });
            setShowStatusModal(true);
            fetchBracket(); // Refresh the bracket view
            fetchTournamentDetails(); // Refresh details to update status if needed
        } catch (err: any) {
            console.error('Create bracket error:', err);
            setStatusModalConfig({
                type: 'error',
                title: 'Error',
                message: err.message || 'Failed to create bracket'
            });
            setShowStatusModal(true);
        } finally {
            setIsCreatingBracket(false);
        }
    };

    const handleCloseRegistration = async () => {
        if (!id) return;
        setIsLoading(true); // Reuse main loading or add specific one
        try {
            const url = ENDPOINTS.CLOSE_REGISTRATION(id);
            const response = await authenticatedFetch(url, {
                method: 'POST'
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                throw new Error(`Failed to close registration: ${text}`);
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Success',
                message: 'Registration closed successfully!'
            });
            setShowStatusModal(true);
            fetchTournamentDetails(); // Refresh details
        } catch (err: any) {
            console.error('Close registration error:', err);
            setStatusModalConfig({
                type: 'error',
                title: 'Error',
                message: err.message || 'Failed to close registration'
            });
            setShowStatusModal(true);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPendingRegistrations = async () => {
        if (!id) return;
        setIsLoadingPending(true);
        try {
            const url = ENDPOINTS.GET_PENDING_REGISTRATIONS(id);
            const response = await authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch pending registrations');
            const data = await response.json();
            setPendingRegistrations(data.result || data || []);
        } catch (err) {
            console.error('Pending registrations fetch error:', err);
        } finally {
            setIsLoadingPending(false);
        }
    };

    const fetchParticipants = async () => {
        if (!id) return;
        setIsLoadingParticipants(true);
        try {
            const url = ENDPOINTS.GET_TOURNAMENT_PARTICIPANTS(id);
            const response = await authenticatedFetch(url);
            if (!response.ok) throw new Error('Failed to fetch participants');
            const data = await response.json();
            setParticipants(data.result || data || []);
        } catch (err) {
            console.error('Participants fetch error:', err);
        } finally {
            setIsLoadingParticipants(false);
        }
    };

    const handleApprove = async (registrationId: string) => {
        setProcessingId(registrationId);
        try {
            console.log(`[Approve] Sending ID: ${registrationId}`);
            const response = await authenticatedFetch(ENDPOINTS.APPROVE_REGISTRATION, {
                method: 'POST',
                // Try sending as a raw JSON string (quoted GUID)
                body: JSON.stringify(registrationId)
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                console.error(`[Approve] Fail ${response.status}:`, text);
                throw new Error(`Failed code ${response.status}: ${text}`);
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Approved',
                message: 'Registration approved!'
            });
            setShowStatusModal(true);
            fetchPendingRegistrations();
            fetchParticipants(); // Refresh participants list
            fetchTournamentDetails();
        } catch (err: any) {
            console.error('[Approve] Error:', err);
            setStatusModalConfig({
                type: 'error',
                title: 'Error',
                message: err.message || 'Failed to approve registration'
            });
            setShowStatusModal(true);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (registrationId: string) => {
        setProcessingId(registrationId);
        try {
            console.log(`[Reject] Sending ID: ${registrationId}`);
            const response = await authenticatedFetch(ENDPOINTS.REJECT_REGISTRATION, {
                method: 'POST',
                body: JSON.stringify(registrationId)
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                console.error(`[Reject] Fail ${response.status}:`, text);
                throw new Error(`Failed code ${response.status}: ${text}`);
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Rejected',
                message: 'Registration rejected.'
            });
            setShowStatusModal(true);
            fetchPendingRegistrations();
        } catch (err: any) {
            console.error('[Reject] Error:', err);
            setStatusModalConfig({
                type: 'error',
                title: 'Error',
                message: err.message || 'Failed to reject registration'
            });
            setShowStatusModal(true);
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveAll = async () => {
        if (pendingRegistrations.length === 0) return;

        setIsLoadingPending(true);
        try {
            const ids = pendingRegistrations.map((reg: any) => reg.Id || reg.id || reg.registrationId);
            const response = await authenticatedFetch(ENDPOINTS.APPROVE_ALL_REGISTRATIONS, {
                method: 'POST',
                body: JSON.stringify(ids)
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                throw new Error(`Failed to approve all: ${text}`);
            }

            setStatusModalConfig({
                type: 'success',
                title: 'Success',
                message: 'All registrations approved!'
            });
            setShowStatusModal(true);
            fetchPendingRegistrations();
            fetchParticipants();
            fetchTournamentDetails();
        } catch (err: any) {
            console.error('[ApproveAll] Error:', err);
            setStatusModalConfig({
                type: 'error',
                title: 'Error',
                message: err.message || 'Failed to approve all registrations'
            });
            setShowStatusModal(true);
        } finally {
            setIsLoadingPending(false);
        }
    };

    useEffect(() => {
        fetchTournamentDetails();
        fetchParticipants(); // Fetch participants on mount to check join status
    }, [id]);

    const handleMatchPress = (match: any) => {
        // Only allow reporting if match has participants and is not TBD
        if (!match.home || !match.away) return;

        // Only allow reporting if match status is 2 (In Progress/Live)
        if (match.status !== 2) return;

        setSelectedMatch(match);
        setShowReportModal(true);
    };

    useEffect(() => {
        if (activeTab === 'bracket') {
            fetchBracket();
        } else if (activeTab === 'registrations') {
            fetchPendingRegistrations();
        } else if (activeTab === 'players') {
            fetchParticipants();
        }
    }, [id, activeTab]);

    const tabs = [
        { label: 'Overview', value: 'overview' },
        { label: 'Bracket', value: 'bracket' },
        { label: 'Players', value: 'players' },
        ...(tournament?.createdBy?.toLowerCase() === user?.id?.toLowerCase() ? [{ label: 'Registrations', value: 'registrations' }] : []),
    ];

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return 'Open';
            case 1: return 'Upcoming';
            case 2: return 'Reg. Closed';
            case 3: return 'Live';
            case 4: return 'Completed';
            default: return 'IDLE';
        }
    };

    const renderStages = () => {
        if (stages.length === 0) {
            const creatorId = tournament?.createdBy;
            const isCreator = creatorId && user?.id && creatorId.toLowerCase() === user.id.toLowerCase();
            const isRegClosed = tournament?.status === 2;

            return (
                <View className="py-20 items-center justify-center px-6">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4 text-center">
                        {isCreator
                            ? (isRegClosed
                                ? "Registration is closed! You can now generate the bracket."
                                : "The bracket can be generated once registration is closed.")
                            : "Bracket not available yet"}
                    </Text>

                    {isCreator && isRegClosed && (
                        <Button
                            className="mt-6 w-full"
                            onPress={handleCreateBracket}
                            loading={isCreatingBracket}
                        >
                            Create Bracket
                        </Button>
                    )}
                </View>
            );
        }

        const currentStage = stages[selectedStageIndex];
        if (!currentStage) return null;

        return (
            <View key={currentStage.stageId || selectedStageIndex} className="mb-8">
                {stages.length > 1 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-4 mb-6"
                        contentContainerStyle={{ gap: 8 }}
                    >
                        {stages.map((stage, idx) => (
                            <Pressable
                                key={stage.stageId || idx}
                                onPress={() => {
                                    setSelectedStageIndex(idx);
                                    setSelectedGroupIndex(0); // Reset group on stage change
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-full border",
                                    selectedStageIndex === idx
                                        ? "bg-primary border-primary"
                                        : "bg-muted/10 border-border/10"
                                )}
                            >
                                <Text className={cn(
                                    "text-xs font-bold",
                                    selectedStageIndex === idx ? "text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {stage.name || `Stage ${idx + 1}`}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}


                {currentStage.rounds && currentStage.rounds.length > 0 ? (
                    <TournamentBracket
                        rounds={currentStage.rounds}
                        onMatchPress={handleMatchPress}
                        currentUserId={user?.id}
                        currentUsername={user?.username}
                        isAdmin={tournament?.createdBy === user?.id}
                    />
                ) : currentStage.groups && currentStage.groups.length > 0 ? (
                    <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="px-4 mb-6"
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {currentStage.groups.map((group: any, idx: number) => (
                                <Pressable
                                    key={group.groupId || idx}
                                    onPress={() => setSelectedGroupIndex(idx)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border",
                                        selectedGroupIndex === idx
                                            ? "bg-accent/20 border-accent/40"
                                            : "bg-muted/5 border-border/5"
                                    )}
                                >
                                    <Text className={cn(
                                        "text-xs font-bold",
                                        selectedGroupIndex === idx ? "text-accent" : "text-muted-foreground"
                                    )}>
                                        {group.name || `Group ${String.fromCharCode(65 + idx)}`}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>

                        {currentStage.groups[selectedGroupIndex] && (
                            <TournamentGroups
                                groups={[currentStage.groups[selectedGroupIndex]]}
                                onMatchPress={handleMatchPress}
                                currentUserId={user?.id}
                                currentUsername={user?.username}
                                isAdmin={tournament?.createdBy === user?.id}
                            />
                        )}
                    </View>
                ) : (
                    <View className="py-10 items-center justify-center">
                        <Text className="text-muted-foreground italic">No rounds or groups found for this stage</Text>
                    </View>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title="Tournament" showBack />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text className="text-muted-foreground mt-4">Loading tournament...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !tournament) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <PageHeader title="Tournament" showBack />
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text className="text-destructive mt-4 text-center font-medium">{error || 'Tournament not found'}</Text>
                    <Button onPress={fetchTournamentDetails} className="mt-6">Retry</Button>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <PageHeader
                title="Tournament"
                showBack
                rightElement={
                    tournament?.createdBy?.toLowerCase() === user?.id?.toLowerCase() ? (
                        <Pressable
                            onPress={() => setShowEditModal(true)}
                            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10"
                        >
                            <Ionicons name="settings-outline" size={20} color="#FAFAFA" />
                        </Pressable>
                    ) : null
                }
            />
            <ScrollView className="flex-1">
                <View className="animate-slide-up">
                    {/* Hero Section */}
                    <View className="px-4 py-6 bg-card border-b border-border/30">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-xl font-bold text-foreground">{tournament.name}</Text>

                            </View>
                            <View className="bg-primary/20 px-2 py-1 rounded">
                                <Text className="text-[10px] font-bold text-primary uppercase">{getStatusText(tournament.status)}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-6 mb-6">
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="people-outline" size={16} color="#71717A" />
                                <Text className="text-sm text-muted-foreground">{tournament.numberOfParticipants || 0} Participants</Text>
                            </View>
                            {/* Date removed as requested */}
                        </View>

                        {(() => {
                            const creatorId = tournament.createdBy || tournament.createdby || tournament.CreatedBy;
                            const isCreator = creatorId && user?.id && creatorId.toLowerCase() === user.id.toLowerCase();
                            const isParticipant = participants.some(p =>
                                (p.username || p.Username)?.toLowerCase() === user?.username?.toLowerCase()
                            );
                            const isOpenOrUpcoming = tournament.status === 0 || tournament.status === 1;
                            const isFull = tournament.maxPlayers > 0 && (tournament.numberOfParticipants || 0) >= tournament.maxPlayers;

                            const buttons = [];

                            if (isCreator && tournament.status === 1 && isFull) {
                                buttons.push(
                                    <Button
                                        key="close"
                                        className="w-full bg-red-600 mb-3"
                                        onPress={handleCloseRegistration}
                                    >
                                        Close Registration
                                    </Button>
                                );
                            }

                            if (!isParticipant && !isUserRegistered && isOpenOrUpcoming && !isFull) {
                                buttons.push(
                                    <Button
                                        key="join"
                                        className="w-full"
                                        onPress={handleJoin}
                                        loading={isRegistering}
                                    >
                                        Join Tournament
                                    </Button>
                                );
                            }

                            return buttons.length > 0 ? <View className="gap-3">{buttons}</View> : null;
                        })()}
                    </View>

                    <View className="px-4 py-4">
                        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    </View>

                    {activeTab === 'overview' && (
                        <View className="px-4 py-4 space-y-6 pb-12">
                            {/* Stats Grid */}
                            <View className="flex-row flex-wrap gap-3">
                                <View className="flex-1 min-w-[150px] bg-card p-4 rounded-2xl border border-border/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="w-8 h-8 rounded-full bg-accent/20 items-center justify-center">
                                            <Ionicons name="cash-outline" size={16} color="#10B981" />
                                        </View>
                                        <Text className="text-xs text-muted-foreground font-medium">Prize Pool</Text>
                                    </View>
                                    <Text className="text-lg font-bold text-foreground">
                                        {tournament.prize} {tournament.prizeCurrency === 1 ? 'EUR' : 'USD'}
                                    </Text>
                                </View>

                                <View className="flex-1 min-w-[150px] bg-card p-4 rounded-2xl border border-border/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
                                            <Ionicons name="people-outline" size={16} color="#10B981" />
                                        </View>
                                        <Text className="text-xs text-muted-foreground font-medium">Max Players</Text>
                                    </View>
                                    <Text className="text-lg font-bold text-foreground">
                                        {tournament.maxPlayers || 'No Limit'}
                                    </Text>
                                </View>

                                <View className="flex-1 min-w-[150px] bg-card p-4 rounded-2xl border border-border/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                                            <Ionicons name="calendar-outline" size={16} color="#3B82F6" />
                                        </View>
                                        <Text className="text-xs text-muted-foreground font-medium">Date</Text>
                                    </View>
                                    <Text className="text-sm font-bold text-foreground">
                                        {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                                    </Text>
                                </View>

                                <View className="flex-1 min-w-[150px] bg-card p-4 rounded-2xl border border-border/30">
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <View className="w-8 h-8 rounded-full bg-orange-500/10 items-center justify-center">
                                            <Ionicons name="globe-outline" size={16} color="#F97316" />
                                        </View>
                                        <Text className="text-xs text-muted-foreground font-medium">Region</Text>
                                    </View>
                                    <Text className="text-lg font-bold text-foreground uppercase">
                                        {tournament.region === TournamentRegion.Europe ? 'EU'
                                            : tournament.region === TournamentRegion.NorthAmerica ? 'NA'
                                                : tournament.region === TournamentRegion.Asia ? 'Asia'
                                                    : tournament.region === TournamentRegion.SouthAmerica ? 'SA'
                                                        : tournament.region === TournamentRegion.Africa ? 'AFR'
                                                            : tournament.region === TournamentRegion.Oceania ? 'OCE'
                                                                : 'Global'}
                                    </Text>
                                </View>

                                {tournament.registrationDeadline && (
                                    <View className="flex-1 min-w-[150px] bg-card p-4 rounded-2xl border border-border/30">
                                        <View className="flex-row items-center gap-2 mb-2">
                                            <View className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center">
                                                <Ionicons name="time-outline" size={16} color="#EF4444" />
                                            </View>
                                            <Text className="text-xs text-muted-foreground font-medium">Reg. Deadline</Text>
                                        </View>
                                        <Text className="text-sm font-bold text-foreground">
                                            {new Date(tournament.registrationDeadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Description Section */}
                            <View className="space-y-3 mt-4">
                                <Text className="text-sm font-bold text-foreground uppercase tracking-widest px-1">Description</Text>
                                <View className="bg-card/50 p-8 rounded-2xl border border-border/10">
                                    <Text className="text-muted-foreground leading-6">
                                        {tournament.description || 'Join this competitive tournament and prove your skills to climb the leaderboard.'}
                                    </Text>
                                </View>
                            </View>

                            {/* Rules Section */}
                            <View className="space-y-3 mt-8">
                                <Text className="text-sm font-bold text-foreground uppercase tracking-widest px-1">Rules & Regulations</Text>
                                <View className="bg-card/50 p-8 rounded-2xl border border-border/10">
                                    <Text className="text-muted-foreground leading-6">
                                        {tournament.rules || '• Fair play is mandatory\n• No toxic behavior\n• Tournament organizers\' decisions are final.'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'bracket' && (
                        <View className="py-2">
                            {loadingBracket ? (
                                <View className="py-20 items-center justify-center">
                                    <ActivityIndicator size="large" color="#10B981" />
                                    <Text className="text-muted-foreground mt-4">Loading structure...</Text>
                                </View>
                            ) : bracketError ? (
                                <View className="py-20 items-center justify-center px-4">
                                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                                    <Text className="text-destructive mt-4 text-center">{bracketError}</Text>
                                    <Button onPress={fetchBracket} variant="outline" size="sm" className="mt-4">
                                        Retry
                                    </Button>
                                </View>
                            ) : (
                                renderStages()
                            )}
                        </View>
                    )}

                    {activeTab === 'players' && (
                        <View className="px-4 py-2 space-y-3 pb-8">
                            {isLoadingParticipants ? (
                                <View className="py-20 items-center justify-center">
                                    <ActivityIndicator size="large" color="#10B981" />
                                </View>
                            ) : participants.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-muted-foreground">No players registered yet</Text>
                                </View>
                            ) : (
                                participants.map((participant: any, index: number) => (
                                    <Pressable
                                        key={index}
                                        onPress={() => {
                                            const uId = participant.id || participant.userId || participant.UserId;
                                            if (uId) {
                                                navigation.navigate('PlayerProfile', { id: uId });
                                            } else {
                                                console.warn('[TournamentDetails] Participant missing id:', participant);
                                            }
                                        }}
                                        className="flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/30"
                                        style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.7 : 1 })}
                                    >
                                        <Text className="w-6 text-center text-sm font-bold text-muted-foreground">
                                            {index + 1}
                                        </Text>
                                        <PlayerAvatar name={participant.username || participant.Username || participant.name || `Player ${index + 1}`} size="sm" className="w-10 h-10" />
                                        <Text className="font-bold text-foreground flex-1">{participant.username || participant.Username || participant.name || `Player ${index + 1}`}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#3F3F46" />
                                    </Pressable>
                                ))
                            )}
                        </View>
                    )}

                    {activeTab === 'registrations' && (
                        <View className="px-4 py-2 space-y-3 pb-8">
                            {isLoadingPending ? (
                                <View className="py-20 items-center justify-center">
                                    <ActivityIndicator size="large" color="#10B981" />
                                </View>
                            ) : pendingRegistrations.length === 0 ? (
                                <View className="py-10 items-center">
                                    <Text className="text-muted-foreground">No pending registrations</Text>
                                </View>
                            ) : (
                                <>
                                    <View className="mb-2">
                                        <Button
                                            onPress={handleApproveAll}
                                            loading={isLoadingPending}
                                            className="bg-primary/20 border border-primary/30"
                                        >
                                            <View className="flex-row items-center gap-2">
                                                <Ionicons name="checkmark-done" size={18} color="#10B981" />
                                                <Text className="text-primary font-bold">Approve All ({pendingRegistrations.length})</Text>
                                            </View>
                                        </Button>
                                    </View>

                                    {pendingRegistrations.map((reg: any, index: number) => (
                                        <View
                                            key={reg.Id || reg.id || reg.userId || reg.UserId || index}
                                            className="flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/30"
                                        >
                                            <Pressable
                                                onPress={() => {
                                                    const uId = reg.id || reg.UserId || reg.userId;
                                                    if (uId) {
                                                        navigation.navigate('PlayerProfile', { id: uId });
                                                    }
                                                }}
                                                className="flex-row items-center gap-4 flex-1"
                                                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                                            >
                                                <PlayerAvatar name={reg.username || reg.Username} size="sm" className="w-10 h-10" />
                                                <View className="flex-1">
                                                    <Text className="font-bold text-foreground">{reg.username || reg.Username}</Text>
                                                    <Text className="text-xs text-muted-foreground">Pending Approval</Text>
                                                </View>
                                            </Pressable>
                                            <View className="flex-row gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="px-3 border-destructive/50"
                                                    onPress={() => {
                                                        const rId = reg.Id || reg.id || reg.registrationId;
                                                        handleReject(rId);
                                                    }}
                                                    loading={processingId === (reg.Id || reg.id || reg.registrationId)}
                                                >
                                                    <Text className="text-destructive text-xs font-bold">Reject</Text>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="px-3 bg-primary"
                                                    onPress={() => {
                                                        const rId = reg.Id || reg.id || reg.registrationId;
                                                        handleApprove(rId);
                                                    }}
                                                    loading={processingId === (reg.Id || reg.id || reg.registrationId)}
                                                >
                                                    Accept
                                                </Button>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            <ReportResultModal
                visible={showReportModal}
                onClose={() => setShowReportModal(false)}
                matchId={selectedMatch?.id}
                tournamentId={id}
                home={selectedMatch?.home}
                away={selectedMatch?.away}
                onSuccess={() => {
                    fetchBracket(); // Refresh the bracket/league data
                    setStatusModalConfig({
                        type: 'success',
                        title: 'Result Reported',
                        message: 'Match result has been reported successfully!'
                    });
                    setShowStatusModal(true);
                }}
            />

            <StatusModal
                visible={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                type={statusModalConfig.type}
                title={statusModalConfig.title}
                message={statusModalConfig.message}
            />

            {tournament && (
                <EditTournamentModal
                    visible={showEditModal}
                    tournament={tournament}
                    onClose={() => setShowEditModal(false)}
                    onSaveSuccess={() => {
                        fetchTournamentDetails();
                        setStatusModalConfig({
                            type: 'success',
                            title: 'Updated',
                            message: 'Tournament details updated successfully!'
                        });
                        setShowStatusModal(true);
                    }}
                />
            )}
        </SafeAreaView>
    );
}
