/**
 * WE1WEB Node Connection Manager
 * Manages device connections to the living neural network
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import os from 'os';
import { EventEmitter } from 'events';
import taskProcessor from './taskProcessor.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

class NodeManager extends EventEmitter {
  constructor() {
    super();
    this.connectedNodes = new Map();
    this.nodeSessions = new Map();
    this.nodeMetrics = new Map();
    this.heartbeatInterval = 30000; // 30 seconds
    this.cleanupInterval = 60000; // 1 minute
    
    this.startCleanupTimer();
  }

  /**
   * Connect a new node to the network
   */
  async connectNode(userId, deviceInfo, socketId) {
    try {
      const deviceId = this.generateDeviceId(userId, deviceInfo);
      
      // Check if node already exists
      let node = this.connectedNodes.get(deviceId);
      
      if (!node) {
        // Register new node in database
        const { data: dbNode, error } = await supabase
          .rpc('register_node', {
            p_user_id: userId,
            p_device_id: deviceId,
            p_device_info: {
              device_name: deviceInfo.name || 'Unknown Device',
              device_type: deviceInfo.type || 'desktop',
              os: deviceInfo.os || process.platform,
              cpu_cores: deviceInfo.cpu?.cores || os.cpus().length,
              cpu_speed: deviceInfo.cpu?.speed || os.cpus()[0]?.speed / 1000 || 2.4,
              memory_gb: deviceInfo.memory || os.totalmem() / (1024 ** 3),
              gpu_model: deviceInfo.gpu?.model || null,
              gpu_memory_gb: deviceInfo.gpu?.memory || null,
              bandwidth_mbps: deviceInfo.bandwidth || 100,
              location_country: deviceInfo.location?.country || 'US'
            }
          });

        if (error) throw error;

        // Create node object
        node = {
          id: deviceId,
          nodeId: dbNode,
          userId,
          socketId,
          status: 'online',
          capabilities: {
            cpu: deviceInfo.cpu?.cores || os.cpus().length,
            memory: deviceInfo.memory || os.totalmem() / (1024 ** 3),
            gpu: !!deviceInfo.gpu,
            bandwidth: deviceInfo.bandwidth || 100,
            supportedTasks: deviceInfo.supportedTasks || ['general', 'ai-training', 'rendering']
          },
          performance: {
            latency: 0,
            throughput: 0,
            reliability: 1.0,
            uptime: 0
          },
          session: {
            connectedAt: new Date(),
            lastHeartbeat: new Date(),
            tasksCompleted: 0,
            earnings: 0
          }
        };

        // Register with task processor
        taskProcessor.registerWorker(deviceId, node.capabilities);
      } else {
        // Update existing node
        node.socketId = socketId;
        node.status = 'online';
        node.session.lastHeartbeat = new Date();
      }

      // Store node
      this.connectedNodes.set(deviceId, node);
      
      // Start session tracking
      this.startNodeSession(node);
      
      // Start heartbeat monitoring
      this.startHeartbeatMonitoring(node);
      
      this.emit('node:connected', node);
      
      return {
        success: true,
        nodeId: deviceId,
        node: this.sanitizeNodeData(node)
      };
    } catch (error) {
      console.error('Error connecting node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Disconnect node from network
   */
  async disconnectNode(deviceId) {
    const node = this.connectedNodes.get(deviceId);
    
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    try {
      // Update node status in database
      await supabase
        .from('nodes')
        .update({
          status: 'offline',
          last_seen_at: new Date()
        })
        .eq('device_id', deviceId);

      // End session
      await this.endNodeSession(node);
      
      // Update local state
      node.status = 'offline';
      this.connectedNodes.delete(deviceId);
      
      // Clear metrics
      this.nodeMetrics.delete(deviceId);
      
      this.emit('node:disconnected', node);
      
      return { success: true };
    } catch (error) {
      console.error('Error disconnecting node:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle node heartbeat
   */
  async handleHeartbeat(deviceId, metrics) {
    const node = this.connectedNodes.get(deviceId);
    
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    // Update heartbeat
    node.session.lastHeartbeat = new Date();
    
    // Update metrics
    if (metrics) {
      node.performance.latency = metrics.latency || node.performance.latency;
      node.performance.throughput = metrics.throughput || node.performance.throughput;
      
      // Store detailed metrics
      this.nodeMetrics.set(deviceId, {
        timestamp: new Date(),
        cpu: metrics.cpu || {},
        memory: metrics.memory || {},
        network: metrics.network || {},
        tasks: metrics.tasks || {}
      });
    }

    // Calculate uptime
    const uptime = Date.now() - node.session.connectedAt.getTime();
    node.session.uptime = uptime;
    
    // Update reliability based on uptime
    if (uptime > 3600000) { // More than 1 hour
      node.performance.reliability = Math.min(1.0, node.performance.reliability * 1.001);
    }

    return { success: true, uptime, reliability: node.performance.reliability };
  }

  /**
   * Get node capabilities for task assignment
   */
  getNodeCapabilities(deviceId) {
    const node = this.connectedNodes.get(deviceId);
    
    if (!node) {
      return null;
    }

    return {
      ...node.capabilities,
      performance: node.performance,
      available: node.status === 'online' && !node.currentTask
    };
  }

  /**
   * Assign task to node
   */
  async assignTask(deviceId, task) {
    const node = this.connectedNodes.get(deviceId);
    
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    if (node.status !== 'online') {
      return { success: false, error: 'Node not online' };
    }

    if (node.currentTask) {
      return { success: false, error: 'Node busy' };
    }

    try {
      // Update node state
      node.currentTask = task.id;
      node.status = 'processing';
      
      // Record in database
      await supabase
        .from('tasks')
        .update({
          assigned_to: node.nodeId,
          assigned_at: new Date(),
          status: 'assigned'
        })
        .eq('task_id', task.id);

      this.emit('task:assigned', { node, task });
      
      return { success: true };
    } catch (error) {
      console.error('Error assigning task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete task on node
   */
  async completeTask(deviceId, taskId, result) {
    const node = this.connectedNodes.get(deviceId);
    
    if (!node) {
      return { success: false, error: 'Node not found' };
    }

    if (node.currentTask !== taskId) {
      return { success: false, error: 'Task mismatch' };
    }

    try {
      // Process task completion
      const completion = taskProcessor.completeTask(taskId, deviceId, result);
      
      if (completion.success) {
        // Update node stats
        node.session.tasksCompleted++;
        node.session.earnings += completion.rewards?.get(deviceId) || 0;
        node.currentTask = null;
        node.status = 'online';
        
        // Update database
        await supabase
          .from('task_completions')
          .insert({
            user_id: node.userId,
            task_id: taskId,
            task_type: 'compute',
            reward: completion.rewards?.get(deviceId) || 0,
            quality_score: node.performance.reliability
          });

        // Update user balance
        if (completion.rewards?.get(deviceId)) {
          await supabase.rpc('process_task_completion', {
            p_user_id: node.userId,
            p_task_id: taskId,
            p_task_type: 'compute',
            p_reward: completion.rewards.get(deviceId)
          });
        }

        this.emit('task:completed', { node, task: taskId, reward: completion.rewards?.get(deviceId) });
      }

      return completion;
    } catch (error) {
      console.error('Error completing task:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start node session tracking
   */
  async startNodeSession(node) {
    try {
      const { data: session } = await supabase
        .from('device_sessions')
        .insert({
          device_id: node.id,
          user_id: node.userId,
          session_start: new Date(),
          device_info: {
            capabilities: node.capabilities,
            performance: node.performance
          }
        })
        .select()
        .single();

      if (session) {
        this.nodeSessions.set(node.id, session.id);
      }
    } catch (error) {
      console.error('Error starting node session:', error);
    }
  }

  /**
   * End node session
   */
  async endNodeSession(node) {
    const sessionId = this.nodeSessions.get(node.id);
    
    if (!sessionId) return;

    try {
      await supabase
        .from('device_sessions')
        .update({
          session_end: new Date(),
          tasks_completed: node.session.tasksCompleted,
          earnings: node.session.earnings
        })
        .eq('id', sessionId);

      this.nodeSessions.delete(node.id);
    } catch (error) {
      console.error('Error ending node session:', error);
    }
  }

  /**
   * Start heartbeat monitoring for node
   */
  startHeartbeatMonitoring(node) {
    const checkHeartbeat = () => {
      const now = Date.now();
      const lastHeartbeat = node.session.lastHeartbeat.getTime();
      
      if (now - lastHeartbeat > this.heartbeatInterval * 2) {
        // Node is unresponsive
        console.log(`Node ${node.id} is unresponsive`);
        this.disconnectNode(node.id);
      }
    };

    // Check every interval
    const intervalId = setInterval(checkHeartbeat, this.heartbeatInterval);
    
    // Store interval ID for cleanup
    node.heartbeatInterval = intervalId;
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId(userId, deviceInfo) {
    const data = `${userId}-${deviceInfo.name || 'device'}-${deviceInfo.mac || Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Sanitize node data for client
   */
  sanitizeNodeData(node) {
    return {
      id: node.id,
      status: node.status,
      capabilities: node.capabilities,
      performance: node.performance,
      session: {
        connectedAt: node.session.connectedAt,
        tasksCompleted: node.session.tasksCompleted,
        earnings: node.session.earnings,
        uptime: node.session.uptime
      }
    };
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    const nodes = Array.from(this.connectedNodes.values());
    
    return {
      totalNodes: nodes.length,
      onlineNodes: nodes.filter(n => n.status === 'online').length,
      processingNodes: nodes.filter(n => n.status === 'processing').length,
      totalCapacity: {
        cpu: nodes.reduce((sum, n) => sum + n.capabilities.cpu, 0),
        memory: nodes.reduce((sum, n) => sum + n.capabilities.memory, 0),
        gpu: nodes.filter(n => n.capabilities.gpu).length
      },
      performance: {
        averageReliability: nodes.reduce((sum, n) => sum + n.performance.reliability, 0) / nodes.length || 0,
        totalTasksCompleted: nodes.reduce((sum, n) => sum + n.session.tasksCompleted, 0),
        totalEarnings: nodes.reduce((sum, n) => sum + n.session.earnings, 0)
      }
    };
  }

  /**
   * Cleanup disconnected nodes
   */
  startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      
      for (const [deviceId, node] of this.connectedNodes.entries()) {
        const lastSeen = node.session.lastHeartbeat.getTime();
        
        if (now - lastSeen > this.cleanupInterval * 2) {
          console.log(`Cleaning up disconnected node: ${deviceId}`);
          this.disconnectNode(deviceId);
        }
      }
    }, this.cleanupInterval);
  }

  /**
   * Get nodes by user
   */
  getNodesByUser(userId) {
    return Array.from(this.connectedNodes.values())
      .filter(node => node.userId === userId)
      .map(node => this.sanitizeNodeData(node));
  }
}

export default new NodeManager();