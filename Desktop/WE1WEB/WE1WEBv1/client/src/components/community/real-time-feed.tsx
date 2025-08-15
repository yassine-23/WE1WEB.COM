import { useState, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, Zap, Globe, TrendingUp } from "lucide-react";

interface NotificationItem {
  id: string;
  type: 'new_user' | 'donation' | 'milestone' | 'post' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  icon?: string;
}

export default function RealTimeFeed() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'new_user',
      title: 'New Member Joined',
      message: 'Sarah Chen joined the AI Computing Network',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'donation',
      title: 'Climate Donation',
      message: '$25 donated to carbon reduction initiatives',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'milestone',
      title: 'Network Milestone',
      message: '1,000 active compute nodes reached!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
  ]);
  
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: 'new_user' as const,
          titles: ['New Member Joined', 'Welcome New User', 'Community Growing'],
          messages: [
            'Alex Rodriguez joined the AI Computing Network',
            'Maria Santos is now contributing compute power',
            'Dr. Kim Lee joined as an AI researcher'
          ]
        },
        {
          type: 'donation' as const,
          titles: ['Climate Donation', 'Carbon Offset Contribution', 'Green Initiative'],
          messages: [
            '$10 donated to carbon reduction initiatives',
            '$50 contributed to climate change research',
            '$25 supporting renewable energy projects'
          ]
        },
        {
          type: 'milestone' as const,
          titles: ['Network Milestone', 'Achievement Unlocked', 'Community Goal'],
          messages: [
            '10,000 COMP tokens distributed today!',
            '500 new compute nodes this week',
            '2 million AI training tasks completed'
          ]
        },
        {
          type: 'achievement' as const,
          titles: ['Performance Record', 'Efficiency Boost', 'Innovation Alert'],
          messages: [
            'Network efficiency reached 99.95%',
            '60% reduction in training time achieved',
            'New optimization algorithm deployed'
          ]
        }
      ];

      if (Math.random() < 0.3) { // 30% chance every interval
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const randomTitle = randomType.titles[Math.floor(Math.random() * randomType.titles.length)];
        const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)];

        const newNotification: NotificationItem = {
          id: Date.now().toString(),
          type: randomType.type,
          title: randomTitle,
          message: randomMessage,
          timestamp: new Date().toISOString()
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 most recent
      }
    }, 8000); // Check every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_user': return <Users className="w-4 h-4 text-blue-400" />;
      case 'donation': return <Globe className="w-4 h-4 text-green-400" />;
      case 'milestone': return <TrendingUp className="w-4 h-4 text-purple-400" />;
      case 'achievement': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'new_user': return 'bg-blue-500/20 text-blue-400';
      case 'donation': return 'bg-green-500/20 text-green-400';
      case 'milestone': return 'bg-purple-500/20 text-purple-400';
      case 'achievement': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="modern-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-foreground">Live Network Activity</h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/20 transition-colors"
            >
              <div className="mt-0.5">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${getBadgeColor(notification.type)}`}>
                    {notification.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Updates every few seconds</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}