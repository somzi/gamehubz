import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

// Placeholder data
const hubsData = [
  {
    id: "1",
    name: "Esports Hub",
    description: "Premier competitive gaming community",
    followers: 1250,
    tournaments: 45,
  },
  {
    id: "2",
    name: "Gaming League",
    description: "Professional esports organization",
    followers: 890,
    tournaments: 32,
  },
  {
    id: "3",
    name: "Community Arena",
    description: "Open tournaments for everyone",
    followers: 2100,
    tournaments: 78,
  },
  {
    id: "4",
    name: "Pro Circuit",
    description: "Elite competitive series",
    followers: 560,
    tournaments: 18,
  },
];

export default function Hubs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24">
      <PageHeader 
        title="Hubs" 
        rightElement={<Users className="w-6 h-6 text-primary" />}
      />

      <div className="px-4 py-6 animate-slide-up">
        <div className="space-y-3">
          {hubsData.map((hub) => (
            <div
              key={hub.id}
              onClick={() => navigate(`/hubs/${hub.id}`)}
              className="tournament-card cursor-pointer"
            >
              <div className="flex gap-4">
                <PlayerAvatar name={hub.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{hub.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {hub.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{hub.followers.toLocaleString()} followers</span>
                    <span>{hub.tournaments} tournaments</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
