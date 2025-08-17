/**
 * WE1WEB Task Processing System
 * Core engine for distributing and executing compute tasks across the neural network
 */

import crypto from 'crypto';
import EventEmitter from 'events';

class TaskProcessor extends EventEmitter {
  constructor() {
    super();
    this.activeTasks = new Map();
    this.taskQueue = [];
    this.workers = new Map();
    this.taskResults = new Map();
  }

  /**
   * Create a new compute task
   */
  createTask(taskData) {
    const taskId = crypto.randomBytes(16).toString('hex');
    
    const task = {
      id: taskId,
      type: taskData.type || 'general',
      priority: taskData.priority || 'medium',
      payload: taskData.payload,
      requirements: {
        minCpu: taskData.requirements?.cpu || 2,
        minMemory: taskData.requirements?.memory || 4,
        minBandwidth: taskData.requirements?.bandwidth || 10,
        gpu: taskData.requirements?.gpu || false,
      },
      reward: taskData.reward || 0.001,
      status: 'pending',
      createdAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      validationThreshold: 0.66,
      validators: [],
      results: []
    };

    this.taskQueue.push(task);
    this.emit('task:created', task);
    
    // Immediately try to assign
    this.assignTaskToWorker(task);
    
    return task;
  }

  /**
   * Register a worker node
   */
  registerWorker(workerId, capabilities) {
    const worker = {
      id: workerId,
      capabilities: {
        cpu: capabilities.cpu || 2,
        memory: capabilities.memory || 4,
        bandwidth: capabilities.bandwidth || 10,
        gpu: capabilities.gpu || false,
        supportedTasks: capabilities.supportedTasks || ['general']
      },
      status: 'idle',
      currentTask: null,
      tasksCompleted: 0,
      reliability: 1.0,
      joinedAt: new Date()
    };

    this.workers.set(workerId, worker);
    this.emit('worker:registered', worker);
    
    // Try to assign pending tasks
    this.processPendingTasks();
    
    return worker;
  }

  /**
   * Find suitable worker for a task
   */
  findSuitableWorker(task) {
    const availableWorkers = Array.from(this.workers.values())
      .filter(worker => {
        return worker.status === 'idle' &&
               worker.capabilities.cpu >= task.requirements.minCpu &&
               worker.capabilities.memory >= task.requirements.minMemory &&
               worker.capabilities.bandwidth >= task.requirements.minBandwidth &&
               (!task.requirements.gpu || worker.capabilities.gpu) &&
               worker.capabilities.supportedTasks.includes(task.type);
      })
      .sort((a, b) => b.reliability - a.reliability);

    return availableWorkers[0] || null;
  }

  /**
   * Assign task to worker
   */
  assignTaskToWorker(task) {
    const worker = this.findSuitableWorker(task);
    
    if (!worker) {
      console.log(`No suitable worker found for task ${task.id}`);
      return false;
    }

    // Update task
    task.status = 'assigned';
    task.assignedTo = worker.id;
    task.assignedAt = new Date();
    
    // Update worker
    worker.status = 'busy';
    worker.currentTask = task.id;
    
    // Store active task
    this.activeTasks.set(task.id, task);
    
    // Remove from queue
    const queueIndex = this.taskQueue.findIndex(t => t.id === task.id);
    if (queueIndex > -1) {
      this.taskQueue.splice(queueIndex, 1);
    }
    
    this.emit('task:assigned', { task, worker });
    
    // Start execution timeout
    this.startTaskTimeout(task.id);
    
    return true;
  }

  /**
   * Process pending tasks in queue
   */
  processPendingTasks() {
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending');
    
    for (const task of pendingTasks) {
      if (this.assignTaskToWorker(task)) {
        console.log(`Task ${task.id} assigned successfully`);
      }
    }
  }

