import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { cn } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';

interface TournamentCardProps {
    name: string;
    description?: string;
    status: 'live' | 'upcoming' | 'completed';
    date: string;
    region: string;
    prizePool: string;
    players: any[];
    showApply?: boolean;
    onApply?: () => void;
    onClick: () => void;
    className?: string;
}

export function TournamentCard({
    name,
    description,
    status,
    date,
    region,
    prizePool,
    players,
    showApply,
    onApply,
    onClick,
    className,
}: TournamentCardProps) {
    return (
        <Card
            onPress={onClick}
            className={cn(
                "mb-4",
                status === 'live' && "border-live/30",
                className
            )}
        >
            <View className="flex-row items-center gap-4">
                {/* Visual Indicator / Icon */}
                <View className={cn(
                    "w-12 h-12 rounded-2xl items-center justify-center",
                    status === 'live' ? "bg-live/10" : "bg-white/5"
                )}>
                    <Ionicons
                        name={status === 'live' ? "flash" : "trophy-outline"}
                        size={24}
                        color={status === 'live' ? "#10B981" : "#64748B"}
                    />
                </View>

                <View className="flex-1 min-w-0">
                    <View className="flex-row justify-between items-center mb-0.5">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" numberOfLines={1}>
                            {region} • {date}
                        </Text>
                        <StatusBadge status={status} />
                    </View>

                    <Text className="text-lg font-bold text-white" numberOfLines={1}>
                        {name}
                    </Text>

                    <View className="flex-row items-center justify-between mt-1">
                        <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="people-outline" size={12} color="#475569" />
                                <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                    {players.length} Players
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-1">
                                <Ionicons name="cash-outline" size={12} color="#10B981" />
                                <Text className="text-[10px] text-primary font-bold uppercase tracking-tight">
                                    {prizePool} Pool
                                </Text>
                            </View>
                        </View>

                        {showApply ? (
                            <Button onPress={onApply} size="sm" className="h-7 px-3">
                                <Text className="text-[10px] font-black uppercase">Apply</Text>
                            </Button>
                        ) : (
                            <Ionicons name="chevron-forward" size={16} color="#334155" />
                        )}
                    </View>
                </View>
            </View>
        </Card>
    );
}
