import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { BracketMatch } from './BracketMatch';
import { cn } from '../../lib/utils';

interface Standing {
    position: number;
    participantId: string;
    userId: string;
    username?: string;
    points: number;
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

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

interface Group {
    groupId: string;
    name: string;
    standings: Standing[];
    matches: Match[];
}

interface TournamentGroupsProps {
    groups: Group[];
    onMatchPress?: (match: Match) => void;
    currentUserId?: string;
    currentUsername?: string;
    isAdmin?: boolean;
}

export function TournamentGroups({ groups, onMatchPress, currentUserId, currentUsername, isAdmin }: TournamentGroupsProps) {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const handlePlayerPress = (participant: any) => {
        const userId = participant.id || participant.userId || participant.UserId;
        if (userId) {
            navigation.navigate('PlayerProfile', { id: userId });
        }
    };

    const getUsername = (userId: string, matches: Match[]) => {
        for (const match of matches) {
            if (match.home?.userId === userId) return match.home.username;
            if (match.away?.userId === userId) return match.away.username;
        }
        return 'Unknown';
    };

    return (
        <View className="flex-col gap-8 p-4">
            {groups.map((group) => (
                <View key={group.groupId} className="flex-col gap-6">
                    <View>
                        <Text className="text-lg font-bold text-foreground mb-4">{group.name}</Text>

                        <View className="bg-card rounded-xl border border-border/30 overflow-hidden">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="min-w-full">
                                    <View className="flex-row bg-muted/30 py-3 px-4 border-b border-border/30">
                                        <Text className="w-8 text-xs font-bold text-muted-foreground text-center">#</Text>
                                        <Text className="w-32 text-xs font-bold text-muted-foreground ml-2">Player</Text>
                                        <Text className="w-8 text-xs font-bold text-muted-foreground text-center">P</Text>
                                        <Text className="w-8 text-xs font-bold text-muted-foreground text-center">W</Text>
                                        <Text className="w-8 text-xs font-bold text-muted-foreground text-center">D</Text>
                                        <Text className="w-8 text-xs font-bold text-muted-foreground text-center">L</Text>
                                        <Text className="w-10 text-xs font-bold text-muted-foreground text-center">GF</Text>
                                        <Text className="w-10 text-xs font-bold text-muted-foreground text-center">GA</Text>
                                        <Text className="w-10 text-xs font-bold text-muted-foreground text-center">GD</Text>
                                        <Text className="w-12 text-xs font-bold text-muted-foreground text-center">Pts</Text>
                                    </View>
                                    {group.standings.map((standing, index) => (
                                        <Pressable
                                            key={standing.participantId}
                                            onPress={() => handlePlayerPress(standing)}
                                            className={cn(
                                                "flex-row py-3 px-4 border-b border-border/10 items-center",
                                                index === group.standings.length - 1 && "border-b-0"
                                            )}
                                            style={({ pressed }: { pressed: boolean }) => ({
                                                backgroundColor: pressed ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                                            })}
                                        >
                                            <Text className="w-8 text-sm font-medium text-muted-foreground text-center">{standing.position}</Text>
                                            <Text className="w-32 text-sm font-bold text-foreground ml-2" numberOfLines={1}>
                                                {standing.username || getUsername(standing.userId, group.matches)}
                                            </Text>
                                            <Text className="w-8 text-sm text-center text-muted-foreground">{standing.matchesPlayed}</Text>
                                            <Text className="w-8 text-sm text-center text-muted-foreground">{standing.wins}</Text>
                                            <Text className="w-8 text-sm text-center text-muted-foreground">{standing.draws}</Text>
                                            <Text className="w-8 text-sm text-center text-muted-foreground">{standing.losses}</Text>
                                            <Text className="w-10 text-sm text-center text-muted-foreground">{standing.goalsFor}</Text>
                                            <Text className="w-10 text-sm text-center text-muted-foreground">{standing.goalsAgainst}</Text>
                                            <Text className="w-10 text-sm text-center text-muted-foreground">{standing.goalDifference > 0 ? `+${standing.goalDifference}` : standing.goalDifference}</Text>
                                            <Text className="w-12 text-sm text-center font-bold text-accent">{standing.points}</Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-muted-foreground mb-4">Matches</Text>
                        <View className="flex-col gap-3">
                            {group.matches.map((match) => (
                                <View key={match.id} className="items-center">
                                    <BracketMatch
                                        home={match.home}
                                        away={match.away}
                                        className="w-full"
                                        onPress={() => onMatchPress?.(match)}
                                        currentUserId={currentUserId}
                                        currentUsername={currentUsername}
                                        isAdmin={isAdmin}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}
