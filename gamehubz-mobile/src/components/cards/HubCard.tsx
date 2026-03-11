import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { PlayerAvatar } from '../ui/PlayerAvatar';

interface HubCardProps {
    name: string;
    description?: string;
    numberOfUsers: number;
    numberOfTournaments?: number;
    avatarUrl?: string;
    onClick: () => void;
    isJoined?: boolean;
    className?: string;
    index?: number;
}

export function HubCard({
    name,
    description,
    numberOfUsers,
    numberOfTournaments = 0,
    avatarUrl,
    onClick,
    isJoined,
    className,
    index = 0,
}: HubCardProps) {
    // Determine icon container style based on index (same as TournamentCard for consistency)
    const getIconStyles = (idx: number) => {
        const types = [
            { bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: "#818CF8" },
            { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "#34D399" },
            { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "#FBBF24" },
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
            {/* Top Section: Icon, Title, Status */}
            <View className="flex-row items-center gap-4">
                <View className={cn(
                    "w-16 h-16 rounded-[22px] items-center justify-center border overflow-hidden",
                    iconStyle.bg,
                    iconStyle.border
                )}>
                    {avatarUrl ? (
                        <PlayerAvatar
                            name={name}
                            src={avatarUrl}
                            size="lg"
                            className="w-full h-full rounded-none border-0"
                        />
                    ) : (
                        <Ionicons
                            name="people"
                            size={28}
                            color={iconStyle.icon}
                        />
                    )}
                </View>

                <View className="flex-1 min-w-0">
                    <Text className="text-lg font-black text-white leading-tight mb-0.5" numberOfLines={3}>
                        {name}
                    </Text>
                </View>

                {isJoined && (
                    <View className="px-4 py-2 rounded-full border bg-[#10B981]/10 border-[#10B981]/30">
                        <Text className="text-[10px] font-black uppercase tracking-widest text-[#10B981]">
                            Joined
                        </Text>
                    </View>
                )}
            </View>

            {/* Divider */}
            <View className="h-[1px] bg-white/5 my-5" />

            {/* Bottom Section: Fans, Tournaments, etc */}
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-6">
                    <View className="flex-row items-center opacity-70">
                        <Ionicons name="people-outline" size={16} color="#FAFAFA" />
                        <Text className="text-[12px] font-bold text-slate-300 tracking-tight ml-2">
                            {numberOfUsers} Fans
                        </Text>
                    </View>
                    <View className="flex-row items-center opacity-70">
                        <Ionicons name="trophy-outline" size={16} color="#FAFAFA" />
                        <Text className="text-[12px] font-bold text-slate-300 tracking-tight ml-2">
                            {numberOfTournaments} Tournaments
                        </Text>
                    </View>
                </View>

                <View className="p-2 rounded-xl bg-white/5">
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                </View>
            </View>
        </Card>
    );
}
