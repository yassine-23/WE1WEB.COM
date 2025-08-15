import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Leaf, 
  Users, 
  Brain, 
  Globe, 
  Trophy,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";

export default function CommunityMilestones() {
  const milestones = [
    {
      id: 1,
      title: "Carbon Offset Goal",
      description: "Reduce AI carbon emissions by 60%",
      current: 42,
      target: 60,
      unit: "%",
      icon: Leaf,
      color: "bg-green-500",
      textColor: "text-green-400"
    },
    {
      id: 2,
      title: "Active Nodes",
      description: "Distributed computing network",
      current: 1247,
      target: 2000,
      unit: " nodes",
      icon: Globe,
      color: "bg-blue-500",
      textColor: "text-blue-400"
    },
    {
      id: 3,
      title: "AI Models Trained",
      description: "Community training achievements",
      current: 89,
      target: 150,
      unit: " models",
      icon: Brain,
      color: "bg-purple-500",
      textColor: "text-purple-400"
    },
    {
      id: 4,
      title: "Community Members",
      description: "Growing global network",
      current: 3456,
      target: 5000,
      unit: " members",
      icon: Users,
      color: "bg-orange-500",
      textColor: "text-orange-400"
    }
  ];

  const achievements = [
    {
      id: 1,
      title: "First 1000 Members",
      description: "Reached our initial community milestone",
      date: "Dec 2024",
      icon: Users,
      color: "bg-blue-500/20"
    },
    {
      id: 2,
      title: "1M Compute Hours",
      description: "Collectively contributed 1 million compute hours",
      date: "Jan 2025",
      icon: Zap,
      color: "bg-yellow-500/20"
    },
    {
      id: 3,
      title: "Carbon Neutral",
      description: "Achieved 50% reduction in AI emissions",
      date: "Jan 2025",
      icon: Leaf,
      color: "bg-green-500/20"
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Current Milestones */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            2025 Milestones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 ${milestone.color}/20 rounded-full flex items-center justify-center`}>
                    <milestone.icon className={`w-4 h-4 ${milestone.textColor}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{milestone.title}</h4>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {milestone.current.toLocaleString()}{milestone.unit}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {milestone.target.toLocaleString()}{milestone.unit}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Progress 
                  value={getProgressPercentage(milestone.current, milestone.target)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{getProgressPercentage(milestone.current, milestone.target).toFixed(1)}% complete</span>
                  <span>{(milestone.target - milestone.current).toLocaleString()}{milestone.unit} remaining</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
              <div className={`w-10 h-10 ${achievement.color} rounded-full flex items-center justify-center`}>
                <achievement.icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{achievement.title}</h4>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {achievement.date}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Impact Stats */}
      <Card className="modern-card border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-400">2.3M</div>
              <div className="text-xs text-muted-foreground">kg CO₂ Saved</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400">45%</div>
              <div className="text-xs text-muted-foreground">Energy Efficient</div>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Equivalent to taking <span className="font-semibold text-green-400">500 cars</span> off the road for a year
          </div>
        </CardContent>
      </Card>
    </div>
  );
}