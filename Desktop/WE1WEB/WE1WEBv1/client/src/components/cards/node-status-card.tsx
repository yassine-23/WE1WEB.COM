import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Node } from "@shared/schema";
import { Cpu, Wifi, HardDrive, Zap } from "lucide-react";

interface NodeStatusCardProps {
  nodes?: Node[];
}

export default function NodeStatusCard({ nodes }: NodeStatusCardProps) {
  // Use the first node or create a mock node for display
  const primaryNode = nodes?.[0] || {
    id: "mock-node",
    name: "Primary Node",
    status: "online",
    reputation: "4.7",
    cpuModel: "Intel i7-13700K",
    gpuModel: "RTX 4090",
    ramGb: 32,
    lastSeen: new Date(),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-accent text-white";
      case "busy":
        return "bg-yellow-500 text-white";
      case "offline":
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "online":
        return "status-online";
      case "busy":
        return "status-busy";
      case "offline":
      default:
        return "status-offline";
    }
  };

  const formatUptime = (lastSeen: Date | string) => {
    if (!lastSeen) return "Unknown";
    
    const now = new Date();
    const last = new Date(lastSeen);
    const diffMs = now.getTime() - last.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    } else {
      return `${diffHours}h ${Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <div key={i} className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="w-3 h-3 bg-gray-300 rounded-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1/2 h-full bg-yellow-400"></div>
          </div>
        );
      } else {
        stars.push(
          <div key={i} className="w-3 h-3 bg-gray-300 rounded-sm"></div>
        );
      }
    }
    
    return stars;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Cpu className="mr-2 w-5 h-5" />
        Node Status
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusDot(primaryNode.status)}`}></div>
            <Badge className={getStatusColor(primaryNode.status)}>
              {primaryNode.status}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Uptime</span>
          <span className="font-medium">
            {formatUptime(primaryNode.lastSeen || new Date())}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Reputation</span>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {renderStars(parseFloat(primaryNode.reputation || "4.7"))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {primaryNode.reputation || "4.7"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Hardware</span>
          <div className="text-right">
            <div className="font-medium text-sm">{primaryNode.cpuModel}</div>
            <div className="text-xs text-gray-500">{primaryNode.gpuModel}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Memory</span>
          <span className="font-medium">{primaryNode.ramGb}GB RAM</span>
        </div>

        {nodes && nodes.length > 1 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Nodes</span>
              <span className="font-medium">{nodes.length}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
