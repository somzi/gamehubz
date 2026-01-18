import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useFocusEffect } from '@react-navigation/native';
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

type TournamentDetailsRouteProp = RouteProp<RootStackParamList, 'TournamentDetails'>;

export default function TournamentDetailsScreen() {
    const route = useRoute<TournamentDetailsRouteProp>();
    const { id } = route.params;
    const [activeTab, setActiveTab] = useState('overview');
    const [tournament, setTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stages, setStages] = useState<any[]>([]);
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

            alert('Successfully joined the tournament!');
            fetchTournamentDetails(); // Refresh details
        } catch (err: any) {
            console.error('Join error:', err);
            alert(err.message || 'An error occurred while joining');
        } finally {
            setIsRegistering(false);
        }
    };

    const fetchTournamentDetails = async () => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            const url = ENDPOINTS.GET_TOURNAMENT(id);
            const response = await authenticatedFetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch tournament: ${response.status}`);
            }
            const data = await response.json();
            const tournamentData = data.result || data;
            setTournament(tournamentData);
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
            const url = ENDPOINTS.CREATE_BRACKET(id);
            const response = await authenticatedFetch(url, {
                method: 'POST'
            });

            if (!response.ok) {
                const text = await response.text().catch(() => 'No response body');
                throw new Error(`Failed to create bracket: ${text}`);
            }

            alert('Bracket created successfully!');
            fetchBracket(); // Refresh the bracket view
            fetchTournamentDetails(); // Refresh details to update status if needed
        } catch (err: any) {
            console.error('Create bracket error:', err);
            alert(err.message || 'Failed to create bracket');
        } finally {
            setIsCreatingBracket(false);
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

            alert('Registration approved!');
            fetchPendingRegistrations();
            fetchParticipants(); // Refresh participants list
            fetchTournamentDetails();
        } catch (err: any) {
            console.error('[Approve] Error:', err);
            alert(err.message || 'Failed to approve registration');
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

            alert('Registration rejected.');
            fetchPendingRegistrations();
        } catch (err: any) {
            console.error('[Reject] Error:', err);
            alert(err.message || 'Failed to reject registration');
        } finally {
            setProcessingId(null);
        }
    };

    useEffect(() => {
        fetchTournamentDetails();
        fetchParticipants(); // Fetch participants on mount to check join status
    }, [id]);

    const handleMatchPress = (match: any) => {
        // Only allow reporting if match has participants and is not TBD
        if (!match.home || !match.away) return;

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
        { label: 'Bracket / League', value: 'bracket' },
        { label: 'Players', value: 'players' },
        ...(tournament?.createdBy === user?.id ? [{ label: 'Registrations', value: 'registrations' }] : []),
    ];

    const getStatusText = (status: number) => {
        switch (status) {
            case 0: return 'Open';
            case 1: return 'Upcoming';
            case 2: return 'Live';
            case 3: return 'Completed';
            default: return 'IDLE';
        }
    };

    const renderStages = () => {
        if (stages.length === 0) {
            const isCreator = tournament?.createdBy === user?.id;
            const isFull = participants.length > 0 && participants.length === tournament?.maxPlayers;

            return (
                <View className="py-20 items-center justify-center px-6">
                    <Ionicons name="trophy-outline" size={48} color="#71717A" />
                    <Text className="text-muted-foreground mt-4 text-center">
                        {isCreator
                            ? (isFull
                                ? "Tournament is full! You can now generate the bracket."
                                : "Waiting for more participants to join before generating the bracket.")
                            : "Bracket not available yet"}
                    </Text>

                    {isCreator && isFull && (
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

        return stages.map((stage, index) => (
            <View key={stage.stageId || index} className="mb-8">
                {stages.length > 1 && (
                    <View className="px-4 py-2 bg-muted/20 border-y border-border/10 mb-4">
                        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Stage {index + 1}: {stage.name}
                        </Text>
                    </View>
                )}

                <View className="px-4 mb-2 flex-row items-center gap-2">
                    <Ionicons name="information-circle-outline" size={14} color="#71717A" />
                    <Text className="text-[12px] text-muted-foreground italic">
                        Tip: Tap on a match to report the result.
                    </Text>
                </View>

                {stage.rounds && stage.rounds.length > 0 ? (
                    <TournamentBracket
                        rounds={stage.rounds}
                        onMatchPress={handleMatchPress}
                        currentUserId={user?.id || (user as any)?.Id}
                        currentUsername={user?.username}
                        isAdmin={(() => {
                            const ownerId = tournament?.createdBy || tournament?.CreatedBy;
                            const userId = user?.id || (user as any)?.Id;
                            return !!ownerId && !!userId && ownerId === userId;
                        })()}
                    />
                ) : stage.groups && stage.groups.length > 0 ? (
                    <TournamentGroups
                        groups={stage.groups}
                        onMatchPress={handleMatchPress}
                        currentUserId={user?.id || (user as any)?.Id}
                        currentUsername={user?.username}
                        isAdmin={(() => {
                            const ownerId = tournament?.createdBy || tournament?.CreatedBy;
                            const userId = user?.id || (user as any)?.Id;
                            return !!ownerId && !!userId && ownerId === userId;
                        })()}
                    />
                ) : (
                    <View className="py-10 items-center justify-center">
                        <Text className="text-muted-foreground italic">No rounds or groups found for this stage</Text>
                    </View>
                )}
            </View>
        ));
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
            <PageHeader title="Tournament" showBack />
            <ScrollView className="flex-1">
                <View className="animate-slide-up">
                    {/* Hero Section */}
                    <View className="px-4 py-6 bg-card border-b border-border/30">
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-xl font-bold text-foreground">{tournament.name}</Text>
                                <Text className="text-sm text-muted-foreground mt-1 leading-5">
                                    {tournament.description || 'No description provided.'}
                                </Text>
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
                            <View className="flex-row items-center gap-2">
                                <Ionicons name="calendar-outline" size={16} color="#71717A" />
                                <Text className="text-sm text-muted-foreground">
                                    {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : 'TBD'}
                                </Text>
                            </View>
                        </View>

                        {(() => {
                            const isCreator = tournament.createdBy === user?.id;
                            const isParticipant = participants.some(p =>
                                (p.username || p.Username)?.toLowerCase() === user?.username?.toLowerCase()
                            );
                            const isOpenOrUpcoming = tournament.status === 0 || tournament.status === 1;

                            if (isCreator || isParticipant || !isOpenOrUpcoming) return null;

                            return (
                                <Button
                                    className="w-full"
                                    onPress={handleJoin}
                                    loading={isRegistering}
                                >
                                    Join Tournament
                                </Button>
                            );
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
                                        {tournament.region === 1 ? 'EU' : tournament.region === 2 ? 'NA' : 'Global'}
                                    </Text>
                                </View>
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
                                    <View
                                        key={index}
                                        className="flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/30"
                                    >
                                        <Text className="w-6 text-center text-sm font-bold text-muted-foreground">
                                            {index + 1}
                                        </Text>
                                        <PlayerAvatar name={participant.username || participant.Username || `Player ${index + 1}`} size="sm" className="w-10 h-10" />
                                        <Text className="font-bold text-foreground flex-1">{participant.username || participant.Username || `Player ${index + 1}`}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#3F3F46" />
                                    </View>
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
                                pendingRegistrations.map((reg: any, index: number) => (
                                    <View
                                        key={reg.Id || reg.id || reg.userId || index}
                                        className="flex-row items-center gap-4 p-4 rounded-xl bg-card border border-border/30"
                                    >
                                        <PlayerAvatar name={reg.username || reg.Username} size="sm" className="w-10 h-10" />
                                        <View className="flex-1">
                                            <Text className="font-bold text-foreground">{reg.username || reg.Username}</Text>
                                            <Text className="text-xs text-muted-foreground">Pending Approval</Text>
                                        </View>
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
                                ))
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
                    alert('Result reported successfully!');
                }}
            />
        </SafeAreaView>
    );
}
