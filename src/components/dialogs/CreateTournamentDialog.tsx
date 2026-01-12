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
import { Users, Trophy, Globe, Coins } from "lucide-react";

interface CreateTournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const regions = [
  { value: "europe", label: "Europe" },
  { value: "north-america", label: "North America" },
  { value: "south-america", label: "South America" },
  { value: "asia", label: "Asia" },
  { value: "africa", label: "Africa" },
  { value: "oceania", label: "Oceania" },
  { value: "global", label: "Global" },
];

const playerLevels = [
  { value: "1", label: "Level 1 - Beginner" },
  { value: "2", label: "Level 2 - Intermediate" },
  { value: "3", label: "Level 3 - Advanced" },
  { value: "4", label: "Level 4 - Expert" },
  { value: "5", label: "Level 5 - Professional" },
];

export function CreateTournamentDialog({ open, onOpenChange }: CreateTournamentDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [region, setRegion] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [inviteFollowers, setInviteFollowers] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for API integration
    console.log("Create tournament:", {
      name,
      description,
      minLevel,
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
    setMinLevel("");
    setRegion("");
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
            <Label className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              Minimum Player Level
            </Label>
            <Select value={minLevel} onValueChange={setMinLevel}>
              <SelectTrigger className="bg-secondary border-border/50">
                <SelectValue placeholder="Select minimum level" />
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
