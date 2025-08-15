import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";

interface TaskExecutionStatus {
  taskId: string;
  status: "queued" | "assigned" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  assignments: TaskAssignment[];
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  cost: {
    estimated: number;
    actual?: number;
    currency: string;
  };
  logs: TaskLog[];
  metrics?: {
    cpuHours: number;
    ramGbHours: number;
    gpuHours?: number;
    networkGb: number;
  };
}

interface TaskAssignment {
  id: string;
  deviceId: string;
  deviceName: string;
  status: "assigned" | "running" | "completed" | "failed";
  progress: number;
  computeHours: number;
  tokensEarned: number;
  lastHeartbeat?: Date;
}

interface TaskLog {
  timestamp: Date;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  deviceId?: string;
}

interface TaskSubmissionData {
  name: string;
  description: string;
  type: "training" | "inference" | "preprocessing";
  framework: string;
  requirements: {
    cpuCores: number;
    ramGb: number;
    gpuVramGb?: number;
    estimatedDurationMinutes: number;
    priority: number;
  };
  modelConfig?: any;
  datasetConfig?: any;
  trainingParams?: any;
  budget: {
    maxCost: number;
    currency: string;
  };
}

export function useTaskExecution() {
  const [tasks, setTasks] = useState<Record<string, TaskExecutionStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, isConnected } = useWebSocket();

  // Subscribe to task progress updates via WebSocket
  useEffect(() => {
    const handleTaskProgress = (data: any) => {
      if (data.type === "task_progress") {
        const { taskId, progress, logs } = data.payload;
        setTasks(prev => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            progress,
            logs: logs ? [...(prev[taskId]?.logs || []), ...logs] : prev[taskId]?.logs || [],
          },
        }));
      }
    };

    // In a real implementation, this would listen to WebSocket messages
    // For now, we'll simulate with polling
    return () => {};
  }, []);

  // Submit a new task
  const submitTask = useCallback(async (taskData: TaskSubmissionData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit task: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Add new task to tracking
        const newTask: TaskExecutionStatus = {
          taskId: result.taskId,
          status: "queued",
          progress: 0,
          assignments: [],
          cost: {
            estimated: result.estimatedCost || 0,
            currency: taskData.budget.currency,
          },
          logs: [],
          estimatedCompletion: result.estimatedCompletion ? new Date(result.estimatedCompletion) : undefined,
        };

        setTasks(prev => ({
          ...prev,
          [result.taskId]: newTask,
        }));

        return { success: true, taskId: result.taskId };
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit task";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Get task status
  const getTaskStatus = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`);
      if (!response.ok) {
        throw new Error(`Failed to get task status: ${response.statusText}`);
      }

      const status = await response.json();
      
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          ...status,
          estimatedCompletion: status.estimatedCompletion ? new Date(status.estimatedCompletion) : undefined,
          actualCompletion: status.actualCompletion ? new Date(status.actualCompletion) : undefined,
        },
      }));

      return status;
    } catch (err) {
      console.error("Error getting task status:", err);
      return null;
    }
  }, []);

  // Cancel a task
  const cancelTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel task: ${response.statusText}`);
      }

      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          status: "cancelled",
        },
      }));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to cancel task";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Get task logs
  const getTaskLogs = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/logs`);
      if (!response.ok) {
        throw new Error(`Failed to get task logs: ${response.statusText}`);
      }

      const logs = await response.json();
      
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          logs: logs.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })),
        },
      }));

      return logs;
    } catch (err) {
      console.error("Error getting task logs:", err);
      return [];
    }
  }, []);

  // Get user's task history
  const getTaskHistory = useCallback(async (limit = 20) => {
    try {
      const response = await fetch(`/api/tasks?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to get task history: ${response.statusText}`);
      }

      const history = await response.json();
      
      // Update tasks state with history
      const taskMap: Record<string, TaskExecutionStatus> = {};
      for (const task of history) {
        taskMap[task.taskId] = {
          ...task,
          estimatedCompletion: task.estimatedCompletion ? new Date(task.estimatedCompletion) : undefined,
          actualCompletion: task.actualCompletion ? new Date(task.actualCompletion) : undefined,
          logs: task.logs?.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })) || [],
        };
      }

      setTasks(prev => ({ ...prev, ...taskMap }));
      return history;
    } catch (err) {
      console.error("Error getting task history:", err);
      return [];
    }
  }, []);

  // Get task cost estimate
  const getTaskCostEstimate = useCallback(async (taskData: Partial<TaskSubmissionData>) => {
    try {
      const response = await fetch("/api/tasks/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        throw new Error(`Failed to get cost estimate: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error("Error getting cost estimate:", err);
      return null;
    }
  }, []);

  // Pause a running task
  const pauseTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/pause`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to pause task: ${response.statusText}`);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to pause task";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Resume a paused task
  const resumeTask = useCallback(async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/resume`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Failed to resume task: ${response.statusText}`);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resume task";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Auto-refresh task statuses
  useEffect(() => {
    const activeTaskIds = Object.keys(tasks).filter(
      taskId => tasks[taskId].status === "running" || tasks[taskId].status === "queued"
    );

    if (activeTaskIds.length === 0) return;

    const interval = setInterval(() => {
      activeTaskIds.forEach(taskId => {
        getTaskStatus(taskId);
      });
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [tasks, getTaskStatus]);

  // Calculate total statistics
  const stats = {
    totalTasks: Object.keys(tasks).length,
    runningTasks: Object.values(tasks).filter(t => t.status === "running").length,
    completedTasks: Object.values(tasks).filter(t => t.status === "completed").length,
    failedTasks: Object.values(tasks).filter(t => t.status === "failed").length,
    totalCost: Object.values(tasks).reduce((sum, task) => sum + (task.cost.actual || task.cost.estimated), 0),
    totalComputeHours: Object.values(tasks).reduce((sum, task) => sum + (task.metrics?.cpuHours || 0), 0),
  };

  return {
    tasks: Object.values(tasks),
    taskById: (id: string) => tasks[id],
    stats,
    isSubmitting,
    error,
    isConnected,
    
    // Actions
    submitTask,
    getTaskStatus,
    cancelTask,
    pauseTask,
    resumeTask,
    getTaskLogs,
    getTaskHistory,
    getTaskCostEstimate,
    
    // Utilities
    clearError: () => setError(null),
  };
}