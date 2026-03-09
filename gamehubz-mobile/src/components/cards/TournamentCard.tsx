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
    index?: number;
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
    index = 0,
}: TournamentCardProps) {
    // Determine icon container style based on index
    const getIconStyles = (idx: number) => {
        const types = [
            { bg: "bg-[#4F46E5]/10", border: "border-[#4F46E5]/20", icon: "#4F46E5" }, // Purple
            { bg: "bg-[#10B981]/10", border: "border-[#10B981]/20", icon: "#10B981" }, // Green
            { bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/20", icon: "#F59E0B" }, // Orange
        ];
        return types[idx % types.length];
    };

    const iconStyle = getIconStyles(index);

    return (
        <Card
            onPress={onClick}
            className={cn(
                "bg-[#131B2E] border-white/5 rounded-3xl p-4",
                className
            )}
        >
            <View className="flex-row items-center gap-4">
                {/* Visual Indicator / Icon */}
                <View className={cn(
                    "w-14 h-14 rounded-2xl items-center justify-center border",
                    iconStyle.bg,
                    iconStyle.border
                )}>
                    <Ionicons
                        name="game-controller-outline"
                        size={28}
                        color={iconStyle.icon}
                    />
                </View>

                <View className="flex-1 min-w-0 justify-center">
                    <Text className="text-lg font-black text-white mb-0.5" numberOfLines={2}>
                        {name}
                    </Text>
                    <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                        {region} • {date}
                    </Text>
                </View>

                {/* Right Badges */}
                <View className="items-end gap-2 ml-2">
                    {/* Status Badge Custom for this design */}
                    <View className={cn(
                        "px-2.5 py-1 rounded-full flex-row items-center gap-1.5 border",
                        status === 'live' ? "bg-[#EF4444]/10 border-[#EF4444]/30" :
                        status === 'completed' ? "bg-slate-500/10 border-slate-500/30" : "bg-blue-500/10 border-blue-500/30"
                    )}>
                        {status === 'live' && (
                            <View className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                        )}
                        <Text className={cn(
                            "text-[10px] font-black uppercase tracking-tighter",
                            status === 'live' ? "text-[#EF4444]" :
                            status === 'completed' ? "text-slate-400" : "text-blue-500"
                        )}>
                            {status}
                        </Text>
                    </View>

                    {/* Prize Badge */}
                    <View className="px-2 py-0.5 rounded-full flex-row items-center gap-1 border border-[#F59E0B]/30 bg-[#F59E0B]/10">
                        <Ionicons name="trophy-outline" size={10} color="#F59E0B" />
                        <Text className="text-[10px] font-black text-[#F59E0B]">{prizePool}</Text>
                    </View>
                </View>

                {/* Arrow */}
                <View className="ml-2">
                    <Ionicons name="chevron-forward" size={16} color="#334155" />
                </View>
            </View>
        </Card>
    );
}
