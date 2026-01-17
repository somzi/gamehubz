import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';

interface Participant {
    participantId: string;
    userId: string;
    username: string;
    score: number | null;
    isWinner: boolean;
    seed: number;
}

interface BracketMatchProps {
    home: Participant | null;
    away: Participant | null;
    className?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function BracketMatch({ home, away, className }: BracketMatchProps) {
    const navigation = useNavigation<NavigationProp>();

    const handlePlayerClick = (userId: string) => {
        navigation.navigate('PlayerProfile', { id: userId });
    };

    const renderParticipant = (participant: Participant | null) => {
        if (!participant) {
            return (
                <View className="flex-row items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg h-10">
                    <View className="w-6 h-6 rounded-full bg-muted/50" />
                    <Text className="text-sm text-muted-foreground italic">TBD</Text>
                </View>
            );
        }

        const isWinner = participant.isWinner;

        return (
            <Pressable
                onPress={() => handlePlayerClick(participant.userId)}
                className={cn(
                    "flex-row items-center gap-2 px-3 py-2 rounded-lg border border-transparent h-10",
                    isWinner ? "bg-accent/20 border-accent/30" : "bg-muted/30"
                )}
            >
                <PlayerAvatar name={participant.username} size="sm" className="w-6 h-6" />
                <Text className={cn("text-sm font-medium flex-1", isWinner ? "text-accent" : "text-foreground")} numberOfLines={1}>
                    {participant.username}
                </Text>
                {participant.score !== null && (
                    <Text className={cn("text-sm font-bold", isWinner ? "text-accent" : "text-foreground")}>
                        {participant.score}
                    </Text>
                )}
            </Pressable>
        );
    };

    return (
        <View className={cn("flex-col gap-1 w-48", className)}>
            {renderParticipant(home)}
            {renderParticipant(away)}
        </View>
    );
}
