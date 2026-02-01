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

// Generate hours from 00:00 to 23:00
const HOURS = Array.from({ length: 24 }, (_, i) => i);

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
    const [selectedDateIndex, setSelectedDateIndex] = useState(0);

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

    // Generate 7 days starting from today
    const days = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Array.from({ length: 7 }, (_, i) => {
            const date = addDays(today, i);
            return {
                date,
                label: formatDate(date, 'EEE'),
                fullLabel: formatDate(date, 'MMM d'),
                key: formatDate(date, 'yyyy-MM-dd'),
            };
        });
    }, []);

    const selectedDay = days[selectedDateIndex];

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
        // Convert slot IDs (e.g., "2024-01-23-14") to ISO Strings
        const dateTimeSlots = Array.from(selectedSlots).map(slot => {
            const parts = slot.split('-');
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            const hour = parts[3];
            return `${year}-${month}-${day}T${hour.padStart(2, '0')}:00:00`;
        });

        onSubmit(Array.from(selectedSlots), dateTimeSlots);
        setSubmitted(true);
    };

    const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

    const isOpponentAvailable = (dayKey: string, hour: number) => {
        return processedOpponentKeys.has(`${dayKey}-${hour}`);
    };

    return (
        <View className="space-y-4">
            {/* Header with Deadline */}
            <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                <Text className="text-sm text-slate-400 font-medium">Deadline: {deadline}</Text>
            </View>

            <Text className="text-sm text-slate-300">
                Pick dates and times when you can play vs{' '}
                <Text className="font-bold text-primary">{opponentName}</Text>
            </Text>

            {/* Date Tabs */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {days.map((day, index) => {
                        const isSelected = selectedDateIndex === index;
                        const hasSelectedSlots = Array.from(selectedSlots).some(s => s.startsWith(day.key));
                        const hasOpponentSlots = Array.from(processedOpponentKeys).some(s => s.startsWith(day.key));

                        return (
                            <Pressable
                                key={day.key}
                                onPress={() => setSelectedDateIndex(index)}
                                className={cn(
                                    "mr-2 px-4 py-3 rounded-2xl items-center min-w-[80px] border",
                                    isSelected
                                        ? "bg-primary border-primary"
                                        : "bg-slate-800/40 border-slate-700/50"
                                )}
                            >
                                <Text className={cn(
                                    "text-xs font-bold uppercase tracking-tight",
                                    isSelected ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {day.label}
                                </Text>
                                <Text className={cn(
                                    "text-[10px] mt-1",
                                    isSelected ? "text-slate-900/70" : "text-slate-500"
                                )}>
                                    {day.fullLabel}
                                </Text>
                                <View className="absolute top-1 right-1 flex-row gap-0.5">
                                    {!isSelected && hasSelectedSlots && (
                                        <View className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                    {!isSelected && hasOpponentSlots && (
                                        <View className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    )}
                                </View>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Hourly List for Selected Date */}
            <View className="bg-slate-900/50 rounded-3xl border border-slate-800/50 p-2 max-h-80">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="flex-row flex-wrap justify-between p-1">
                        {HOURS.map((hour) => {
                            const dayKey = selectedDay.key;
                            const slotId = `${dayKey}-${hour}`;
                            const isSelected = selectedSlots.has(slotId);
                            const opponentAvail = isOpponentAvailable(dayKey, hour);
                            const isMutual = isSelected && opponentAvail;

                            return (
                                <Pressable
                                    key={slotId}
                                    onPress={() => toggleSlot(dayKey, hour)}
                                    disabled={submitted}
                                    className={cn(
                                        "w-[23%] h-12 mb-2 rounded-xl items-center justify-center border",
                                        isMutual
                                            ? "bg-primary border-primary"
                                            : isSelected
                                                ? "bg-primary/20 border-primary"
                                                : opponentAvail
                                                    ? "bg-indigo-500/10 border-indigo-500/30"
                                                    : "bg-slate-800/30 border-slate-700/30",
                                        submitted && "opacity-50"
                                    )}
                                >
                                    {isMutual ? (
                                        <View className="items-center justify-center">
                                            <Ionicons name="checkmark-done" size={16} color="#0F172A" />
                                            <Text className="text-[10px] text-slate-900 uppercase font-black tracking-tighter -mt-0.5">
                                                Mutual
                                            </Text>
                                        </View>
                                    ) : (
                                        <>
                                            <View className="flex-row items-center justify-center gap-1">
                                                <Text className={cn(
                                                    "text-xs font-bold",
                                                    isSelected ? "text-primary" : opponentAvail ? "text-indigo-400" : "text-slate-300"
                                                )}>
                                                    {formatHour(hour)}
                                                </Text>
                                                {isSelected && (
                                                    <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                                                )}
                                            </View>
                                            {opponentAvail && (
                                                <Text className="text-[9px] text-indigo-400/80 absolute bottom-1 uppercase font-bold tracking-tighter">
                                                    Available
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </View >

            {/* Legend */}
            < View className="flex-row items-center justify-center gap-3 py-1 flex-wrap" >
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary" />
                    <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Your Choice</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 border border-indigo-500/30" />
                    <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Opponent</Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <Text className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">Mutual Slot</Text>
                </View>
            </View >

            {/* Action Button */}
            {
                !submitted ? (
                    <Button
                        onPress={handleSubmit}
                        disabled={selectedSlots.size === 0}
                        className={cn(
                            "w-full h-14 rounded-2xl shadow-lg",
                            selectedSlots.size > 0 ? "bg-primary" : "bg-slate-700"
                        )}
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="send" size={18} color={selectedSlots.size > 0 ? "#0F172A" : "#64748B"} />
                            <Text className={cn(
                                "font-black text-base uppercase tracking-wider",
                                selectedSlots.size > 0 ? "text-slate-900" : "text-slate-500"
                            )}>
                                Confirm Availability ({selectedSlots.size})
                            </Text>
                        </View>
                    </Button>
                ) : (
                    <View className="py-4 rounded-3xl bg-primary/10 border border-primary/20 items-center justify-center">
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text className="text-primary font-bold mt-1 uppercase tracking-tight">Slots Submitted Successfully</Text>
                        <Text className="text-xs text-slate-400 mt-1">Waiting for {opponentName} to confirm</Text>
                        <Pressable
                            onPress={() => setSubmitted(false)}
                            className="mt-3 bg-primary/20 px-4 py-2 rounded-xl border border-primary/30"
                        >
                            <Text className="text-xs font-bold text-primary uppercase tracking-tight">Edit Slots</Text>
                        </Pressable>
                    </View>
                )
            }
        </View >
    );
}
