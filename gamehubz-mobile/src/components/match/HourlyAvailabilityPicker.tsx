import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

interface HourlyAvailabilityPickerProps {
    matchId: string;
    deadline: string;
    opponentName: string;
    opponentAvailability?: string[];
    initialSlots?: string[];
    onSubmit: (selectedSlots: string[], dateTimeSlots: string[]) => void | Promise<void>;
}

const HOURS = [10, 12, 14, 16, 18, 20, 22]; // 10am to 10pm, every 2 hours

const formatDate = (date: Date, format: string) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (format === 'EEE') return days[date.getDay()];
    if (format === 'MMM d') return `${months[date.getMonth()]} ${date.getDate()}`;
    if (format === 'yyyy-MM-dd') {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return '';
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export function HourlyAvailabilityPicker({
    matchId,
    deadline,
    opponentName,
    opponentAvailability = [],
    initialSlots = [],
    onSubmit,
}: HourlyAvailabilityPickerProps) {
    // Convert initial ISO strings back to keys (e.g. "2024-01-23-14")
    const initialKeys = useMemo(() => {
        return new Set((initialSlots || []).map(iso => {
            if (!iso) return '';
            try {
                const [datePart, timePart] = iso.split('T');
                const [hourStr] = timePart.split(':');
                const hour = parseInt(hourStr, 10);
                return `${datePart}-${hour}`;
            } catch (e) {
                console.error('Error parsing slot:', iso, e);
                return '';
            }
        }).filter(Boolean));
    }, [initialSlots]);

    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(initialKeys);
    const [submitted, setSubmitted] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);

    // Sync state when props change
    useEffect(() => {
        setSelectedSlots(initialKeys);
    }, [initialKeys]);

    // Process opponent availability keys
    const processedOpponentKeys = useMemo(() => {
        return new Set((opponentAvailability || []).map(iso => {
            if (!iso) return '';
            try {
                const [datePart, timePart] = iso.split('T');
                const [hourStr] = timePart.split(':');
                const hour = parseInt(hourStr, 10);
                return `${datePart}-${hour}`;
            } catch (e) {
                console.error('Error parsing opponent slot:', iso, e);
                return '';
            }
        }).filter(Boolean));
    }, [opponentAvailability]);

    // Generate 5 days starting from today + weekOffset
    const days = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startDate = addDays(today, weekOffset * 5);
        return Array.from({ length: 5 }, (_, i) => {
            const date = addDays(startDate, i);
            return {
                date,
                label: formatDate(date, 'EEE'),
                fullLabel: formatDate(date, 'MMM d'),
                key: formatDate(date, 'yyyy-MM-dd'),
            };
        });
    }, [weekOffset]);

    const toggleSlot = (dayKey: string, hour: number) => {
        if (submitted) return;
        const slotId = `${dayKey}-${hour}`;
        setSelectedSlots((prev) => {
            const next = new Set(prev);
            if (next.has(slotId)) {
                next.delete(slotId);
            } else {
                next.add(slotId);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        // Convert slot IDs (e.g., "2024-01-23-14") to DateTime objects
        const dateTimeSlots = Array.from(selectedSlots).map(slot => {
            const [year, month, day, hour] = slot.split('-');
            // Create ISO 8601 datetime string
            return `${year}-${month}-${day}T${hour.padStart(2, '0')}:00:00`;
        });

        onSubmit(Array.from(selectedSlots), dateTimeSlots);
        setSubmitted(true);
    };

    const formatHour = (hour: number) => `${hour}:00`;

    const isOpponentAvailable = (dayKey: string, hour: number) => {
        return processedOpponentKeys.has(`${dayKey}-${hour}`);
    };

    return (
        <View className="space-y-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar-outline" size={16} color="hsl(220, 15%, 55%)" />
                    <Text className="text-sm text-muted-foreground">Deadline: {deadline}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Pressable
                        onPress={() => setWeekOffset((w) => Math.max(0, w - 1))}
                        disabled={weekOffset === 0 || submitted}
                        className="w-7 h-7 items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={16} color="hsl(220, 15%, 55%)" />
                    </Pressable>
                    <Pressable
                        onPress={() => setWeekOffset((w) => w + 1)}
                        disabled={submitted}
                        className="w-7 h-7 items-center justify-center"
                    >
                        <Ionicons name="chevron-forward" size={16} color="hsl(220, 15%, 55%)" />
                    </Pressable>
                </View>
            </View>

            <Text className="text-sm text-foreground">
                Tap times you're available to play{' '}
                <Text className="font-semibold text-primary">{opponentName}</Text>
            </Text>

            {/* Hourly Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    {/* Day Headers */}
                    <View className="flex-row mb-2">
                        <View className="w-12" />
                        {days.map((day) => (
                            <View key={day.key} className="w-14 items-center">
                                <Text className="text-xs font-medium text-foreground">{day.label}</Text>
                                <Text className="text-[10px] text-muted-foreground">{day.fullLabel}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Time Slots */}
                    {HOURS.map((hour) => (
                        <View key={hour} className="flex-row mb-1">
                            <View className="w-12 items-end justify-center pr-2">
                                <Text className="text-[10px] text-muted-foreground">{formatHour(hour)}</Text>
                            </View>
                            {days.map((day) => {
                                const slotId = `${day.key}-${hour}`;
                                const isSelected = selectedSlots.has(slotId);
                                const opponentAvail = isOpponentAvailable(day.key, hour);

                                return (
                                    <Pressable
                                        key={slotId}
                                        onPress={() => toggleSlot(day.key, hour)}
                                        disabled={submitted}
                                        className={cn(
                                            'w-14 h-8 mx-0.5 rounded-md items-center justify-center border',
                                            isSelected
                                                ? 'bg-primary border-primary'
                                                : 'bg-secondary/50 border-border/30',
                                            opponentAvail && !isSelected && 'border-accent/50',
                                            submitted && 'opacity-70'
                                        )}
                                    >
                                        {isSelected && (
                                            <Ionicons name="checkmark" size={14} color="hsl(222, 47%, 6%)" />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {opponentAvailability.length > 0 && (
                <View className="flex-row items-center gap-1">
                    <Ionicons name="checkmark" size={12} color="hsl(45, 90%, 55%)" />
                    <Text className="text-xs text-accent">Highlighted borders = opponent available</Text>
                </View>
            )}

            {!submitted ? (
                <Button
                    onPress={handleSubmit}
                    disabled={selectedSlots.size === 0}
                    className="w-full bg-accent"
                >
                    <Text className="font-semibold text-accent-foreground">
                        Confirm Availability ({selectedSlots.size} slots)
                    </Text>
                </Button>
            ) : (
                <View className="py-3 rounded-xl bg-primary/10 border border-primary/20 items-center">
                    <Ionicons name="checkmark-circle" size={20} color="hsl(185, 75%, 45%)" />
                    <Text className="text-sm font-medium text-primary mt-1">Availability Submitted</Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                        Waiting for {opponentName} to submit theirs
                    </Text>
                </View>
            )}
        </View>
    );
}
