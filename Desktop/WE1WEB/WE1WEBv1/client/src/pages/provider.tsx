import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { 
  Cpu, Zap, Activity, DollarSign, TrendingUp, 
  Settings, Users, Download, Shield, Server,
  Wifi, HardDrive, Thermometer, Clock, Star,
  Play, Pause, RotateCcw, AlertTriangle
} from "lucide-react";

export default function Provider() {
  const { data: nodes } = useQuery({
    queryKey: ["/api/nodes"],
  });

  const { data: pools } = useQuery({
    queryKey: ["/api/pools"],
  });

  const { data: userPools } = useQuery({
    queryKey: ["/api/pools/my"],
  });

  const { data: balance } = useQuery({
    queryKey: ["/api/tokens/balance"],
  });

  const { data: transactions } = useQuery({
    queryKey: ["/api/tokens/transactions"],
  });

  const { lastMessage } = useWebSocket();

  // Real-time hardware simulation based on WebSocket data
  const hardwareStats = {
    gpu: {
      model: "NVIDIA RTX 4090",
      utilization: 78,
      temperature: 73,
      memory: { used: 18.2, total: 24 },
      power: 284,
      tflops: 847.2
    },
    cpu: {
      model: "Intel Core i7-13700K",
      utilization: 34,
      cores: 16,
      temperature: 52,
      frequency: 4.2
    },
    system: {
      ram: { used: 18, total: 32 },
      storage: { used: 1.2, total: 2.0 },
      network: { upload: 45.2, download: 187.3 },
      uptime: "47h 23m"
    }
  };

  const earnings = {
    today: 94,
    thisWeek: 658,
    thisMonth: 2847,
    allTime: 48291,
    potential: 156,
    efficiency: 98.7
  };

  const nodeStatus = {
    status: "active",
    tasksCompleted: 1247,
    reliability: 99.4,
    networkRank: 1247,
    computeScore: 9247,
    totalJobs: 1583
  };

  const activeTasks = [
    {
      id: "task-001",
      name: "GPT-4 Fine-tuning",
      type: "language_model",
      progress: 67,
      timeRemaining: "2h 14m",
      earning: 12,
      priority: "high"
    },
    {
      id: "task-002", 
      name: "Computer Vision Training",
      type: "image_classification",
      progress: 23,
      timeRemaining: "6h 45m",
      earning: 28,
      priority: "medium"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center">
              <Server className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-primary">Compute Provider Hub</h1>
              <p className="text-muted-foreground text-lg">Share your compute resources and earn credits</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{earnings.today} Credits</div>
                  <div className="text-sm text-muted-foreground">Today's Compute Credits</div>
                </div>
                <Cpu className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-500">{nodeStatus.tasksCompleted}</div>
                  <div className="text-sm text-muted-foreground">Tasks Completed</div>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-500">{nodeStatus.reliability}%</div>
                  <div className="text-sm text-muted-foreground">Reliability Score</div>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-500">#{nodeStatus.networkRank}</div>
                  <div className="text-sm text-muted-foreground">Network Rank</div>
                </div>
                <Star className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Tasks */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Activity className="mr-3 w-6 h-6 text-primary" />
                  Active Compute Tasks
                </h2>
                <Badge className="bg-green-500/20 text-green-500">
                  {activeTasks.length} Running
                </Badge>
              </div>
              
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="bg-muted/50 p-5 rounded-xl border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{task.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className={`flex items-center ${task.priority === 'high' ? 'text-red-500' : 'text-yellow-500'}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">+{task.earning} Credits</div>
                        <div className="text-sm text-muted-foreground">{task.timeRemaining} remaining</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-6" variant="outline">
                <Play className="mr-2 w-4 h-4" />
                Accept New Task
              </Button>
            </Card>

            {/* Hardware Monitoring */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Cpu className="mr-3 w-6 h-6 text-primary" />
                Real-time Hardware Monitor
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* GPU Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary flex items-center">
                    <Zap className="mr-2 w-5 h-5" />
                    GPU Performance
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{hardwareStats.gpu.model}</span>
                      <Badge variant="outline">
                        {hardwareStats.gpu.tflops} TFLOPS
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-medium">{hardwareStats.gpu.utilization}%</span>
                      </div>
                      <Progress value={hardwareStats.gpu.utilization} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VRAM Usage</span>
                        <span className="font-medium">
                          {hardwareStats.gpu.memory.used}GB / {hardwareStats.gpu.memory.total}GB
                        </span>
                      </div>
                      <Progress 
                        value={(hardwareStats.gpu.memory.used / hardwareStats.gpu.memory.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Temperature</span>
                        <div className="flex items-center">
                          <Thermometer className="w-3 h-3 mr-1 text-orange-500" />
                          <span className="font-medium">{hardwareStats.gpu.temperature}°C</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Power Draw</span>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                          <span className="font-medium">{hardwareStats.gpu.power}W</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-secondary flex items-center">
                    <Server className="mr-2 w-5 h-5" />
                    System Resources
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{hardwareStats.cpu.model}</span>
                      <Badge variant="outline">
                        {hardwareStats.cpu.cores} Cores
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CPU Usage</span>
                        <span className="font-medium">{hardwareStats.cpu.utilization}%</span>
                      </div>
                      <Progress value={hardwareStats.cpu.utilization} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">RAM Usage</span>
                        <span className="font-medium">
                          {hardwareStats.system.ram.used}GB / {hardwareStats.system.ram.total}GB
                        </span>
                      </div>
                      <Progress 
                        value={(hardwareStats.system.ram.used / hardwareStats.system.ram.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Network</span>
                        <div className="flex items-center">
                          <Wifi className="w-3 h-3 mr-1 text-blue-500" />
                          <span className="font-medium">{hardwareStats.system.network.download} Mbps</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uptime</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-green-500" />
                          <span className="font-medium">{hardwareStats.system.uptime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Compute Pools */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Users className="mr-3 w-6 h-6 text-primary" />
                Compute Pool Networks
              </h2>
              
              <div className="space-y-4">
                <div className="bg-muted/50 p-5 rounded-xl border border-green-500/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">AI Research Consortium</h3>
                      <p className="text-sm text-muted-foreground">Collaborative research projects • 1,247 members</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Bonus Rate:</span>
                      <span className="font-medium ml-1 text-green-500">+23%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="font-medium ml-1">LLM Training</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Earnings:</span>
                      <span className="font-medium ml-1 text-primary">247 Credits/day</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-5 rounded-xl border border-dashed">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Join More Pools</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Increase earnings by joining specialized compute pools
                    </p>
                    <Button variant="outline">
                      Browse Available Pools
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Earnings Analytics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Cpu className="mr-2 w-5 h-5 text-primary" />
                Compute Credits
              </h3>
              
              <div className="space-y-6">
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <div className="text-3xl font-bold text-primary">
                    {earnings.thisMonth.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground text-sm">Credits This Month</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Today</span>
                    <span className="font-bold text-green-500">{earnings.today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="font-bold text-blue-500">{earnings.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">All Time</span>
                    <span className="font-bold text-purple-500">{earnings.allTime.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Potential (24/7)</span>
                    <span className="font-bold text-orange-500">{earnings.potential}/day</span>
                  </div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Optimization Tip</div>
                  <div className="text-sm">
                    Enable overnight processing to boost earnings by 67%
                  </div>
                </div>
              </div>
            </Card>

            {/* Node Performance */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Activity className="mr-2 w-5 h-5 text-secondary" />
                Node Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Compute Score</span>
                  <span className="font-bold text-primary">{nodeStatus.computeScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network Rank</span>
                  <span className="font-bold text-orange-500">#{nodeStatus.networkRank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Reliability Score</span>
                  <span className="font-bold text-green-500">{nodeStatus.reliability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Efficiency Rating</span>
                  <span className="font-bold text-blue-500">{earnings.efficiency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Jobs</span>
                  <span className="font-bold text-purple-500">{nodeStatus.totalJobs}</span>
                </div>
              </div>
            </Card>

            {/* Control Panel */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Settings className="mr-2 w-5 h-5 text-primary" />
                Control Center
              </h3>
              
              <div className="space-y-4">
                <Button className="w-full" variant="default">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Optimize Performance
                </Button>
                <Button className="w-full" variant="outline">
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Restart Node
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="mr-2 w-4 h-4" />
                  Export Analytics
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 w-4 h-4" />
                  Refer Providers
                </Button>
              </div>
            </Card>

            {/* Credit Balance */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Zap className="mr-2 w-5 h-5 text-yellow-500" />
                Credit Balance
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-yellow-500">
                  {balance?.balance || '0'}
                </div>
                <div className="text-muted-foreground text-sm">Available Credits</div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full" variant="default">
                  <DollarSign className="mr-2 w-4 h-4" />
                  Withdraw Credits
                </Button>
                <Button variant="ghost" className="w-full">
                  View Transaction History
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}