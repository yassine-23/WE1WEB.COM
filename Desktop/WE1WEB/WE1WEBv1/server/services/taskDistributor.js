/**
 * WE1WEB Task Distribution Algorithm
 * Intelligent task allocation across the neural network
 */

import nodeManager from './nodeManager.js';
import taskProcessor from './taskProcessor.js';
import webrtcManager from './webrtcManager.js';

class TaskDistributor {
  constructor() {
    this.distributionStrategies = {
      'round-robin': this.roundRobinDistribution.bind(this),
      'load-balanced': this.loadBalancedDistribution.bind(this),
      'capability-matched': this.capabilityMatchedDistribution.bind(this),
      'locality-aware': this.localityAwareDistribution.bind(this),
      'reliability-weighted': this.reliabilityWeightedDistribution.bind(this),
      'cost-optimized': this.costOptimizedDistribution.bind(this)
    };
    
    this.currentStrategy = 'reliability-weighted';
    this.roundRobinIndex = 0;
    this.taskHistory = new Map();
    this.nodeLoadMap = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Main distribution method
   */
  async distributeTask(task) {
    try {
      // Get available nodes
      const availableNodes = this.getAvailableNodes();
      
      if (availableNodes.length === 0) {
        return {
          success: false,
          error: 'No available nodes'
        };
      }

      // Apply selected distribution strategy
      const strategy = this.distributionStrategies[this.currentStrategy];
      const selectedNode = await strategy(task, availableNodes);
      
      if (!selectedNode) {
        return {
          success: false,
          error: 'No suitable node found'
        };
      }

      // Assign task to selected node
      const assignment = await this.assignTaskToNode(selectedNode, task);
      
      if (assignment.success) {
        // Track distribution metrics
        this.trackDistribution(task, selectedNode);
        
        return {
          success: true,
          node: selectedNode,
          strategy: this.currentStrategy
        };
      }

      return assignment;
    } catch (error) {
      console.error('Error distributing task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Round-robin distribution
   */
  async roundRobinDistribution(task, nodes) {
    const eligibleNodes = nodes.filter(node => 
      this.isNodeEligible(node, task)
    );
    
    if (eligibleNodes.length === 0) return null;
    
    const selected = eligibleNodes[this.roundRobinIndex % eligibleNodes.length];
    this.roundRobinIndex++;
    
    return selected;
  }

  /**
   * Load-balanced distribution
   */
  async loadBalancedDistribution(task, nodes) {
    // Calculate load for each node
    const nodeLoads = nodes.map(node => {
      const load = this.nodeLoadMap.get(node.id) || {
        activeTasks: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        queueLength: 0
      };
      
      return {
        node,
        score: this.calculateLoadScore(load)
      };
    });

    // Sort by load score (lower is better)
    nodeLoads.sort((a, b) => a.score - b.score);
    
    // Find first eligible node
    for (const { node } of nodeLoads) {
      if (this.isNodeEligible(node, task)) {
        return node;
      }
    }
    
    return null;
  }

  /**
   * Capability-matched distribution
   */
  async capabilityMatchedDistribution(task, nodes) {
    // Score nodes based on capability match
    const scoredNodes = nodes.map(node => ({
      node,
      score: this.calculateCapabilityScore(node, task)
    }));

    // Sort by capability score (higher is better)
    scoredNodes.sort((a, b) => b.score - a.score);
    
    // Return best matching node
    const bestMatch = scoredNodes[0];
    return bestMatch && bestMatch.score > 0 ? bestMatch.node : null;
  }

  /**
   * Locality-aware distribution
   */
  async localityAwareDistribution(task, nodes) {
    // Get task origin location (if applicable)
    const taskLocation = task.metadata?.location || { country: 'US' };
    
    // Score nodes based on proximity
    const scoredNodes = nodes.map(node => {
      const distance = this.calculateDistance(node.location, taskLocation);
      return {
        node,
        distance,
        score: this.isNodeEligible(node, task) ? 1000 - distance : -1
      };
    });

    // Sort by distance (closer is better)
    scoredNodes.sort((a, b) => b.score - a.score);
    
    return scoredNodes[0]?.score > 0 ? scoredNodes[0].node : null;
  }

  /**
   * Reliability-weighted distribution
   */
  async reliabilityWeightedDistribution(task, nodes) {
    // Filter eligible nodes
    const eligibleNodes = nodes.filter(node => 
      this.isNodeEligible(node, task)
    );
    
    if (eligibleNodes.length === 0) return null;
    
    // Calculate weighted scores
    const weightedNodes = eligibleNodes.map(node => {
      const reliability = node.performance?.reliability || 0.5;
      const uptime = node.session?.uptime || 0;
      const completionRate = this.getNodeCompletionRate(node.id);
      const latency = node.performance?.latency || 1000;
      
      // Weighted score calculation
      const score = 
        reliability * 0.4 +
        Math.min(uptime / 3600000, 1) * 0.2 + // Normalize uptime to 1 hour
        completionRate * 0.3 +
        (1 - Math.min(latency / 1000, 1)) * 0.1; // Normalize latency to 1 second
      
      return { node, score };
    });

    // Sort by weighted score
    weightedNodes.sort((a, b) => b.score - a.score);
    
    // Select based on weighted probability
    return this.selectWeightedRandom(weightedNodes);
  }

  /**
   * Cost-optimized distribution
   */
  async costOptimizedDistribution(task, nodes) {
    // Calculate cost for each node
    const costedNodes = nodes.map(node => {
      if (!this.isNodeEligible(node, task)) {
        return { node, cost: Infinity };
      }
      
      const baseCost = task.reward || 0.001;
      const reliabilityMultiplier = 2 - (node.performance?.reliability || 1);
      const speedMultiplier = node.capabilities?.cpu ? 1 / node.capabilities.cpu : 1;
      
      const cost = baseCost * reliabilityMultiplier * speedMultiplier;
      
      return { node, cost };
    });

    // Sort by cost (lower is better)
    costedNodes.sort((a, b) => a.cost - b.cost);
    
    return costedNodes[0]?.cost < Infinity ? costedNodes[0].node : null;
  }

  /**
   * Check if node is eligible for task
   */
  isNodeEligible(node, task) {
    // Check node status
    if (node.status !== 'online' || node.currentTask) {
      return false;
    }

    // Check capabilities
    const caps = node.capabilities || {};
    const reqs = task.requirements || {};
    
    if (caps.cpu < (reqs.minCpu || 0)) return false;
    if (caps.memory < (reqs.minMemory || 0)) return false;
    if (caps.bandwidth < (reqs.minBandwidth || 0)) return false;
    if (reqs.gpu && !caps.gpu) return false;
    
    // Check supported task types
    if (caps.supportedTasks && !caps.supportedTasks.includes(task.type)) {
      return false;
    }

    // Check reliability threshold
    const minReliability = task.requirements?.minReliability || 0.5;
    if ((node.performance?.reliability || 1) < minReliability) {
      return false;
    }

    return true;
  }

  /**
   * Assign task to node
   */
  async assignTaskToNode(node, task) {
    try {
      // Use WebRTC for P2P task distribution
      const webrtcResult = await webrtcManager.sendTask(node.id, task);
      
      if (webrtcResult.success) {
        // Update node load
        const load = this.nodeLoadMap.get(node.id) || {
          activeTasks: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          queueLength: 0
        };
        
        load.activeTasks++;
        load.queueLength++;
        this.nodeLoadMap.set(node.id, load);
        
        // Record assignment
        await nodeManager.assignTask(node.id, task);
        
        return { success: true };
      }
      
      return webrtcResult;
    } catch (error) {
      console.error('Error assigning task to node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get available nodes
   */
  getAvailableNodes() {
    const networkStats = nodeManager.getNetworkStats();
    const connectedNodes = Array.from(nodeManager.connectedNodes.values());
    
    return connectedNodes.filter(node => 
      node.status === 'online' && 
      !node.currentTask
    );
  }

  /**
   * Calculate load score
   */
  calculateLoadScore(load) {
    return (
      load.activeTasks * 10 +
      load.cpuUsage * 5 +
      load.memoryUsage * 3 +
      load.queueLength * 2
    );
  }

  /**
   * Calculate capability score
   */
  calculateCapabilityScore(node, task) {
    let score = 0;
    
    const caps = node.capabilities || {};
    const reqs = task.requirements || {};
    
    // CPU score
    if (caps.cpu >= reqs.minCpu) {
      score += Math.min(caps.cpu / (reqs.minCpu || 1), 2) * 25;
    }
    
    // Memory score
    if (caps.memory >= reqs.minMemory) {
      score += Math.min(caps.memory / (reqs.minMemory || 1), 2) * 25;
    }
    
    // GPU bonus
    if (reqs.gpu && caps.gpu) {
      score += 30;
    }
    
    // Task type match
    if (caps.supportedTasks?.includes(task.type)) {
      score += 20;
    }
    
    return score;
  }

  /**
   * Calculate distance between locations
   */
  calculateDistance(loc1, loc2) {
    // Simplified distance calculation
    // In production, use proper geolocation distance
    if (!loc1 || !loc2) return 1000;
    
    if (loc1.country === loc2.country) {
      if (loc1.city === loc2.city) return 10;
      return 100;
    }
    
    // Different countries
    return 500;
  }

  /**
   * Get node completion rate
   */
  getNodeCompletionRate(nodeId) {
    const history = this.taskHistory.get(nodeId) || {
      completed: 0,
      failed: 0,
      total: 0
    };
    
    if (history.total === 0) return 0.5; // Default for new nodes
    
    return history.completed / history.total;
  }

  /**
   * Select weighted random node
   */
  selectWeightedRandom(weightedNodes) {
    if (weightedNodes.length === 0) return null;
    
    // Calculate total weight
    const totalWeight = weightedNodes.reduce((sum, n) => sum + n.score, 0);
    
    if (totalWeight === 0) return weightedNodes[0].node;
    
    // Random selection
    let random = Math.random() * totalWeight;
    
    for (const { node, score } of weightedNodes) {
      random -= score;
      if (random <= 0) {
        return node;
      }
    }
    
    return weightedNodes[weightedNodes.length - 1].node;
  }

  /**
   * Track distribution metrics
   */
  trackDistribution(task, node) {
    // Update task history
    const history = this.taskHistory.get(node.id) || {
      completed: 0,
      failed: 0,
      total: 0
    };
    
    history.total++;
    this.taskHistory.set(node.id, history);
    
    // Track performance metrics
    const metrics = this.performanceMetrics.get(task.type) || {
      totalTasks: 0,
      averageTime: 0,
      successRate: 0
    };
    
    metrics.totalTasks++;
    this.performanceMetrics.set(task.type, metrics);
  }

  /**
   * Update task outcome
   */
  updateTaskOutcome(nodeId, taskId, success) {
    const history = this.taskHistory.get(nodeId);
    
    if (history) {
      if (success) {
        history.completed++;
      } else {
        history.failed++;
      }
      this.taskHistory.set(nodeId, history);
    }
    
    // Update node load
    const load = this.nodeLoadMap.get(nodeId);
    if (load) {
      load.activeTasks = Math.max(0, load.activeTasks - 1);
      load.queueLength = Math.max(0, load.queueLength - 1);
      this.nodeLoadMap.set(nodeId, load);
    }
  }

  /**
   * Get distribution statistics
   */
  getDistributionStats() {
    return {
      currentStrategy: this.currentStrategy,
      taskHistory: Array.from(this.taskHistory.entries()).map(([nodeId, history]) => ({
        nodeId,
        ...history,
        completionRate: history.total > 0 ? history.completed / history.total : 0
      })),
      performanceMetrics: Object.fromEntries(this.performanceMetrics),
      nodeLoads: Array.from(this.nodeLoadMap.entries()).map(([nodeId, load]) => ({
        nodeId,
        ...load
      }))
    };
  }

  /**
   * Set distribution strategy
   */
  setStrategy(strategy) {
    if (this.distributionStrategies[strategy]) {
      this.currentStrategy = strategy;
      return { success: true };
    }
    
    return {
      success: false,
      error: 'Invalid strategy'
    };
  }

  /**
   * Optimize distribution based on metrics
   */
  optimizeDistribution() {
    // Analyze performance metrics
    const stats = this.getDistributionStats();
    
    // Calculate average completion rates
    const avgCompletionRate = stats.taskHistory.reduce(
      (sum, h) => sum + h.completionRate, 0
    ) / stats.taskHistory.length || 0;
    
    // Switch strategy based on performance
    if (avgCompletionRate < 0.7) {
      // Low completion rate, use reliability-weighted
      this.currentStrategy = 'reliability-weighted';
    } else if (stats.nodeLoads.some(l => l.activeTasks > 5)) {
      // High load, use load-balanced
      this.currentStrategy = 'load-balanced';
    } else {
      // Good performance, optimize for cost
      this.currentStrategy = 'cost-optimized';
    }
    
    console.log(`Distribution strategy optimized to: ${this.currentStrategy}`);
  }
}

export default new TaskDistributor();