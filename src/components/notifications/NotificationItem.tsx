import { useNavigate } from "react-router-dom";
import { Calendar, Trophy, Bell, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "./NotificationBell";

interface NotificationItemProps {
  notification: Notification;
  onRead: () => void;
}

const iconMap = {
  match_scheduled: Calendar,
  round_started: Trophy,
  tournament_update: Bell,
  reminder: Clock,
};

const colorMap = {
  match_scheduled: "text-primary",
  round_started: "text-accent",
  tournament_update: "text-muted-foreground",
  reminder: "text-destructive",
};

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = iconMap[notification.type];
  
  const handleClick = () => {
    onRead();
    if (notification.tournamentId) {
      navigate(`/tournaments/${notification.tournamentId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-xl border cursor-pointer transition-all",
        notification.read
          ? "bg-card/50 border-border/30"
          : "bg-primary/5 border-primary/20"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", 
          notification.read ? "bg-muted" : "bg-primary/10"
        )}>
          <Icon className={cn("w-4 h-4", colorMap[notification.type])} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={cn("font-medium text-sm truncate", !notification.read && "text-foreground")}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {notification.timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}
