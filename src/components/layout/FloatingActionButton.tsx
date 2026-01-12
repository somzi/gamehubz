import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-4 w-14 h-14 rounded-full gradient-accent shadow-glow",
        "flex items-center justify-center",
        "active:scale-95 transition-transform z-40",
        className
      )}
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
    </button>
  );
}
