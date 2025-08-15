import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Star, 
  Clock,
  Shield,
  Target,
  Award,
  ChevronRight,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  totalComputePower: number;
  hourlyEarnings: number;
  multiplier: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  requirements: {
    minCpuCores: number;
    minRam: number;
    minUptime: number;
  };
  currentTask?: {
    name: string;
    progress: number;
    reward: number;
    timeRemaining: string;
  };
  features: string[];
  joinedMembers: Array<{
    id: string;
    name: string;
    contribution: number;
    earnings: number;
  }>;
}

const collaborativePools: Pool[] = [
  {
    id: '1',
    name: 'AI Climate Research Pool',
    description: 'Training climate prediction models to combat global warming. High-impact research with premium rewards.',
    members: 1247,
    maxMembers: 2000,
    totalComputePower: 15420,
    hourlyEarnings: 8.75,
    multiplier: 2.3,
    difficulty: 'intermediate',
    category: 'Climate Science',
    requirements: {
      minCpuCores: 4,
      minRam: 8,
      minUptime: 80
    },
    currentTask: {
      name: 'Antarctic Ice Sheet Model',
      progress: 67,
      reward: 2850,
      timeRemaining: '4h 23m'
    },
    features: ['24/7 Monitoring', 'Priority Support', 'Carbon Credits', 'Research Impact Reports'],
    joinedMembers: [
      { id: '1', name: 'Alex Chen', contribution: 12.5, earnings: 156.75 },
      { id: '2', name: 'Sarah Kim', contribution: 8.2, earnings: 98.40 },
      { id: '3', name: 'Mike Torres', contribution: 15.1, earnings: 201.25 }
    ]
  },
  {
    id: '2',
    name: 'Medical AI Training Pool',
    description: 'Accelerating medical diagnosis AI development. Help save lives while earning premium rewards.',
    members: 892,
    maxMembers: 1500,
    totalComputePower: 11240,
    hourlyEarnings: 9.25,
    multiplier: 2.5,
    difficulty: 'advanced',
    category: 'Healthcare',
    requirements: {
      minCpuCores: 6,
      minRam: 16,
      minUptime: 90
    },
    currentTask: {
      name: 'Cancer Detection Model',
      progress: 34,
      reward: 4200,
      timeRemaining: '7h 45m'
    },
    features: ['HIPAA Compliant', 'Medical Research Impact', 'Publication Credits', 'Expert Mentorship'],
    joinedMembers: [
      { id: '4', name: 'Dr. Lisa Wang', contribution: 18.7, earnings: 298.50 },
      { id: '5', name: 'James Rodriguez', contribution: 14.3, earnings: 223.75 },
      { id: '6', name: 'Emma Johnson', contribution: 11.9, earnings: 187.20 }
    ]
  },
  {
    id: '3',
    name: 'Beginner Friendly Pool',
    description: 'Perfect for newcomers! Low requirements, steady earnings, and great community support.',
    members: 2341,
    maxMembers: 5000,
    totalComputePower: 8760,
    hourlyEarnings: 4.50,
    multiplier: 1.5,
    difficulty: 'beginner',
    category: 'General Computing',
    requirements: {
      minCpuCores: 2,
      minRam: 4,
      minUptime: 60
    },
    currentTask: {
      name: 'Image Classification',
      progress: 89,
      reward: 1200,
      timeRemaining: '1h 15m'
    },
    features: ['Beginner Tutorials', '24/7 Support', 'Community Discord', 'Learning Resources'],
    joinedMembers: [
      { id: '7', name: 'New User 1', contribution: 5.2, earnings: 45.60 },
      { id: '8', name: 'New User 2', contribution: 3.8, earnings: 32.75 },
      { id: '9', name: 'New User 3', contribution: 6.1, earnings: 52.30 }
    ]
  },
  {
    id: '4',
    name: 'Quantum Research Pool',
    description: 'Cutting-edge quantum computing simulations. Premium pool for high-end hardware.',
    members: 156,
    maxMembers: 300,
    totalComputePower: 24680,
    hourlyEarnings: 15.75,
    multiplier: 3.2,
    difficulty: 'advanced',
    category: 'Quantum Computing',
    requirements: {
      minCpuCores: 16,
      minRam: 32,
      minUptime: 95
    },
    currentTask: {
      name: 'Quantum Algorithm Optimization',
      progress: 23,
      reward: 8500,
      timeRemaining: '12h 30m'
    },
    features: ['Quantum Expertise', 'Research Publications', 'Conference Invites', 'Premium Hardware Support'],
    joinedMembers: [
      { id: '10', name: 'Dr. Alan Quantum', contribution: 25.8, earnings: 445.75 },
      { id: '11', name: 'Prof. Marie Physics', contribution: 22.4, earnings: 387.20 },
      { id: '12', name: 'Tech Enthusiast', contribution: 19.1, earnings: 324.65 }
    ]
  }
];

