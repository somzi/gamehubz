import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BracketMatch } from './BracketMatch';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    score?: number;
}

interface Match {
    id: string;
    player1?: Player;
    player2?: Player;
    winnerId?: string;
}

interface Round {
    name: string;
    matches: Match[];
}

interface TournamentBracketProps {
    rounds: Round[];
}

export function TournamentBracket({ rounds }: TournamentBracketProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-8 p-4">
                {rounds.map((round, roundIndex) => (
                    <View key={roundIndex} className="flex-col">
                        <Text className="text-sm font-semibold text-muted-foreground mb-4 text-center">
                            {round.name}
                        </Text>
                        <View className="flex-col justify-around flex-1 gap-4">
                            {round.matches.map((match) => (
                                <View key={match.id} className="flex-row items-center">
                                    <BracketMatch
                                        player1={match.player1}
                                        player2={match.player2}
                                        winnerId={match.winnerId}
                                    />
                                    {roundIndex < rounds.length - 1 && (
                                        <View className="w-8 h-[1px] bg-border" />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}
