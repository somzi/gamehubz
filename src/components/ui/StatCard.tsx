import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: "default" | "accent" | "gold";
  className?: string;
}

const variantStyles = {
  default: "text-primary",
  accent: "text-primary",
  gold: "text-accent",
};

export function StatCard({ icon: Icon, value, label, variant = "default", className }: StatCardProps) {
  return (
    <div className={cn("stat-card flex-1", className)}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", 
        variant === "gold" ? "bg-accent/20" : "bg-primary/20"
      )}>
        <Icon className={cn("w-4 h-4", variantStyles[variant])} />
      </div>
      <p className={cn("text-2xl font-bold", variantStyles[variant])}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