const getDifficultyColor = (difficulty: Pool['difficulty']) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  }
};

export default function CollaborativePools() {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  const joinPool = (pool: Pool) => {
    // In real implementation, this would make an API call
    console.log('Joining pool:', pool.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Collaborative Computing Pools</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Join forces with thousands of users worldwide. Collaborate on bigger tasks, 
          earn higher rewards, and contribute to meaningful research projects.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">12,847</div>
              <div className="text-sm text-muted-foreground">Active Members</div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">45.2K</div>
              <div className="text-sm text-muted-foreground">Total Compute Power</div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">$127K</div>
              <div className="text-sm text-muted-foreground">Earned This Month</div>
            </CardContent>
          </Card>
          <Card className="modern-card">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">2.8x</div>
              <div className="text-sm text-muted-foreground">Avg Multiplier</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Pools</TabsTrigger>
          <TabsTrigger value="my-pools">My Pools</TabsTrigger>
          <TabsTrigger value="create">Create Pool</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {collaborativePools.map((pool) => (
              <Card 
                key={pool.id} 
                className={`modern-card cursor-pointer transition-all hover:shadow-lg ${
                  selectedPool?.id === pool.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPool(selectedPool?.id === pool.id ? null : pool)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{pool.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDifficultyColor(pool.difficulty)}>
                          {pool.difficulty}
                        </Badge>
                        <Badge variant="outline">{pool.category}</Badge>
                        <Badge className="bg-primary/10 text-primary">
                          {pool.multiplier}x multiplier
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">${pool.hourlyEarnings}/hr</div>
                      <div className="text-sm text-muted-foreground">avg earnings</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{pool.description}</p>

                  {/* Pool Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <div className="font-bold">{pool.members.toLocaleString()}</div>
                      <Progress value={(pool.members / pool.maxMembers) * 100} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Zap className="w-4 h-4" />
                        <span>Compute</span>
                      </div>
                      <div className="font-bold">{pool.totalComputePower.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mb-1">
                        <Star className="w-4 h-4" />
                        <span>Rating</span>
                      </div>
                      <div className="font-bold">4.{Math.floor(Math.random() * 9) + 1}/5.0</div>
                    </div>
                  </div>

                  {/* Current Task */}
                  {pool.currentTask && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Current Task: {pool.currentTask.name}</span>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {pool.currentTask.timeRemaining}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{pool.currentTask.progress}%</span>
                      </div>
                      <Progress value={pool.currentTask.progress} className="h-2 mb-2" />
                      <div className="text-sm text-muted-foreground">
                        Reward Pool: <span className="font-medium text-green-600">{pool.currentTask.reward} COMP</span>
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <span>{pool.requirements.minCpuCores}+ cores</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <span>{pool.requirements.minRam}GB RAM</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Wifi className="w-4 h-4 text-muted-foreground" />
                        <span>{pool.requirements.minUptime}% uptime</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedPool?.id === pool.id && (
                    <div className="border-t pt-4 space-y-4 animate-in slide-in-from-top-2">
                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-2">Pool Features</h4>
                        <div className="flex flex-wrap gap-2">
                          {pool.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Top Contributors */}
                      <div>
                        <h4 className="font-medium mb-2">Top Contributors</h4>
                        <div className="space-y-2">
                          {pool.joinedMembers.slice(0, 3).map((member, index) => (
                            <div key={member.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                  index === 1 ? 'bg-gray-100 text-gray-800' :
                                  'bg-orange-100 text-orange-800'
                                }`}>
                                  {index + 1}
                                </div>
                                <span>{member.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${member.earnings}</div>
                                <div className="text-xs text-muted-foreground">{member.contribution}% contribution</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      joinPool(pool);
                    }}
                    className="w-full"
                  >
                    Join Pool
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-pools" className="space-y-6">
          <Card className="modern-card">
            <CardContent className="p-8 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pools Joined Yet</h3>
              <p className="text-muted-foreground mb-4">
                Join your first collaborative pool to start earning with others!
              </p>
              <Button onClick={() => setActiveTab('browse')}>
                Browse Available Pools
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="modern-card">
            <CardHeader>
              <CardTitle>Create Your Own Pool</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-300">Pool Creation Requirements</h4>
                    <ul className="text-sm text-yellow-600 dark:text-yellow-400 mt-1 space-y-1">
                      <li>• Minimum 1000 COMP token stake</li>
                      <li>• Verified account with 90+ day history</li>
                      <li>• Technical documentation for pool purpose</li>
                      <li>• Community approval process (7 days)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full" disabled>
                Coming Soon - Pool Creation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}