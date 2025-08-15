import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell, 
  BellRing, 
  MessageSquare, 
  Heart, 
  Trophy, 
  Users,
  Leaf,
  Brain,
  X,
  Check,
  Clock
} from "lucide-react";

interface Notification {
  id: string;
  type: 'post' | 'comment' | 'like' | 'achievement' | 'milestone' | 'mention';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: any;
}

export default function AdvancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { sendMessage } = useWebSocket();

  // Mock initial notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "achievement",
        title: "New Achievement Unlocked!",
        description: "You've earned the 'Carbon Warrior' badge for contributing to emissions reduction",
        timestamp: new Date().toISOString(),
        read: false,
        metadata: { badge: "Carbon Warrior" }
      },
      {
        id: "2",
        type: "like",
        title: "Post Liked",
        description: "Sarah Rodriguez liked your post about distributed AI training",
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false
      },
      {
        id: "3",
        type: "comment",
        title: "New Comment",
        description: "Dr. Michael Kim commented on your research discussion",
        timestamp: new Date(Date.now() - 600000).toISOString(),
        read: false
      },
      {
        id: "4",
        type: "milestone",
        title: "Community Milestone",
        description: "WE1WEB reached 1,500 active nodes in the network!",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      if (data.type === 'notification') {
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          type: data.notificationType,
          title: data.title,
          description: data.description,
          timestamp: new Date().toISOString(),
          read: false,
          metadata: data.metadata
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for new notification
        toast({
          title: data.title,
          description: data.description,
          duration: 4000,
        });
      }
    };

    // In a real app, this would listen to WebSocket events
    // For now, we'll simulate random notifications
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: 'notification',
          notificationType: 'like',
          title: 'Post Liked',
          description: 'Someone liked your recent post about neural networks',
        },
        {
          type: 'notification',
          notificationType: 'comment',
          title: 'New Comment',
          description: 'Your research post received a new comment',
        },
        {
          type: 'notification',
          notificationType: 'achievement',
          title: 'Achievement Unlocked!',
          description: 'You\'ve earned the "Community Helper" badge',
        }
      ];

      if (Math.random() < 0.3) { // 30% chance every 10 seconds
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        handleNewNotification(randomNotification);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [toast]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageSquare;
      case 'comment': return MessageSquare;
      case 'like': return Heart;
      case 'achievement': return Trophy;
      case 'milestone': return Users;
      case 'mention': return BellRing;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'post': return 'text-blue-400';
      case 'comment': return 'text-green-400';
      case 'like': return 'text-red-400';
      case 'achievement': return 'text-yellow-400';
      case 'milestone': return 'text-purple-400';
      case 'mention': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            Notifications
          </CardTitle>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              You'll be notified about community activity here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, isExpanded ? undefined : 5).map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    notification.read 
                      ? 'bg-background/30 border-border/30' 
                      : 'bg-background/80 border-border/80'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.read ? 'bg-muted/50' : 'bg-primary/20'
                  }`}>
                    <NotificationIcon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium text-sm ${
                        notification.read ? 'text-muted-foreground' : 'text-foreground'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-xs ${
                      notification.read ? 'text-muted-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {notification.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(notification.timestamp)}
                      </div>
                      {notification.type === 'achievement' && (
                        <Badge variant="secondary" className="text-xs">
                          {notification.metadata?.badge || 'Achievement'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {!isExpanded && notifications.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full text-muted-foreground"
              >
                Show {notifications.length - 5} more notifications
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}