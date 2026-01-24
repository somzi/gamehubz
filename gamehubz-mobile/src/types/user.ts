export interface PlayerStatsDto {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    tournamentsWon: number;
    winRate: number; // Computed on backend
}

export interface MatchListItemDto {
    tournamentName: string;
    scheduledTime: string | null; // Generic datetime string
    isWin: boolean;
    opponentName: string;
    opponentScore: number | null;
    userScore: number | null;
}

export interface PlayerMatchesDto {
    stats: PlayerStatsDto | null;
    lastMatches: MatchListItemDto[];
}
