import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { HourlyAvailabilityPicker } from './HourlyAvailabilityPicker';
import { Button } from '../ui/Button';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';
import { authenticatedFetch, ENDPOINTS } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

type MatchStatus = 'pending_availability' | 'scheduled' | 'ready_phase' | 'completed';

interface MatchScheduleCardProps {
    matchId: string;
    tournamentId: string;
    tournamentName: string;
    roundName: string;
    opponentName: string;
    status: MatchStatus;
    deadline?: string;
    scheduledTime?: string;
    opponentAvailability?: string[];
    onMatchUpdate?: () => void;
    onPress?: () => void;
}

export function MatchScheduleCard({
    matchId,
    tournamentId,
    tournamentName,
    roundName,
    opponentName,
    status: initialStatus,
    deadline = 'Jan 22, 2024',
    scheduledTime: initialScheduledTime,
    opponentAvailability: initialOpponentAvailability = [],
    onMatchUpdate,
    onPress,
}: MatchScheduleCardProps) {
    const { user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<MatchStatus>(initialStatus);
    const [matchTime, setMatchTime] = useState(initialScheduledTime);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Slots state
    const [mySlots, setMySlots] = useState<string[]>([]);
    const [opponentSlots, setOpponentSlots] = useState<string[]>(initialOpponentAvailability);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

    // Result reporting state
    const [homeScore, setHomeScore] = useState('');
    const [awayScore, setAwayScore] = useState('');
    const [error, setError] = useState<string | null>(null);

    const fetchAvailability = async () => {
        if (!user?.id || !matchId) return;
        setIsLoadingAvailability(true);
        try {
            const response = await authenticatedFetch(ENDPOINTS.GET_MATCH_AVAILABILITY(matchId, user.id));
            if (response.ok) {
                const data = await response.json();
                if (data.mySlots) setMySlots(data.mySlots);
                if (data.opponentSlots) setOpponentSlots(data.opponentSlots);
                if (data.confirmedTime) {
                    const confirmedDate = new Date(data.confirmedTime);
                    setMatchTime(confirmedDate.toLocaleString());
                    setCurrentStatus('scheduled');
                }
            }
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    // Fetch availability when modal opens
    React.useEffect(() => {
        if (modalVisible && currentStatus === 'pending_availability') {
            fetchAvailability();
        }
    }, [modalVisible, currentStatus, matchId]);

    const handleAvailabilitySubmit = async (slots: string[], dateTimeSlots: string[]) => {
        try {
            setIsSubmitting(true);
            if (!matchId) return;

            const payload = {
                matchId: matchId,
                selectedSlots: dateTimeSlots,
            };

            const response = await authenticatedFetch(ENDPOINTS.SUBMIT_MATCH_AVAILABILITY, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();

                // Check if match was scheduled
                if (result.data?.confirmedTime) {
                    const confirmedDate = new Date(result.data.confirmedTime);
                    setMatchTime(confirmedDate.toLocaleString());
                    setCurrentStatus('scheduled');
                }

                // Notify parent to refresh immediately
                if (onMatchUpdate) {
                    onMatchUpdate();
                }
            }
        } catch (error) {
            console.error('Error submitting availability:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitResult = async () => {
        console.log('[MatchScheduleCard] handleSubmitResult called');
        console.log('[MatchScheduleCard] matchId:', matchId);
        console.log('[MatchScheduleCard] tournamentId:', tournamentId);
        console.log('[MatchScheduleCard] homeScore:', homeScore);
        console.log('[MatchScheduleCard] awayScore:', awayScore);

        if (!matchId || !tournamentId) {
            console.log('[MatchScheduleCard] Missing matchId or tournamentId');
            return;
        }
        if (homeScore === '' || awayScore === '') {
            console.log('[MatchScheduleCard] Missing scores');
            setError('Please enter scores for both players');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                MatchId: matchId,
                HomeScore: parseInt(homeScore, 10),
                AwayScore: parseInt(awayScore, 10),
                TournamentId: tournamentId
            };

            console.log('[MatchScheduleCard] Payload:', JSON.stringify(payload));
            console.log('[MatchScheduleCard] Calling API:', ENDPOINTS.REPORT_MATCH_RESULT);

            const response = await authenticatedFetch(ENDPOINTS.REPORT_MATCH_RESULT, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            console.log('[MatchScheduleCard] Response status:', response.status);

            if (!response.ok) {
                const text = await response.text().catch(() => 'No body');
                console.log('[MatchScheduleCard] Error response:', text);
                throw new Error(`Failed to report result: ${text}`);
            }

            console.log('[MatchScheduleCard] Success! Closing modal and refreshing');
            // Success - close modal and refresh
            setModalVisible(false);
            if (onMatchUpdate) {
                onMatchUpdate();
            }
        } catch (err: any) {
            console.error('[MatchScheduleCard] Report result error:', err);
            setError(err.message || 'An error occurred while reporting result');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusContent = () => {
        switch (currentStatus) {
            case 'pending_availability':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-yellow-500/10 self-start px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
                        <Ionicons name="calendar-outline" size={14} color="#EAB308" />
                        <Text className="text-[12px] font-bold text-yellow-500 uppercase tracking-tight">Set Availability</Text>
                    </View>
                );
            case 'scheduled':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-primary/10 self-start px-2.5 py-1.5 rounded-lg border border-primary/20">
                        <Ionicons name="time-outline" size={14} color="#10B981" />
                        <Text className="text-[12px] font-bold text-primary uppercase tracking-tight">{matchTime}</Text>
                    </View>
                );
            case 'ready_phase':
                return (
                    <View className="flex-row items-center gap-2 mt-2 bg-indigo-500/10 self-start px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                        <Ionicons name="flash-outline" size={14} color="#6366F1" />
                        <Text className="text-[12px] font-bold text-indigo-500 uppercase tracking-tight">Ready Check</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Card
                onPress={() => setModalVisible(true)}
                className={cn(
                    "mb-2",
                    currentStatus === 'ready_phase' && "border-indigo-500/30"
                )}
            >
                <View className="flex-row items-center gap-4">
                    <View className={cn(
                        "w-12 h-12 rounded-2xl items-center justify-center",
                        currentStatus === 'pending_availability' ? "bg-yellow-500/10" :
                            currentStatus === 'scheduled' ? "bg-primary/10" : "bg-indigo-500/10"
                    )}>
                        <Ionicons
                            name={currentStatus === 'pending_availability' ? "alert-circle" : "game-controller"}
                            size={24}
                            color={currentStatus === 'pending_availability' ? "#EAB308" :
                                currentStatus === 'scheduled' ? "#10B981" : "#6366F1"}
                        />
                    </View>

                    <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider">{tournamentName}</Text>
                            <Text className="text-[10px] font-medium text-slate-500">{roundName}</Text>
                        </View>
                        <Text className="text-lg font-bold text-white mt-0.5" numberOfLines={1}>
                            vs {opponentName}
                        </Text>
                        {getStatusContent()}
                    </View>
                </View>
            </Card>

            {/* Modal for scheduling / ready check */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-card rounded-t-3xl border-t border-border/50 p-6 max-h-[90%]">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="text-lg font-bold text-foreground">
                                    {tournamentName}
                                </Text>
                                <Text className="text-sm text-muted-foreground">{roundName}</Text>
                            </View>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className="w-8 h-8 rounded-full bg-secondary items-center justify-center"
                            >
                                <Ionicons name="close" size={20} color="hsl(220, 15%, 55%)" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {currentStatus === 'pending_availability' && (
                                <HourlyAvailabilityPicker
                                    matchId={matchId}
                                    deadline={deadline}
                                    opponentName={opponentName}
                                    opponentAvailability={opponentSlots}
                                    initialSlots={mySlots}
                                    onSubmit={handleAvailabilitySubmit}
                                />
                            )}

                            {(currentStatus === 'scheduled' || currentStatus === 'ready_phase') && matchTime && (
                                <View className="space-y-4">
                                    {/* Match Info */}
                                    <View className="items-center mb-2">
                                        <Text className="text-sm text-muted-foreground">Match Time</Text>
                                        <Text className="text-lg font-bold text-primary mt-1">{matchTime}</Text>
                                    </View>

                                    {/* Error Message */}
                                    {error && (
                                        <View className="bg-destructive/10 p-4 rounded-2xl mb-2">
                                            <Text className="text-destructive text-sm text-center font-medium">{error}</Text>
                                        </View>
                                    )}

                                    {/* Players and Score Inputs */}
                                    <View className="flex-row items-center justify-between gap-4">
                                        {/* Home Player (You) */}
                                        <View className="flex-1 items-center gap-3">
                                            <PlayerAvatar name={user?.username || 'You'} size="lg" />
                                            <Text className="text-sm font-bold text-foreground text-center" numberOfLines={1}>
                                                {user?.username || 'You'}
                                            </Text>
                                            <TextInput
                                                className="bg-muted/30 w-full h-12 rounded-xl text-center text-lg font-bold text-foreground border border-border/10"
                                                placeholder="0"
                                                placeholderTextColor="#71717A"
                                                keyboardType="numeric"
                                                value={homeScore}
                                                onChangeText={(val) => setHomeScore(val.replace(/[^0-9]/g, ''))}
                                            />
                                        </View>

                                        <Text className="text-2xl font-bold text-muted-foreground mt-12">VS</Text>

                                        {/* Away Player (Opponent) */}
                                        <View className="flex-1 items-center gap-3">
                                            <PlayerAvatar name={opponentName} size="lg" />
                                            <Text className="text-sm font-bold text-foreground text-center" numberOfLines={1}>
                                                {opponentName}
                                            </Text>
                                            <TextInput
                                                className="bg-muted/30 w-full h-12 rounded-xl text-center text-lg font-bold text-foreground border border-border/10"
                                                placeholder="0"
                                                placeholderTextColor="#71717A"
                                                keyboardType="numeric"
                                                value={awayScore}
                                                onChangeText={(val) => setAwayScore(val.replace(/[^0-9]/g, ''))}
                                            />
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="mt-6 flex-row gap-3">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onPress={() => {
                                                setHomeScore('');
                                                setAwayScore('');
                                                setError(null);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onPress={handleSubmitResult}
                                            loading={isSubmitting}
                                        >
                                            Submit Result
                                        </Button>
                                    </View>
                                </View>
                            )}

                            {currentStatus === 'completed' && (
                                <View className="py-6 items-center">
                                    <Ionicons name="checkmark-circle" size={48} color="hsl(220, 15%, 55%)" />
                                    <Text className="text-muted-foreground mt-2">Match completed</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
