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
    today: 94.20,
    thisWeek: 658.40,
    thisMonth: 2847.65,
    allTime: 48291.84,
    potential: 156.40,
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
      earning: 12.47,
      priority: "high"
    },
    {
      id: "task-002", 
      name: "Computer Vision Training",
      type: "image_classification",
      progress: 23,
      timeRemaining: "6h 45m",
      earning: 28.95,
      priority: "medium"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center neon-border">
              <Server className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-bold neon-text text-primary">Compute Provider Hub</h1>
              <p className="text-gray-300 text-lg">Neural network resource optimization center</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="futuristic-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary neon-text">${earnings.today.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">Today's Earnings</div>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="futuristic-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400 neon-text">{nodeStatus.tasksCompleted}</div>
                  <div className="text-sm text-gray-400">Tasks Completed</div>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="futuristic-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400 neon-text">{nodeStatus.reliability}%</div>
                  <div className="text-sm text-gray-400">Reliability Score</div>
                </div>
                <Shield className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="futuristic-card p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-400 neon-text">#{nodeStatus.networkRank}</div>
                  <div className="text-sm text-gray-400">Network Rank</div>
                </div>
                <Star className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Active Tasks */}
            <div className="futuristic-card p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Activity className="mr-3 w-6 h-6 text-primary" />
                  Active Neural Networks
                </h2>
                <Badge className="bg-green-500/20 text-green-400 neon-border">
                  {activeTasks.length} Running
                </Badge>
              </div>
              
              <div className="space-y-4">
                {activeTasks.map((task) => (
                  <div key={task.id} className="bg-background/50 p-5 rounded-xl border border-primary/20 scan-line">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{task.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="capitalize">{task.type.replace('_', ' ')}</span>
                          <span>•</span>
                          <span className={`flex items-center ${task.priority === 'high' ? 'text-red-400' : 'text-yellow-400'}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary neon-text">+${task.earning}</div>
                        <div className="text-sm text-gray-400">{task.timeRemaining} remaining</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2 bg-background border border-primary/20" />
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline" className="neon-border text-primary">
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-6 bg-primary/10 hover:bg-primary/20 text-primary neon-border">
                <Play className="mr-2 w-4 h-4" />
                Accept New Task
              </Button>
            </div>

            {/* Hardware Monitoring */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
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
                      <span className="text-gray-400">{hardwareStats.gpu.model}</span>
                      <Badge variant="outline" className="text-primary">
                        {hardwareStats.gpu.tflops} TFLOPS
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Utilization</span>
                        <span className="text-white font-medium">{hardwareStats.gpu.utilization}%</span>
                      </div>
                      <Progress value={hardwareStats.gpu.utilization} className="h-2 bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">VRAM Usage</span>
                        <span className="text-white font-medium">
                          {hardwareStats.gpu.memory.used}GB / {hardwareStats.gpu.memory.total}GB
                        </span>
                      </div>
                      <Progress 
                        value={(hardwareStats.gpu.memory.used / hardwareStats.gpu.memory.total) * 100} 
                        className="h-2 bg-background" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Temperature</span>
                        <div className="flex items-center">
                          <Thermometer className="w-3 h-3 mr-1 text-orange-400" />
                          <span className="text-white font-medium">{hardwareStats.gpu.temperature}°C</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Power Draw</span>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                          <span className="text-white font-medium">{hardwareStats.gpu.power}W</span>
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
                      <span className="text-gray-400">{hardwareStats.cpu.model}</span>
                      <Badge variant="outline" className="text-secondary">
                        {hardwareStats.cpu.cores} Cores
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">CPU Usage</span>
                        <span className="text-white font-medium">{hardwareStats.cpu.utilization}%</span>
                      </div>
                      <Progress value={hardwareStats.cpu.utilization} className="h-2 bg-background" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">RAM Usage</span>
                        <span className="text-white font-medium">
                          {hardwareStats.system.ram.used}GB / {hardwareStats.system.ram.total}GB
                        </span>
                      </div>
                      <Progress 
                        value={(hardwareStats.system.ram.used / hardwareStats.system.ram.total) * 100} 
                        className="h-2 bg-background" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Network</span>
                        <div className="flex items-center">
                          <Wifi className="w-3 h-3 mr-1 text-blue-400" />
                          <span className="text-white font-medium">{hardwareStats.system.network.download} Mbps</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Uptime</span>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-green-400" />
                          <span className="text-white font-medium">{hardwareStats.system.uptime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Compute Pools */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="mr-3 w-6 h-6 text-primary" />
                Neural Pool Networks
              </h2>
              
              <div className="space-y-4">
                <div className="bg-background/50 p-5 rounded-xl border border-green-500/30">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">AI Research Consortium</h3>
                      <p className="text-sm text-gray-400">Collaborative research projects • 1,247 members</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 neon-border">Active</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Bonus Rate:</span>
                      <span className="font-medium ml-1 text-green-400">+23%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Focus:</span>
                      <span className="font-medium ml-1 text-white">LLM Training</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Earnings:</span>
                      <span className="font-medium ml-1 text-primary">$247.85/day</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-background/30 p-5 rounded-xl border border-primary/20 border-dashed">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-400 mb-2">Join More Pools</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Increase earnings by joining specialized compute pools
                    </p>
                    <Button variant="outline" className="neon-border text-primary">
                      Browse Available Pools
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            
            {/* Earnings Analytics */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <DollarSign className="mr-2 w-5 h-5 text-primary" />
                Earnings Matrix
              </h3>
              
              <div className="space-y-6">
                <div className="text-center p-4 bg-primary/10 rounded-xl neon-border">
                  <div className="text-3xl font-bold text-primary neon-text">
                    ${earnings.thisMonth.toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm">This Month</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Today</span>
                    <span className="font-bold text-green-400">${earnings.today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">This Week</span>
                    <span className="font-bold text-blue-400">${earnings.thisWeek}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">All Time</span>
                    <span className="font-bold text-purple-400">${earnings.allTime.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Potential (24/7)</span>
                    <span className="font-bold text-orange-400">${earnings.potential}/day</span>
                  </div>
                </div>
                
                <div className="p-3 bg-background/50 rounded-lg border border-primary/20">
                  <div className="text-xs text-gray-400 mb-1">Neural Optimization Tip</div>
                  <div className="text-sm text-gray-300">
                    Enable overnight processing to boost earnings by 67%
                  </div>
                </div>
              </div>
            </div>

            {/* Node Performance */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="mr-2 w-5 h-5 text-secondary" />
                Node Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Compute Score</span>
                  <span className="font-bold text-primary neon-text">{nodeStatus.computeScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Network Rank</span>
                  <span className="font-bold text-orange-400">#{nodeStatus.networkRank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Reliability Score</span>
                  <span className="font-bold text-green-400">{nodeStatus.reliability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Efficiency Rating</span>
                  <span className="font-bold text-blue-400">{earnings.efficiency}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Jobs</span>
                  <span className="font-bold text-purple-400">{nodeStatus.totalJobs}</span>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Settings className="mr-2 w-5 h-5 text-primary" />
                Neural Control Center
              </h3>
              
              <div className="space-y-4">
                <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary neon-border">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Optimize Performance
                </Button>
                <Button className="w-full bg-background/50 hover:bg-background/70 text-white border border-secondary/30">
                  <RotateCcw className="mr-2 w-4 h-4" />
                  Restart Node
                </Button>
                <Button className="w-full bg-background/50 hover:bg-background/70 text-white border border-gray-500/30">
                  <Download className="mr-2 w-4 h-4" />
                  Export Analytics
                </Button>
                <Button className="w-full bg-background/50 hover:bg-background/70 text-white border border-purple-500/30">
                  <Users className="mr-2 w-4 h-4" />
                  Refer Providers
                </Button>
              </div>
            </div>

            {/* Token Balance */}
            <div className="futuristic-card p-6 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Zap className="mr-2 w-5 h-5 text-yellow-400" />
                COMP Tokens
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-yellow-400 neon-text">
                  {balance?.balance || '0'} COMP
                </div>
                <div className="text-gray-400 text-sm">Available Balance</div>
              </div>
              
              <div className="space-y-3">
                <Button className="w-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 border border-yellow-400/30">
                  <DollarSign className="mr-2 w-4 h-4" />
                  Withdraw Tokens
                </Button>
                <Button variant="ghost" className="w-full text-gray-400">
                  View Transaction History
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
