import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cpu, 
  Users, 
  Activity, 
  Wifi, 
  Monitor,
  Smartphone,
  Laptop,
  Server,
  Globe,
  Vote,
  Play,
  Pause,
  Plus,
  Check,
  X,
  AlertCircle,
  Zap,
  Brain,
  Code,
  Shield,
  Database,
  MessageSquare,
  BarChart
} from 'lucide-react';
import { WE1Protocol, ComputeTaskType, DeviceCapabilities } from '@/lib/protocol/WE1Protocol';
import { motion, AnimatePresence } from 'framer-motion';

// Task definitions with real value propositions
const VALUABLE_TASKS = [
  {
    type: ComputeTaskType.HUMAN_FEEDBACK,
    name: "Human Feedback Collection",
    description: "Rate AI responses to improve model behavior (RLHF)",
    icon: MessageSquare,
    value: "$0.15-0.25/task",
    buyers: ["OpenAI", "Anthropic", "Google"],
    color: "text-blue-500",
    requirements: { cpu: 1, memory: 2, gpu: false },
    explanation: "Your feedback teaches AI models which responses are helpful, harmless, and honest"
  },
  {
    type: ComputeTaskType.SYNTHETIC_CONVERSATIONS,
    name: "Synthetic Data Generation",
    description: "Create diverse training conversations for AI models",
    icon: Brain,
    value: "$0.20-0.40/dataset",
    buyers: ["Meta", "Microsoft", "Startups"],
    color: "text-purple-500",
    requirements: { cpu: 2, memory: 4, gpu: false },
    explanation: "Generate realistic dialogues that help AI understand context and nuance"
  },
  {
    type: ComputeTaskType.CODE_REVIEW,
    name: "Code Quality Assessment",
    description: "Review and annotate code for training coding assistants",
    icon: Code,
    value: "$0.30-0.50/review",
    buyers: ["GitHub", "GitLab", "Replit"],
    color: "text-green-500",
    requirements: { cpu: 2, memory: 4, gpu: false },
    explanation: "Help AI understand good vs bad code patterns and best practices"
  },
  {
    type: ComputeTaskType.MULTIMODAL_ANNOTATION,
    name: "Image/Video Description",
    description: "Describe visual content for multimodal AI training",
    icon: Database,
    value: "$0.25-0.45/batch",
    buyers: ["OpenAI", "Midjourney", "Stability AI"],
    color: "text-yellow-500",
    requirements: { cpu: 2, memory: 6, gpu: true },
    explanation: "Teach AI to understand and generate descriptions of visual content"
  },
  {
    type: ComputeTaskType.FACT_VERIFICATION,
    name: "Fact Checking & Verification",
    description: "Verify claims and citations for truthful AI",
    icon: Shield,
    value: "$0.35-0.60/verification",
    buyers: ["News orgs", "Research labs", "Social platforms"],
    color: "text-red-500",
    requirements: { cpu: 2, memory: 4, gpu: false },
    explanation: "Ensure AI provides accurate, verifiable information"
  },
  {
    type: ComputeTaskType.EDGE_CASE_DISCOVERY,
    name: "Edge Case & Prompt Testing",
    description: "Find AI limitations and unusual behaviors",
    icon: AlertCircle,
    value: "$0.40-0.80/discovery",
    buyers: ["AI Safety orgs", "Anthropic", "DeepMind"],
    color: "text-orange-500",
    requirements: { cpu: 3, memory: 6, gpu: false },
    explanation: "Discover scenarios where AI models fail or behave unexpectedly"
  },
  {
    type: ComputeTaskType.PREFERENCE_LEARNING,
    name: "A/B Testing & Preferences",
    description: "Compare AI outputs to learn human preferences",
    icon: BarChart,
    value: "$0.20-0.35/comparison",
    buyers: ["All AI companies"],
    color: "text-indigo-500",
    requirements: { cpu: 1, memory: 2, gpu: false },
    explanation: "Help AI understand what humans prefer in different contexts"
  },
  {
    type: ComputeTaskType.TRANSLATION_PAIRS,
    name: "Multilingual Training Data",
    description: "Create translation pairs for language models",
    icon: Globe,
    value: "$0.30-0.50/pair",
    buyers: ["Google", "DeepL", "Meta"],
    color: "text-teal-500",
    requirements: { cpu: 2, memory: 3, gpu: false },
    explanation: "Improve AI's ability to understand and translate between languages"
  }
];

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'desktop' | 'laptop' | 'mobile';
  status: 'active' | 'idle' | 'processing';
  capabilities: Partial<DeviceCapabilities>;
  contribution: number; // Percentage
  earnings: number;
}

