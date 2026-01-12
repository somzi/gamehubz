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

interface CreateHubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateHubDialog({ open, onOpenChange }: CreateHubDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for API integration
    console.log("Create hub:", { name, description });
    onOpenChange(false);
    setName("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gradient-card border-border/50">
        <DialogHeader>
          <DialogTitle>Create New Hub</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Hub Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter hub name"
              className="bg-secondary border-border/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your hub..."
              className="bg-secondary border-border/50 min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full gradient-accent text-primary-foreground font-semibold">
            Create Hub
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
