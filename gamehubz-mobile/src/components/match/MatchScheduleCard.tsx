import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { HourlyAvailabilityPicker } from './HourlyAvailabilityPicker';
import { MatchReadyButton } from './MatchReadyButton';
import { cn } from '../../lib/utils';
import { authenticatedFetch, ENDPOINTS } from '../../lib/api';

type MatchStatus = 'pending_availability' | 'scheduled' | 'ready_phase' | 'completed';

interface MatchScheduleCardProps {
    matchId: string;
    tournamentName: string;
    roundName: string;
    opponentName: string;
    status: MatchStatus;
    deadline?: string;
    scheduledTime?: string;
    opponentAvailability?: string[];
    opponentReady?: boolean;
    onPress?: () => void;
}

export function MatchScheduleCard({
    matchId,
    tournamentName,
    roundName,
    opponentName,
    status: initialStatus,
    deadline = 'Jan 22, 2024',
    scheduledTime: initialScheduledTime,
    opponentAvailability = [],
    opponentReady = false,
    onPress,
}: MatchScheduleCardProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<MatchStatus>(initialStatus);
    const [matchTime, setMatchTime] = useState(initialScheduledTime);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAvailabilitySubmit = async (slots: string[], dateTimeSlots: string[]) => {
        try {
            setIsSubmitting(true);
            const response = await authenticatedFetch(ENDPOINTS.SUBMIT_MATCH_AVAILABILITY, {
                method: 'POST',
                body: JSON.stringify({
                    matchId: matchId,
                    selectedSlots: dateTimeSlots,
                }),
            });

            if (response.ok) {
                const result = await response.json();

                // Check if match was scheduled (both players submitted)
                if (result.data?.confirmedTime) {
                    const confirmedDate = new Date(result.data.confirmedTime);
                    setMatchTime(confirmedDate.toLocaleString());
                    setCurrentStatus('scheduled');
                } else {
                    // Availability saved, waiting for opponent
                    console.log(result.message || 'Availability saved');
                }
            }
        } catch (error) {
            console.error('Error submitting availability:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReady = () => {
        console.log('Player ready for match:', matchId);
    };

    const getStatusContent = () => {
        switch (currentStatus) {
            case 'pending_availability':
                return (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar-outline" size={16} color="hsl(185, 75%, 45%)" />
                        <Text className="text-sm text-muted-foreground">Set your availability</Text>
                    </View>
                );
            case 'scheduled':
                return (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="time-outline" size={16} color="hsl(45, 90%, 55%)" />
                        <Text className="text-sm font-medium text-accent">{matchTime}</Text>
                    </View>
                );
            case 'ready_phase':
                return (
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="people-outline" size={16} color="hsl(185, 75%, 45%)" />
                        <Text className="text-sm font-medium text-primary">Ready check active</Text>
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
                    "mb-3",
                    currentStatus === 'ready_phase' && "border-primary/50"
                )}
            >
                <View className="space-y-2">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-semibold text-foreground">{tournamentName}</Text>
                        <View className="bg-secondary px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-muted-foreground">{roundName}</Text>
                        </View>
                    </View>
                    <Text className="text-sm text-foreground">
                        vs <Text className="font-semibold">{opponentName}</Text>
                    </Text>
                    {getStatusContent()}
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
                                    opponentAvailability={opponentAvailability}
                                    onSubmit={handleAvailabilitySubmit}
                                />
                            )}

                            {(currentStatus === 'scheduled' || currentStatus === 'ready_phase') && matchTime && (
                                <MatchReadyButton
                                    matchId={matchId}
                                    scheduledTime={matchTime}
                                    opponentName={opponentName}
                                    opponentReady={opponentReady}
                                    onReady={handleReady}
                                />
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
