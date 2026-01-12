import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Trophy, Globe, Coins, FileText, UserPlus } from "lucide-react";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const regions = [
  { value: "global", label: "Global (No Restrictions)" },
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
];

const playerLevels = [
  { value: "1", label: "Level 1 - Beginner" },
  { value: "2", label: "Level 2 - Intermediate" },
  { value: "3", label: "Level 3 - Advanced" },
  { value: "4", label: "Level 4 - Expert" },
  { value: "5", label: "Level 5 - Professional" },
];

const maxPlayerOptions = [
  { value: "8", label: "8 Players" },
  { value: "16", label: "16 Players" },
  { value: "32", label: "32 Players" },
  { value: "64", label: "64 Players" },
  { value: "128", label: "128 Players" },
];

export function CreateTournamentDialog({ open, onOpenChange }: CreateTournamentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [region, setRegion] = useState("global");
  const [prizePool, setPrizePool] = useState("");
  const [inviteFollowers, setInviteFollowers] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for API integration
    console.log("Create tournament:", {
      name,
      description,
      rules,
      minLevel,
      maxPlayers,
      region,
      prizePool,
      inviteFollowers,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRules("");
    setMinLevel("");
    setMaxPlayers("");
    setRegion("global");
    setPrizePool("");
    setInviteFollowers(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gradient-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Tournament</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tournamentName">Tournament Name</Label>
            <Input
              id="tournamentName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tournament name"
              className="bg-secondary border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournamentDescription">Description</Label>
            <Textarea
              id="tournamentDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your tournament..."
              className="bg-secondary border-border/50 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournamentRules" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Rules
            </Label>
            <Textarea
              id="tournamentRules"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Enter tournament rules (e.g., Best of 3, no exploits allowed...)"
              className="bg-secondary border-border/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                Min Level
              </Label>
              <Select value={minLevel} onValueChange={setMinLevel}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {playerLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                Max Players
              </Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger className="bg-secondary border-border/50">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {maxPlayerOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Region
            </Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizePool" className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-accent" />
              Prize Pool
            </Label>
            <Input
              id="prizePool"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="e.g., $500 or 1000 V-Bucks"
              className="bg-secondary border-border/50"
            />
          </div>

          <div 
            className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/30 cursor-pointer"
            onClick={() => setInviteFollowers(!inviteFollowers)}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              inviteFollowers ? 'bg-primary border-primary' : 'border-muted-foreground'
            }`}>
              {inviteFollowers && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-sm">Invite Hub Followers</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Send notifications to all your hub followers
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-accent text-primary-foreground font-semibold">
            Create Tournament
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
