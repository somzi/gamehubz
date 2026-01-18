import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';

interface FeedCardProps {
    hubName: string;
    hubAvatar?: string;
    message: string;
    tournamentName?: string;
    timestamp: string;
    onClick?: () => void;
    className?: string;
}

export function FeedCard({
    hubName,
    hubAvatar,
    message,
    tournamentName,
    timestamp,
    onClick,
    className,
}: FeedCardProps) {
    return (
        <Card onPress={onClick} className={cn("mb-3", className)}>
            <View className="flex-row gap-3">
                <PlayerAvatar src={hubAvatar} name={hubName} size="md" />
                <View className="flex-1">
                    <Text className="font-semibold text-foreground">{hubName}</Text>
                    <Text className="text-sm text-muted-foreground mt-0.5">{message}</Text>
                    {tournamentName && (
                        <Pressable
                            className="flex-row items-center gap-1 mt-2"
                            onPress={onClick}
                        >
                            <Text className="text-sm font-medium text-primary">{tournamentName}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#10B981" />
                        </Pressable>
                    )}
                </View>
                <Text className="text-xs text-muted-foreground">{timestamp}</Text>
            </View>
        </Card>
    );
}

