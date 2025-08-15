import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Task } from "@shared/schema";
import { Clock, Cpu, DollarSign, Play, Pause, Square } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
  onStatusChange?: (taskId: string, status: string) => void;
  variant?: "provider" | "developer";
}

export default function TaskCard({ task, onStatusChange, variant = "provider" }: TaskCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent";
      case "running":
        return "bg-primary/10 text-primary";
      case "failed":
        return "bg-red-100 text-red-600";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Play className="w-4 h-4" />;
      case "completed":
        return <Square className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return <Pause className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateEarnings = (computeHours: number, ratePerHour: number = 6.5) => {
    return (computeHours * ratePerHour).toFixed(2);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{task.name}</h4>
          <p className="text-xs text-gray-600">
            {task.modelType} • {task.taskType}
          </p>
        </div>
        
        <Badge className={getStatusColor(task.status)}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(task.status)}
            <span className="capitalize">{task.status}</span>
          </div>
        </Badge>
      </div>

      {/* Progress Bar */}
      {task.status === "running" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={parseFloat(task.progress || "0")} className="h-2" />
        </div>
      )}

      {/* Task Details */}
      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
        <div className="flex items-center space-x-1">
          <Cpu className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">Nodes:</span>
          <span className="font-medium">{task.requiredNodes || 1}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-gray-600">
            {task.status === "completed" ? "Duration:" : "Est:"}
          </span>
          <span className="font-medium">
            {task.estimatedDuration ? formatDuration(task.estimatedDuration) : "N/A"}
          </span>
        </div>

        {variant === "provider" && (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Earnings:</span>
            <span className="font-medium text-accent">
              ${calculateEarnings(parseFloat(task.totalComputeHours || "0"))}
            </span>
          </div>
        )}

        {variant === "developer" && (
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3 text-gray-400" />
            <span className="text-gray-600">Cost:</span>
            <span className="font-medium">
              ${task.tokenCost || task.maxBudget || "0"}
            </span>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="text-xs text-gray-500 mb-3">
        {task.status === "completed" && task.completedAt ? (
          <span>Completed {formatDistanceToNow(new Date(task.completedAt))} ago</span>
        ) : task.status === "running" && task.startedAt ? (
          <span>Started {formatDistanceToNow(new Date(task.startedAt))} ago</span>
        ) : (
          <span>Created {formatDistanceToNow(new Date(task.createdAt))} ago</span>
        )}
      </div>

      {/* Action Buttons */}
      {onStatusChange && (
        <div className="flex space-x-2">
          {task.status === "pending" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(task.id, "running")}
              className="flex-1"
            >
              Start
            </Button>
          )}
          
          {task.status === "running" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(task.id, "cancelled")}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          
          {task.status === "completed" && variant === "developer" && (
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
            >
              Download
            </Button>
          )}
          
          {task.status === "failed" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(task.id, "pending")}
              className="flex-1"
            >
              Retry
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
