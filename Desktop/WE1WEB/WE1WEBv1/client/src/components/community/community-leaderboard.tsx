import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp,
  Crown,
  Star,
  Zap,
  Brain,
  Heart,
  MessageSquare,
  Users,
  Leaf
} from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  position: number;
  score: number;
  badge: string;
  trend: 'up' | 'down' | 'same';
  trendChange: number;
}

export default function CommunityLeaderboard() {
  const [activeTab, setActiveTab] = useState("overall");

  const leaderboards = {
    overall: [
      {
        id: "1",
        name: "Dr. Michael Kim",
        avatar: "MK",
        position: 1,
        score: 2847,
        badge: "Platform Admin",
        trend: "up" as const,
        trendChange: 3
      },
      {
        id: "2", 
        name: "Sarah Rodriguez",
        avatar: "SR",
        position: 2,
        score: 2156,
        badge: "Resource Provider",
        trend: "up" as const,
        trendChange: 1
      },
      {
        id: "3",
        name: "Alex Chen",
        avatar: "AC", 
        position: 3,
        score: 1893,
        badge: "AI Developer",
        trend: "same" as const,
        trendChange: 0
      },
      {
        id: "4",
        name: "Emily Johnson",
        avatar: "EJ",
        position: 4,
        score: 1654,
        badge: "Researcher",
        trend: "up" as const,
        trendChange: 2
      },
      {
        id: "5",
        name: "David Park",
        avatar: "DP",
        position: 5,
        score: 1423,
        badge: "Community Helper",
        trend: "down" as const,
        trendChange: -1
      }
    ],
    posts: [
      {
        id: "1",
        name: "Alex Chen",
        avatar: "AC",
        position: 1,
        score: 47,
        badge: "Content Creator",
        trend: "up" as const,
        trendChange: 2
      },
      {
        id: "2",
        name: "Dr. Michael Kim", 
        avatar: "MK",
        position: 2,
        score: 34,
        badge: "Platform Admin",
        trend: "same" as const,
        trendChange: 0
      },
      {
        id: "3",
        name: "Sarah Rodriguez",
        avatar: "SR",
        position: 3,
        score: 28,
        badge: "Resource Provider",
        trend: "up" as const,
        trendChange: 1
      }
    ],
    carbon: [
      {
        id: "1",
        name: "Sarah Rodriguez",
        avatar: "SR",
        position: 1,
        score: 156,
        badge: "Carbon Warrior",
        trend: "up" as const,
        trendChange: 2
      },
      {
        id: "2",
        name: "GreenTech Collective",
        avatar: "GTC",
        position: 2,
        score: 134,
        badge: "Eco Champion",
        trend: "up" as const,
        trendChange: 1
      },
      {
        id: "3",
        name: "Alex Chen",
        avatar: "AC",
        position: 3,
        score: 98,
        badge: "Sustainability Advocate",
        trend: "same" as const,
        trendChange: 0
      }
    ],
    contributions: [
      {
        id: "1",
        name: "Emily Johnson",
        avatar: "EJ",
        position: 1,
        score: 89,
        badge: "Helper",
        trend: "up" as const,
        trendChange: 3
      },
      {
        id: "2",
        name: "David Park",
        avatar: "DP",
        position: 2,
        score: 67,
        badge: "Mentor",
        trend: "up" as const,
        trendChange: 1
      },
      {
        id: "3",
        name: "Tech Support Team",
        avatar: "TST",
        position: 3,
        score: 45,
        badge: "Support Hero",
        trend: "same" as const,
        trendChange: 0
      }
    ]
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === "up") return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (trend === "down") return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
    return <span className="w-3 h-3 text-muted-foreground">•</span>;
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "overall": return Trophy;
      case "posts": return MessageSquare;
      case "carbon": return Leaf;
      case "contributions": return Heart;
      default: return Star;
    }
  };

  const getScoreUnit = (tab: string) => {
    switch (tab) {
      case "overall": return "pts";
      case "posts": return "posts";
      case "carbon": return "kg CO₂";
      case "contributions": return "helps";
      default: return "pts";
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Community Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.keys(leaderboards).map((tab) => {
              const IconComponent = getTabIcon(tab);
              return (
                <TabsTrigger key={tab} value={tab} className="flex items-center gap-1">
                  <IconComponent className="w-3 h-3" />
                  <span className="capitalize">{tab}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(leaderboards).map(([tabKey, users]) => (
            <TabsContent key={tabKey} value={tabKey} className="space-y-3 mt-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20' 
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/20'
                      : index === 2
                      ? 'bg-gradient-to-r from-amber-600/10 to-orange-500/10 border-amber-600/20'
                      : 'bg-background/50 border-border/50'
                  }`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getPositionIcon(user.position)}
                  </div>
                  
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.avatar}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{user.score.toLocaleString()} {getScoreUnit(tabKey)}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(user.trend, user.trendChange)}
                        {user.trendChange !== 0 && (
                          <span className={`text-xs ${
                            user.trend === "up" ? "text-green-400" : "text-red-400"
                          }`}>
                            {Math.abs(user.trendChange)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <div className={`w-2 h-8 rounded-full ${
                      index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-b from-gray-400 to-gray-600' :
                      'bg-gradient-to-b from-amber-600 to-orange-600'
                    }`} />
                  )}
                </div>
              ))}
              
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">Your Position</p>
                  <p className="font-semibold text-primary">#12 - 847 {getScoreUnit(tabKey)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tabKey === "overall" && "Keep engaging to climb the ranks!"}
                    {tabKey === "posts" && "Share more insights to move up!"}
                    {tabKey === "carbon" && "Contribute more compute to save emissions!"}
                    {tabKey === "contributions" && "Help more community members!"}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Weekly Challenge */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-purple-400">Weekly Challenge</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Help 5 community members this week to earn the "Helpful Hero" badge!
          </p>
          <div className="flex items-center justify-between">
            <div className="flex-1 bg-background/50 rounded-full h-2 mr-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: "60%" }} />
            </div>
            <span className="text-xs font-medium text-purple-400">3/5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}