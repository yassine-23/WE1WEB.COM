import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import EarningsChart from "@/components/charts/earnings-chart";
import NodeStatusCard from "@/components/cards/node-status-card";
import TaskCard from "@/components/cards/task-card";
import { useWebSocket } from "@/hooks/useWebSocket";
import { CheckCircle, Play, Coins } from "lucide-react";

export default function ProviderDashboard() {
  const { data: nodes } = useQuery({
    queryKey: ["/api/nodes"],
  });

  const { data: tokenTransactions } = useQuery({
    queryKey: ["/api/tokens/transactions"],
  });

  const { lastMessage } = useWebSocket();

  // Mock current task data - in real app this would come from API
  const currentTask = {
    id: "task-123",
    name: "GPT-3 Fine-tuning",
    progress: 67,
    estimatedEarnings: 12.47,
    timeRemaining: "2h 14m",
  };

  // Mock hardware utilization - in real app this would come from WebSocket
  const hardwareUtilization = {
    gpu: { usage: 78, model: "RTX 4090" },
    cpu: { usage: 34, model: "Intel i7-13700K" },
    ram: { usage: 56, total: 32 },
  };

  // Mock performance metrics
  const performanceMetrics = {
    tflops: 847.2,
    gpuTemp: 73,
    powerUsage: 284,
    efficiency: 98.7,
  };

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      type: "completed",
      title: "Task Completed: GPT-3 Fine-tuning",
      time: "2 hours ago",
      amount: "+$15.23",
      icon: CheckCircle,
      iconColor: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: 2,
      type: "started",
      title: "Task Started: BERT Training",
      time: "4 hours ago",
      amount: "In Progress",
      icon: Play,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 3,
      type: "payout",
      title: "Token Payout",
      time: "Yesterday",
      amount: "+247 ACP",
      icon: Coins,
      iconColor: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Earnings Overview</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-accent">$247.83</div>
                <div className="text-gray-600 text-sm">Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">$6,429.12</div>
                <div className="text-gray-600 text-sm">This Month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">$48,291.84</div>
                <div className="text-gray-600 text-sm">All Time</div>
              </div>
            </div>
            <EarningsChart />
          </Card>
        </div>

        <div className="space-y-6">
          <NodeStatusCard nodes={nodes} />
          
          {/* Current Task */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Current Task</h3>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">{currentTask.name}</div>
              <Progress value={currentTask.progress} className="w-full" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{currentTask.progress}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Earnings</span>
                <span className="font-medium text-accent">${currentTask.estimatedEarnings}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hardware Monitoring */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Hardware Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">GPU ({hardwareUtilization.gpu.model})</span>
                <span className="font-medium">{hardwareUtilization.gpu.usage}%</span>
              </div>
              <Progress value={hardwareUtilization.gpu.usage} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">CPU ({hardwareUtilization.cpu.model})</span>
                <span className="font-medium">{hardwareUtilization.cpu.usage}%</span>
              </div>
              <Progress value={hardwareUtilization.cpu.usage} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">RAM ({hardwareUtilization.ram.total}GB)</span>
                <span className="font-medium">{hardwareUtilization.ram.usage}%</span>
              </div>
              <Progress value={hardwareUtilization.ram.usage} className="w-full" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-primary">{performanceMetrics.tflops}</div>
              <div className="text-sm text-gray-600">TFLOPS</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-secondary">{performanceMetrics.gpuTemp}°C</div>
              <div className="text-sm text-gray-600">GPU Temp</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-accent">{performanceMetrics.powerUsage}W</div>
              <div className="text-sm text-gray-600">Power Usage</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-yellow-500">{performanceMetrics.efficiency}%</div>
              <div className="text-sm text-gray-600">Efficiency</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                  <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div>
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-600">{activity.time}</div>
                </div>
              </div>
              <div className={`font-medium ${activity.type === 'completed' ? 'text-accent' : 'text-gray-600'}`}>
                {activity.amount}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
