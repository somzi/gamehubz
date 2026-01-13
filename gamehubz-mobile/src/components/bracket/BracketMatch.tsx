import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    score?: number;
}

interface BracketMatchProps {
    player1?: Player;
    player2?: Player;
    winnerId?: string;
    className?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function BracketMatch({ player1, player2, winnerId, className }: BracketMatchProps) {
    const navigation = useNavigation<NavigationProp>();

    const handlePlayerClick = (playerId: string) => {
        navigation.navigate('PlayerProfile', { id: playerId });
    };

    const renderPlayer = (player?: Player) => {
        if (!player) {
            return (
                <View className="flex-row items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg">
                    <View className="w-6 h-6 rounded-full bg-muted" />
                    <Text className="text-sm text-muted-foreground">TBD</Text>
                </View>
            );
        }

        const isWinner = winnerId === player.id;

        return (
            <Pressable
                onPress={() => handlePlayerClick(player.id)}
                className={cn(
                    "flex-row items-center gap-2 px-3 py-2 rounded-lg border border-transparent",
                    isWinner ? "bg-accent/20 border-accent/30" : "bg-muted/30"
                )}
            >
                <PlayerAvatar src={player.avatar} name={player.name} size="sm" className="w-6 h-6" />
                <Text className={cn("text-sm font-medium flex-1", isWinner ? "text-accent" : "text-foreground")}>
                    {player.name}
                </Text>
                {player.score !== undefined && (
                    <Text className={cn("text-sm font-bold", isWinner ? "text-accent" : "text-foreground")}>
                        {player.score}
                    </Text>
                )}
            </Pressable>
        );
    };

    return (
        <View className={cn("flex-col gap-1 w-48", className)}>
            {renderPlayer(player1)}
            {renderPlayer(player2)}
        </View>
    );
}
