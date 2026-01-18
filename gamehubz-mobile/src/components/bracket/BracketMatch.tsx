import { View, Text, Pressable } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import { PlayerAvatar } from '../ui/PlayerAvatar';
import { cn } from '../../lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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
    onPress?: () => void;
    currentUserId?: string;
    currentUsername?: string;
    isAdmin?: boolean;
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function BracketMatch({ home, away, className, onPress, currentUserId, currentUsername, isAdmin }: BracketMatchProps) {
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

    const getUserId = (p: any) => p?.userId || p?.UserId || p?.id || p?.Id;
    const getUsername = (p: any) => p?.username || p?.Username || p?.name || p?.Name;

    const pHomeId = getUserId(home);
    const pAwayId = getUserId(away);
    const pHomeName = getUsername(home);
    const pAwayName = getUsername(away);
    const currId = currentUserId;
    const currName = currentUsername;

    const isHome = (!!currId && !!pHomeId && pHomeId.toLowerCase() === currId.toLowerCase()) ||
        (!!currName && !!pHomeName && pHomeName.toLowerCase() === currName.toLowerCase());
    const isAway = (!!currId && !!pAwayId && pAwayId.toLowerCase() === currId.toLowerCase()) ||
        (!!currName && !!pAwayName && pAwayName.toLowerCase() === currName.toLowerCase());
    const isParticipant = isHome || isAway;

    // Robust score check
    const hasScore = (p: any) => p?.score !== null && p?.score !== undefined;
    const isAlreadyReported = hasScore(home) || hasScore(away);

    const canReport = !!onPress && !isAlreadyReported && isParticipant;

    return (
        <Pressable
            onPress={canReport ? onPress : undefined}
            disabled={!canReport}
            className={cn(
                "flex-col gap-1 w-52 p-2 rounded-2xl bg-card border border-border/30",
                canReport && "border-primary/30",
                className
            )}
            style={({ pressed }) => ({
                opacity: pressed && canReport ? 0.7 : 1,
                transform: [{ scale: pressed && canReport ? 0.98 : 1 }]
            })}
        >
            {canReport && (
                <View className="flex-row items-center justify-between mb-1 px-1">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="create-outline" size={10} color="#10B981" />
                        <Text className="text-[10px] font-extrabold text-primary uppercase tracking-tighter">Report</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={10} color="#3F3F46" />
                </View>
            )}
            {renderParticipant(home)}
            {renderParticipant(away)}
        </Pressable>
    );
}
