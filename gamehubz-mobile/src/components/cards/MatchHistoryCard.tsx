import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/utils';

interface MatchHistoryCardProps {
    tournamentName: string;
    opponentName: string;
    result: "win" | "loss";
    date: string;
    onPress?: () => void;
    className?: string;
}

export function MatchHistoryCard({
    tournamentName,
    opponentName,
    result,
    date,
    onPress,
    className,
}: MatchHistoryCardProps) {
    const isWin = result === "win";

    return (
        <Pressable
            onPress={onPress}
            className={cn(
                "flex-row items-center gap-4 p-3 rounded-xl bg-card border border-border/30",
                className
            )}

        >
            <View
                className={cn(
                    "w-10 h-10 rounded-lg items-center justify-center",
                    isWin ? "bg-accent/20" : "bg-destructive/20"
                )}
            >
                {isWin ? (
                    <Ionicons name="trophy" size={20} color="#10B981" />
                ) : (
                    <Ionicons name="close" size={20} color="#EF4444" />
                )}
            </View>

            <View className="flex-1 min-w-0">
                <Text className="font-medium text-foreground" numberOfLines={1}>{tournamentName}</Text>
                <Text className="text-sm text-muted-foreground">vs {opponentName}</Text>
            </View>

            <View className="items-end">
                <Text className={cn("font-semibold", isWin ? "text-accent" : "text-destructive")}>
                    {isWin ? "Win" : "Loss"}
                </Text>
                <Text className="text-xs text-muted-foreground">{date}</Text>
            </View>
        </Pressable>
    );
}
