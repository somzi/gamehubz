import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { SearchInput } from "@/components/ui/SearchInput";
import { CreateHubDialog } from "@/components/dialogs/CreateHubDialog";
import { Button } from "@/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredHubs = hubsData.filter((hub) =>
    hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hub.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24">
      <PageHeader 
        title="Hubs" 
        rightElement={
          <Button 
            size="sm" 
            className="gradient-accent text-primary-foreground font-semibold h-8 px-3"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create
          </Button>
        }
      />

      <div className="px-4 py-4 animate-slide-up">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search hubs..."
          className="mb-4"
        />

        <div className="space-y-3">
          {filteredHubs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hubs found</p>
            </div>
          ) : (
            filteredHubs.map((hub) => (
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
            ))
          )}
        </div>
      </div>

      <CreateHubDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
