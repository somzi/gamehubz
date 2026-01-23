import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

interface MatchHistoryCardProps {
    tournamentName: string;
    hubName?: string;
    opponentName: string;
    result: "win" | "loss";
    date: string;
    userScore?: number;
    opponentScore?: number;
    onPress?: () => void;
    className?: string;
}

export function MatchHistoryCard({
    tournamentName,
    hubName,
    opponentName,
    result,
    date,
    userScore,
    opponentScore,
    onPress,
    className,
}: MatchHistoryCardProps) {
    const isWin = result === "win";
    const displayName = hubName ? `${tournamentName}` : tournamentName;

    return (
        <Card onPress={onPress} className={className}>
            <View className="flex-row items-center gap-4">
                <View
                    className={cn(
                        "w-12 h-12 rounded-2xl items-center justify-center",
                        isWin ? "bg-primary/10" : "bg-destructive/10"
                    )}
                >
                    <Ionicons
                        name={isWin ? "trophy" : "close-circle"}
                        size={24}
                        color={isWin ? "#10B981" : "#EF4444"}
                    />
                </View>

                <View className="flex-1 min-w-0">
                    <View className="flex-row justify-between items-center mb-0.5">
                        <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-widest" numberOfLines={1}>
                            {displayName}
                        </Text>
                        <Text className="text-[10px] font-medium text-slate-500 uppercase">{date}</Text>
                    </View>

                    <Text className="text-lg font-bold text-white" numberOfLines={1}>
                        vs {opponentName}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        <View className={cn(
                            "px-2 py-0.5 rounded-md flex-row items-center",
                            isWin ? "bg-primary/10" : "bg-destructive/10"
                        )}>
                            <Text className={cn(
                                "text-[10px] font-black uppercase tracking-tighter",
                                isWin ? "text-primary" : "text-destructive"
                            )}>
                                {isWin ? "Victory" : "Defeat"}
                            </Text>
                        </View>
                        {userScore !== undefined && opponentScore !== undefined && (
                            <Text className="ml-3 text-sm font-bold text-slate-400">
                                {userScore} <Text className="text-slate-600">-</Text> {opponentScore}
                            </Text>
                        )}
                    </View>
                </View>

                <Ionicons name="chevron-forward" size={16} color="#334155" />
            </View>
        </Card>
    );
}
