import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Users, 
  Globe,
  X,
  ChevronRight
} from "lucide-react";

interface Achievement {
  id: string;
  type: 'milestone' | 'personal' | 'community' | 'environmental';
  title: string;
  description: string;
  icon: string;
  points: number;
  unlockedAt: string;
  isNew?: boolean;
}

export default function AchievementNotifications() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    // Simulate achievement unlocks
    const achievementTypes = [
      {
        type: 'milestone' as const,
        achievements: [
          {
            title: 'First Contributor',
            description: 'Made your first contribution to the network',
            icon: 'star',
            points: 100
          },
          {
            title: 'Carbon Warrior',
            description: 'Helped reduce 1 ton of CO2 emissions',
            icon: 'globe',
            points: 500
          },
          {
            title: 'Community Builder',
            description: 'Posted 10 helpful community messages',
            icon: 'users',
            points: 250
          }
        ]
      },
      {
        type: 'environmental' as const,
        achievements: [
          {
            title: 'Green Computing Champion',
            description: 'Contributed 100 hours of eco-friendly compute',
            icon: 'trophy',
            points: 1000
          },
          {
            title: 'Climate Hero',
            description: 'Offset carbon equivalent to 500 miles of driving',
            icon: 'target',
            points: 750
          }
        ]
      }
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        const randomType = achievementTypes[Math.floor(Math.random() * achievementTypes.length)];
        const randomAchievement = randomType.achievements[Math.floor(Math.random() * randomType.achievements.length)];

        const newAchievement: Achievement = {
          id: Date.now().toString(),
          type: randomType.type,
          title: randomAchievement.title,
          description: randomAchievement.description,
          icon: randomAchievement.icon,
          points: randomAchievement.points,
          unlockedAt: new Date().toISOString(),
          isNew: true
        };

        setAchievements(prev => [newAchievement, ...prev.slice(0, 9)]);
        setCurrentAchievement(newAchievement);
        setShowNotification(true);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="w-6 h-6 text-yellow-400" />;
      case 'trophy': return <Trophy className="w-6 h-6 text-gold-400" />;
      case 'target': return <Target className="w-6 h-6 text-red-400" />;
      case 'globe': return <Globe className="w-6 h-6 text-green-400" />;
      case 'users': return <Users className="w-6 h-6 text-blue-400" />;
      default: return <Zap className="w-6 h-6 text-purple-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-purple-500/20 text-purple-400';
      case 'environmental': return 'bg-green-500/20 text-green-400';
      case 'community': return 'bg-blue-500/20 text-blue-400';
      case 'personal': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <>
      {/* Achievement Notification Popup */}
      {showNotification && currentAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
          <Card className="modern-card border-yellow-500/30 bg-background/95 backdrop-blur-md shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-400">Achievement Unlocked!</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotification(false)}
                  className="h-auto p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  {getIcon(currentAchievement.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{currentAchievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentAchievement.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getBadgeColor(currentAchievement.type)}>
                      +{currentAchievement.points} points
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Achievements List */}
      {achievements.length > 0 && (
        <Card className="modern-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-foreground">Recent Achievements</h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full flex items-center justify-center">
                    {getIcon(achievement.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground">{achievement.title}</h4>
                      {achievement.isNew && (
                        <Badge className="bg-red-500/20 text-red-400 text-xs">NEW</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getBadgeColor(achievement.type)}`}>
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
            
            {achievements.length > 5 && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="w-full">
                  View All Achievements
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}