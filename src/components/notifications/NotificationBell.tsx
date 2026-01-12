import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationItem } from "./NotificationItem";

export interface Notification {
  id: string;
  type: "match_scheduled" | "round_started" | "tournament_update" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  tournamentId?: string;
  matchId?: string;
}

// Placeholder notifications
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "match_scheduled",
    title: "Match Scheduled",
    message: "Your match against GamerX is scheduled for Tomorrow at 18:00",
    timestamp: "5 min ago",
    read: false,
    tournamentId: "1",
    matchId: "qf1",
  },
  {
    id: "2",
    type: "round_started",
    title: "New Round Started",
    message: "Semifinals have begun in Winter Championship 2024",
    timestamp: "1 hour ago",
    read: false,
    tournamentId: "1",
  },
  {
    id: "3",
    type: "reminder",
    title: "Match Reminder",
    message: "Your match starts in 30 minutes. Don't forget to click Ready!",
    timestamp: "2 hours ago",
    read: true,
    matchId: "qf1",
  },
  {
    id: "4",
    type: "tournament_update",
    title: "Registration Open",
    message: "Spring Showdown is now accepting registrations",
    timestamp: "1 day ago",
    read: true,
    tournamentId: "2",
  },
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md gradient-card border-border/50">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </SheetHeader>
        <div className="mt-4 space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={() => markAsRead(notification.id)}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
