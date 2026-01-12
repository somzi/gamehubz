import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlayerAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

export function PlayerAvatar({ src, name, size = "md", className }: PlayerAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={cn(sizeClasses[size], "border-2 border-border", className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback className="bg-secondary text-foreground font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
