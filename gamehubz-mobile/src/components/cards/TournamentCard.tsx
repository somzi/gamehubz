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
            { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "#818CF8 shadow-indigo-500/20" }, // Indigo
            { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "#34D399 shadow-emerald-500/20" }, // Emerald
            { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "#FBBF24 shadow-amber-500/20" }, // Amber
        ];
        return types[idx % types.length];
    };

    const iconStyle = getIconStyles(index);

    return (
        <Card
            onPress={onClick}
            className={cn(
                "bg-[#131B2E] border border-white/5 rounded-[32px] p-5 shadow-sm",
                className
            )}
        >
            <View className="flex-row items-center gap-5">
                {/* Visual Indicator / Icon */}
                <View className={cn(
                    "w-16 h-16 rounded-[22px] items-center justify-center border",
                    iconStyle.bg,
                    iconStyle.border
                )}>
                    <Ionicons
                        name="trophy"
                        size={30}
                        color={iconStyle.icon.split(' ')[0]}
                    />
                </View>

                {/* Central Content */}
                <View className="flex-1 min-w-0">
                    {/* Row 1: Name */}
                    <Text className="text-lg font-black text-white leading-6 mb-2" numberOfLines={1}>
                        {name}
                    </Text>
                    
                    {/* Row 2: Region & Date */}
                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center opacity-60">
                            <Ionicons name="globe-outline" size={12} color="#94A3B8" />
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                                {region}
                            </Text>
                        </View>
                        <View className="w-1 h-1 rounded-full bg-slate-800" />
                        <View className="flex-row items-center opacity-60">
                            <Ionicons name="calendar-outline" size={12} color="#94A3B8" />
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">
                                {date}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Right Badges */}
                <View className="items-end gap-2.5">
                    {/* Status Badge */}
                    <View className={cn(
                        "px-3 py-1 rounded-full flex-row items-center gap-1.5 border",
                        status === 'live' ? "bg-red-500/10 border-red-500/20" :
                        status === 'completed' ? "bg-slate-500/10 border-slate-500/20" : "bg-blue-500/10 border-blue-500/20"
                    )}>
                        {status === 'live' && (
                            <View className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                        <Text className={cn(
                            "text-[9px] font-black uppercase tracking-wider",
                            status === 'live' ? "text-red-500" :
                            status === 'completed' ? "text-slate-400" : "text-blue-400"
                        )}>
                            {status}
                        </Text>
                    </View>

                    {/* Prize Badge */}
                    <View className="px-3 py-1 rounded-full flex-row items-center gap-1.5 border border-amber-500/20 bg-amber-500/10">
                        <Ionicons name="flash" size={10} color="#FBBF24" />
                        <Text className="text-[10px] font-black text-amber-500 tracking-tighter">{prizePool}</Text>
                    </View>
                </View>
            </View>
        </Card>
    );
}
