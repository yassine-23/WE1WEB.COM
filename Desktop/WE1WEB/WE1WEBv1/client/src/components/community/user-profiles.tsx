import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Calendar, 
  MapPin, 
  Award, 
  Star,
  MessageSquare,
  Heart,
  Share2,
  Trophy,
  Zap,
  Brain,
  Globe
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  location: string;
  bio: string;
  stats: {
    posts: number;
    likes: number;
    comments: number;
    reputation: number;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    earnedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

interface UserProfilesProps {
  userId: string;
}

export default function UserProfiles({ userId }: UserProfilesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Mock user data - in real app, this would come from API
  const userProfile: UserProfile = {
    id: userId,
    name: "Alex Chen",
    email: "alex@we1web.com",
    role: "AI Developer",
    joinDate: "2024-10-15",
    location: "San Francisco, CA",
    bio: "Passionate about distributed AI systems and sustainable computing. Working on neural network optimization for edge devices.",
    stats: {
      posts: 23,
      likes: 142,
      comments: 89,
      reputation: 4.8
    },
    achievements: [
      {
        id: "1",
        title: "First Post",
        description: "Posted your first community contribution",
        icon: MessageSquare,
        color: "bg-blue-500",
        earnedAt: "2024-10-20"
      },
      {
        id: "2",
        title: "AI Researcher",
        description: "Contributed to 10+ AI research discussions",
        icon: Brain,
        color: "bg-purple-500",
        earnedAt: "2024-11-15"
      },
      {
        id: "3",
        title: "Community Leader",
        description: "Helped 50+ community members",
        icon: Trophy,
        color: "bg-gold-500",
        earnedAt: "2024-12-01"
      },
      {
        id: "4",
        title: "Carbon Warrior",
        description: "Contributed to 25% carbon reduction goal",
        icon: Globe,
        color: "bg-green-500",
        earnedAt: "2025-01-10"
      }
    ],
    recentActivity: [
      {
        id: "1",
        type: "post",
        description: "Posted about breakthrough in distributed AI training",
        timestamp: "2025-01-10T10:00:00Z"
      },
      {
        id: "2",
        type: "comment",
        description: "Commented on GPU optimization techniques",
        timestamp: "2025-01-09T16:30:00Z"
      },
      {
        id: "3",
        type: "like",
        description: "Liked a post about neural pool architecture",
        timestamp: "2025-01-09T14:15:00Z"
      }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post': return MessageSquare;
      case 'comment': return MessageSquare;
      case 'like': return Heart;
      default: return Star;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-0">
          <User className="w-4 h-4 mr-1" />
          View Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {userProfile.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                <Badge variant="secondary">{userProfile.role}</Badge>
              </div>
              <p className="text-muted-foreground mb-3">{userProfile.bio}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(userProfile.joinDate)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {userProfile.location}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="modern-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userProfile.stats.posts}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </CardContent>
            </Card>
            <Card className="modern-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {userProfile.stats.likes}
                </div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </CardContent>
            </Card>
            <Card className="modern-card">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {userProfile.stats.comments}
                </div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </CardContent>
            </Card>
            <Card className="modern-card">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-2xl font-bold text-yellow-400">
                    {userProfile.stats.reputation}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Achievements */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProfile.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                    <div className={`w-10 h-10 ${achievement.color}/20 rounded-full flex items-center justify-center`}>
                      <achievement.icon className={`w-5 h-5 ${achievement.color.replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(achievement.earnedAt)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProfile.recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                        <ActivityIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}