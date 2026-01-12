import { ShieldCheck, AlertTriangle, Flag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FairPlayStatsProps {
  fairPlayScore: number;
  noShowCount: number;
  reportsCount: number;
  matchesPlayed: number;
}

export function FairPlayStats({ 
  fairPlayScore, 
  noShowCount, 
  reportsCount,
  matchesPlayed 
}: FairPlayStatsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-yellow-500";
    return "text-destructive";
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Poor";
  };

  return (
    <div className="space-y-4">
      {/* Main Fair Play Score */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">Fair Play Score</span>
          </div>
          <span className={cn("text-sm font-medium", getScoreColor(fairPlayScore))}>
            {getScoreLabel(fairPlayScore)}
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute left-0 top-0 h-full rounded-full transition-all",
              fairPlayScore >= 90 ? "bg-accent" :
              fairPlayScore >= 70 ? "bg-primary" :
              fairPlayScore >= 50 ? "bg-yellow-500" : "bg-destructive"
            )}
            style={{ width: `${fairPlayScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0</span>
          <span className={cn("font-bold text-lg", getScoreColor(fairPlayScore))}>
            {fairPlayScore}%
          </span>
          <span>100</span>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card text-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 bg-muted">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-xl font-bold">{matchesPlayed}</p>
          <p className="text-xs text-muted-foreground">Matches</p>
        </div>
        
        <div className="stat-card text-center">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2",
            noShowCount > 0 ? "bg-destructive/20" : "bg-accent/20"
          )}>
            <AlertTriangle className={cn(
              "w-4 h-4",
              noShowCount > 0 ? "text-destructive" : "text-accent"
            )} />
          </div>
          <p className={cn(
            "text-xl font-bold",
            noShowCount > 0 ? "text-destructive" : ""
          )}>
            {noShowCount}
          </p>
          <p className="text-xs text-muted-foreground">No-Shows</p>
        </div>
        
        <div className="stat-card text-center">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2",
            reportsCount > 0 ? "bg-destructive/20" : "bg-muted"
          )}>
            <Flag className={cn(
              "w-4 h-4",
              reportsCount > 0 ? "text-destructive" : "text-muted-foreground"
            )} />
          </div>
          <p className={cn(
            "text-xl font-bold",
            reportsCount > 0 ? "text-destructive" : ""
          )}>
            {reportsCount}
          </p>
          <p className="text-xs text-muted-foreground">Reports</p>
        </div>
      </div>
      
      {/* Warning if score is low */}
      {fairPlayScore < 70 && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-destructive">Low Fair Play Score</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Improve your score by showing up to matches on time and following tournament rules.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
