import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BracketMatch } from './BracketMatch';

interface Participant {
    participantId: string;
    userId: string;
    username: string;
    score: number | null;
    isWinner: boolean;
    seed: number;
}

interface Match {
    id: string;
    order: number;
    status: number;
    startTime: string | null;
    nextMatchId: string | null;
    home: Participant | null;
    away: Participant | null;
}

interface Round {
    roundNumber: number;
    name: string;
    matches: Match[];
}

interface TournamentBracketProps {
    rounds: Round[];
    onMatchPress?: (match: Match) => void;
    currentUserId?: string;
    currentUsername?: string;
    isAdmin?: boolean;
}

export function TournamentBracket({ rounds, onMatchPress, currentUserId, currentUsername, isAdmin }: TournamentBracketProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-8 p-4">
                {rounds.map((round) => (
                    <View key={round.roundNumber} className="flex-col">
                        <Text className="text-sm font-semibold text-muted-foreground mb-4 text-center">
                            {round.name}
                        </Text>
                        <View className="flex-col justify-around flex-1 gap-4">
                            {round.matches.map((match) => (
                                <View key={match.id} className="flex-row items-center">
                                    <BracketMatch
                                        home={match.home}
                                        away={match.away}
                                        onPress={() => onMatchPress?.(match)}
                                        currentUserId={currentUserId}
                                        currentUsername={currentUsername}
                                        isAdmin={isAdmin}
                                    />
                                    {match.nextMatchId && (
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