  /**
   * Handle task completion
   */
  completeTask(taskId, workerId, result) {
    const task = this.activeTasks.get(taskId);
    const worker = this.workers.get(workerId);
    
    if (!task || !worker) {
      return { success: false, error: 'Invalid task or worker' };
    }

    // Store result for validation
    task.results.push({
      workerId,
      result,
      timestamp: new Date()
    });

    // Check if we need more validators
    if (task.results.length < Math.ceil(3 * task.validationThreshold)) {
      // Assign to another worker for validation
      task.status = 'validating';
      this.assignValidatorToTask(task);
      return { success: true, status: 'validating' };
    }

    // Validate results
    const validation = this.validateResults(task);
    
    if (validation.consensus) {
      // Task completed successfully
      task.status = 'completed';
      task.completedAt = new Date();
      task.finalResult = validation.result;
      
      // Update worker stats
      worker.tasksCompleted++;
      worker.reliability = Math.min(1.0, worker.reliability * 1.01);
      
      // Calculate rewards
      const rewards = this.calculateRewards(task);
      
      // Clean up
      this.activeTasks.delete(taskId);
      worker.status = 'idle';
      worker.currentTask = null;
      
      this.emit('task:completed', { task, rewards });
      
      // Process next tasks
      this.processPendingTasks();
      
      return { success: true, status: 'completed', result: task.finalResult, rewards };
    } else {
      // No consensus, retry
      task.attempts++;
      
      if (task.attempts >= task.maxAttempts) {
        task.status = 'failed';
        task.failedAt = new Date();
        
        // Penalize unreliable workers
        for (const result of task.results) {
          const w = this.workers.get(result.workerId);
          if (w) {
            w.reliability = Math.max(0.5, w.reliability * 0.95);
          }
        }
        
        this.activeTasks.delete(taskId);
        worker.status = 'idle';
        worker.currentTask = null;
        
        this.emit('task:failed', task);
        
        return { success: false, status: 'failed', error: 'No consensus after retries' };
      }
      
      // Retry with new workers
      task.status = 'pending';
      task.results = [];
      this.taskQueue.push(task);
      
      worker.status = 'idle';
      worker.currentTask = null;
      
      this.processPendingTasks();
      
      return { success: true, status: 'retrying' };
    }
  }

  /**
   * Validate task results using consensus
   */
  validateResults(task) {
    if (task.results.length === 0) {
      return { consensus: false };
    }

    // Group results by similarity
    const resultGroups = new Map();
    
    for (const { workerId, result } of task.results) {
      const resultHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(result))
        .digest('hex');
      
      if (!resultGroups.has(resultHash)) {
        resultGroups.set(resultHash, {
          result,
          workers: [],
          count: 0
        });
      }
      
      const group = resultGroups.get(resultHash);
      group.workers.push(workerId);
      group.count++;
    }

    // Find consensus
    const threshold = Math.ceil(task.results.length * task.validationThreshold);
    
    for (const group of resultGroups.values()) {
      if (group.count >= threshold) {
        return {
          consensus: true,
          result: group.result,
          workers: group.workers,
          confidence: group.count / task.results.length
        };
      }
    }

    return { consensus: false };
  }

  /**
   * Calculate rewards for completed task
   */
  calculateRewards(task) {
    const baseReward = task.reward;
    const validation = this.validateResults(task);
    const rewards = new Map();

    if (!validation.consensus) {
      return rewards;
    }

    // Reward workers who contributed to consensus
    for (const workerId of validation.workers) {
      const worker = this.workers.get(workerId);
      if (worker) {
        const workerReward = baseReward * worker.reliability;
        rewards.set(workerId, workerReward);
      }
    }

    return rewards;
  }

  /**
   * Assign validator to task
   */
  assignValidatorToTask(task) {
    // Find workers who haven't validated this task yet
    const validatedWorkers = new Set(task.results.map(r => r.workerId));
    
    const validator = Array.from(this.workers.values())
      .filter(w => 
        w.status === 'idle' && 
        !validatedWorkers.has(w.id) &&
        w.capabilities.supportedTasks.includes(task.type)
      )
      .sort((a, b) => b.reliability - a.reliability)[0];

    if (validator) {
      validator.status = 'validating';
      validator.currentTask = task.id;
      task.validators.push(validator.id);
      
      this.emit('task:validation', { task, validator });
      
      // Set validation timeout
      setTimeout(() => {
        if (validator.currentTask === task.id) {
          validator.status = 'idle';
          validator.currentTask = null;
          this.completeTask(task.id, validator.id, null);
        }
      }, 30000); // 30 second timeout
    }
  }

  /**
   * Start timeout for task execution
   */
  startTaskTimeout(taskId, timeout = 300000) { // 5 minutes default
    setTimeout(() => {
      const task = this.activeTasks.get(taskId);
      if (task && task.status === 'assigned') {
        const worker = this.workers.get(task.assignedTo);
        if (worker) {
          worker.reliability = Math.max(0.5, worker.reliability * 0.9);
          worker.status = 'idle';
          worker.currentTask = null;
        }
        
        task.status = 'pending';
        task.attempts++;
        this.activeTasks.delete(taskId);
        
        if (task.attempts < task.maxAttempts) {
          this.taskQueue.push(task);
          this.processPendingTasks();
        } else {
          task.status = 'failed';
          this.emit('task:failed', task);
        }
      }
    }, timeout);
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      totalWorkers: this.workers.size,
      activeWorkers: Array.from(this.workers.values()).filter(w => w.status === 'busy').length,
      pendingTasks: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: Array.from(this.taskResults.values()).length,
      averageReliability: Array.from(this.workers.values())
        .reduce((sum, w) => sum + w.reliability, 0) / this.workers.size || 0
    };
  }
}

export default new TaskProcessor();