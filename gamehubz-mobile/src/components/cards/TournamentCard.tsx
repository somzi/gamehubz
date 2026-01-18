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
                "mb-3",
                status === 'live' && "border-live/30",
                className
            )}
        >
            <View className="space-y-3">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-2">
                        <Text className="text-lg font-bold text-foreground">{name}</Text>
                        {description && (
                            <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                                {description}
                            </Text>
                        )}
                    </View>
                    <StatusBadge status={status} />
                </View>

                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="globe-outline" size={14} color="#94A3B8" />
                            <Text className="text-xs text-muted-foreground">{region}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="people-outline" size={14} color="#94A3B8" />
                            <Text className="text-xs text-muted-foreground">{players.length} players</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="cash-outline" size={14} color="#10B981" />
                        <Text className="text-sm font-bold text-accent">{prizePool}</Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar-outline" size={16} color="#94A3B8" />
                        <Text className="text-sm text-muted-foreground">{date}</Text>
                    </View>

                    {showApply ? (
                        <Button onPress={onApply} size="sm">
                            Apply
                        </Button>
                    ) : (
                        <Pressable
                            onPress={onClick}
                            className="flex-row items-center gap-1"
                        >
                            <Text className="text-sm font-medium text-primary">View Bracket</Text>
                            <Ionicons name="chevron-forward" size={16} color="#10B981" />
                        </Pressable>
                    )}
                </View>
            </View>
        </Card>
    );
}