export default function FunctionalPoolManager() {
  const [protocol] = useState(() => new WE1Protocol());
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<ComputeTaskType[]>([]);
  const [poolStats, setPoolStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalCompute: 0,
    totalMemory: 0,
    tasksCompleted: 0,
    totalEarnings: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [taskVotes, setTaskVotes] = useState<Record<ComputeTaskType, number>>({} as any);

  // Simulated real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isProcessing && connectedDevices.length > 0) {
        setConnectedDevices(devices => 
          devices.map(d => ({
            ...d,
            contribution: Math.min(100, d.contribution + Math.random() * 5),
            earnings: d.earnings + (Math.random() * 0.001),
            status: Math.random() > 0.3 ? 'processing' : 'idle'
          }))
        );
        
        setPoolStats(stats => ({
          ...stats,
          tasksCompleted: stats.tasksCompleted + Math.floor(Math.random() * 3),
          totalEarnings: stats.totalEarnings + (Math.random() * 0.01)
        }));
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isProcessing, connectedDevices.length]);

  const connectDevice = async () => {
    // Simulate device connection
    const newDevice: ConnectedDevice = {
      id: `device_${Date.now()}`,
      name: `${navigator.platform} - ${window.location.hostname}`,
      type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'laptop',
      status: 'idle',
      capabilities: {
        cpu: { cores: navigator.hardwareConcurrency || 4, speed: 2.5, model: 'Intel' },
        memory: { total: 8, available: 4 }
      },
      contribution: 0,
      earnings: 0
    };
    
    setConnectedDevices(prev => [...prev, newDevice]);
    setIsConnected(true);
    
    // Update pool stats
    setPoolStats(prev => ({
      ...prev,
      totalDevices: prev.totalDevices + 1,
      totalCompute: prev.totalCompute + (newDevice.capabilities.cpu?.cores || 0),
      totalMemory: prev.totalMemory + (newDevice.capabilities.memory?.total || 0)
    }));
  };

  const voteForTask = (taskType: ComputeTaskType) => {
    setTaskVotes(prev => ({
      ...prev,
      [taskType]: (prev[taskType] || 0) + 1
    }));
    
    if (!selectedTasks.includes(taskType)) {
      setSelectedTasks(prev => [...prev, taskType]);
    }
  };

  const startProcessing = () => {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task type to process');
      return;
    }
    setIsProcessing(true);
    setPoolStats(prev => ({
      ...prev,
      activeDevices: connectedDevices.length
    }));
  };

  const stopProcessing = () => {
    setIsProcessing(false);
    setConnectedDevices(devices => 
      devices.map(d => ({ ...d, status: 'idle' }))
    );
  };

  const getDeviceIcon = (type: string) => {
    switch(type) {
      case 'desktop': return Monitor;
      case 'laptop': return Laptop;
      case 'mobile': return Smartphone;
      default: return Server;
    }
  };

  return (
    <div className="space-y-6">
      {/* Pool Overview */}
      <Card className="bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Neural Pool Control Center</CardTitle>
            <Badge className={isProcessing ? "bg-green-500" : "bg-gray-500"}>
              {isProcessing ? "Processing" : "Idle"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-blue-400">{poolStats.totalDevices}</div>
              <div className="text-sm text-muted-foreground">Connected Devices</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-green-400">{poolStats.totalCompute}</div>
              <div className="text-sm text-muted-foreground">CPU Cores</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-purple-400">{poolStats.tasksCompleted}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-3xl font-bold text-yellow-400">${poolStats.totalEarnings.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
          </div>

          <div className="flex gap-4">
            {!isConnected ? (
              <Button onClick={connectDevice} className="flex-1" size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Connect This Device
              </Button>
            ) : (
              <>
                {!isProcessing ? (
                  <Button onClick={startProcessing} className="flex-1 bg-green-600 hover:bg-green-700" size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    Start Processing
                  </Button>
                ) : (
                  <Button onClick={stopProcessing} className="flex-1 bg-red-600 hover:bg-red-700" size="lg">
                    <Pause className="mr-2 h-5 w-5" />
                    Stop Processing
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {connectedDevices.map((device) => {
                const Icon = getDeviceIcon(device.type);
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div>
                        <div className="font-medium">{device.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {device.capabilities.cpu?.cores} cores • {device.capabilities.memory?.total}GB RAM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">${device.earnings.toFixed(4)}</div>
                        <div className="text-xs text-muted-foreground">earned</div>
                      </div>
                      <Badge variant={device.status === 'processing' ? 'default' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {connectedDevices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No devices connected yet. Click "Connect This Device" to start.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Voting Forum */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Task Selection - Vote for Processing Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Why This Matters:</strong> The data you help generate is used to train next-generation AI models. 
              Companies like OpenAI, Anthropic, and Google pay premium prices for high-quality training data. 
              Your contributions directly improve AI capabilities while earning you rewards.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VALUABLE_TASKS.map((task) => {
              const Icon = task.icon;
              const votes = taskVotes[task.type] || 0;
              const isSelected = selectedTasks.includes(task.type);
              
              return (
                <motion.div
                  key={task.type}
                  whileHover={{ scale: 1.02 }}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                  }`}
                  onClick={() => voteForTask(task.type)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-white/10`}>
                        <Icon className={`h-5 w-5 ${task.color}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{task.name}</h4>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Value:</span>
                      <span className="font-medium text-green-400">{task.value}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Buyers:</span>
                      <span className="text-xs">{task.buyers.slice(0, 2).join(", ")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Community Votes:</span>
                      <Badge variant="secondary">{votes}</Badge>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-muted-foreground italic">
                        {task.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Real Value Explanation */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">How Your Data Creates Real Value</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <h4 className="font-medium">For AI Models</h4>
              <p className="text-sm text-muted-foreground">
                Your feedback teaches models to be more helpful, accurate, and safe. 
                Every task completed improves AI understanding.
              </p>
            </div>
            <div className="space-y-2">
              <Database className="h-6 w-6 text-blue-500" />
              <h4 className="font-medium">For Companies</h4>
              <p className="text-sm text-muted-foreground">
                Tech giants need diverse, high-quality data. Your contributions are worth 
                $50-500 per 1000 tasks to companies training AI.
              </p>
            </div>
            <div className="space-y-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h4 className="font-medium">For You</h4>
              <p className="text-sm text-muted-foreground">
                Earn $50-200/month while your devices idle. Contribute to AI advancement 
                and get paid for valuable data generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}