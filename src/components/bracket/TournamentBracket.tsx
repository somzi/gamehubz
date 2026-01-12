import { BracketMatch } from "./BracketMatch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <ScrollArea className="w-full">
      <div className="flex gap-8 p-4 min-w-max">
        {rounds.map((round, roundIndex) => (
          <div key={roundIndex} className="flex flex-col">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 text-center">
              {round.name}
            </h3>
            <div className="flex flex-col justify-around flex-1 gap-4">
              {round.matches.map((match) => (
                <div key={match.id} className="flex items-center">
                  <BracketMatch
                    player1={match.player1}
                    player2={match.player2}
                    winnerId={match.winnerId}
                  />
                  {roundIndex < rounds.length - 1 && (
                    <div className="w-8 h-px bg-border ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
