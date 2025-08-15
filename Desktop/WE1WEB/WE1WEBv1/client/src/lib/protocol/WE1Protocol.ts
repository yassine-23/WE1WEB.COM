/**
 * WE1Protocol - Distributed Computing Protocol for WE1WEB Network
 * Enables P2P device connection, task distribution, and data generation
 */

import { io, Socket } from 'socket.io-client';
import { getRTCConfiguration } from '@/config/webrtc';

// Task types that generate valuable AI training data
export enum ComputeTaskType {
  // High-value data generation tasks
  HUMAN_FEEDBACK = 'human_feedback',           // RLHF data collection
  SYNTHETIC_CONVERSATIONS = 'synthetic_conv',   // Generate diverse dialogues
  CODE_REVIEW = 'code_review',                 // Code quality assessment
  MULTIMODAL_ANNOTATION = 'multimodal',        // Image/video descriptions
  FACT_VERIFICATION = 'fact_check',            // Verify claims with sources
  EDGE_CASE_DISCOVERY = 'edge_cases',          // Find AI model limitations
  TRANSLATION_PAIRS = 'translation',           // Multilingual datasets
  SAFETY_TESTING = 'safety_test',              // Red-teaming scenarios
  PREFERENCE_LEARNING = 'preferences',         // A/B testing responses
  KNOWLEDGE_GRAPHS = 'knowledge_graph'         // Structured data extraction
}

// Device capabilities
export interface DeviceCapabilities {
  deviceId: string;
  deviceType: 'desktop' | 'laptop' | 'mobile' | 'server';
  os: string;
  cpu: {
    cores: number;
    speed: number; // GHz
    model: string;
  };
  memory: {
    total: number; // GB
    available: number;
  };
  gpu?: {
    model: string;
    memory: number; // GB
    cuda: boolean;
  };
  network: {
    bandwidth: number; // Mbps
    latency: number; // ms
    natType: 'open' | 'moderate' | 'strict';
  };
  availability: {
    schedule: Array<{ start: string; end: string }>;
    reliability: number; // 0-100%
  };
}

// Pool configuration
export interface PoolConfig {
  poolId: string;
  name: string;
  minDevices: number;
  taskTypes: ComputeTaskType[];
  consensusThreshold: number; // % agreement needed
  rewardDistribution: 'equal' | 'proportional' | 'performance';
  governanceModel: 'democratic' | 'stake-weighted' | 'reputation';
}

// Task definition
export interface ComputeTask {
  taskId: string;
  type: ComputeTaskType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: any;
  requirements: {
    minCpu: number;
    minMemory: number;
    minBandwidth: number;
    gpuRequired: boolean;
  };
  reward: {
    base: number; // Base reward in tokens
    bonus: number; // Quality bonus
    deadline: Date;
  };
  validation: {
    method: 'consensus' | 'oracle' | 'proof';
    threshold: number;
  };
}

export class WE1Protocol {
  private socket: Socket | null = null;
  private peers: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  private capabilities: DeviceCapabilities | null = null;
  private currentPool: PoolConfig | null = null;
  private activeTasks: Map<string, ComputeTask> = new Map();
  
  // WebRTC configuration for optimal P2P connection
  private rtcConfig: RTCConfiguration = getRTCConfiguration();

  constructor() {
    this.initializeDevice();
  }

  /**
   * Initialize device capabilities detection
   */
  private async initializeDevice(): Promise<void> {
    this.capabilities = await this.detectCapabilities();
  }

  /**
   * Detect device capabilities
   */
  private async detectCapabilities(): Promise<DeviceCapabilities> {
    const deviceId = this.generateDeviceId();
    
    // Detect CPU
    const cores = navigator.hardwareConcurrency || 4;
    
    // Detect memory (requires permissions in some browsers)
    // @ts-ignore - navigator.deviceMemory is not in TypeScript types
    const memory = navigator.deviceMemory || 8;
    
    // Detect network speed
    const bandwidth = await this.measureBandwidth();
    const latency = await this.measureLatency();
    
    // Detect GPU (WebGL-based detection)
    const gpu = this.detectGPU();
    
    return {
      deviceId,
      deviceType: this.detectDeviceType(),
      os: this.detectOS(),
      cpu: {
        cores,
        speed: 2.5, // Estimated average
        model: 'Unknown'
      },
      memory: {
        total: memory,
        available: memory * 0.5 // Assume 50% available
      },
      gpu,
      network: {
        bandwidth,
        latency,
        natType: 'moderate' // Will be determined by STUN
      },
      availability: {
        schedule: this.getDefaultSchedule(),
        reliability: 95
      }
    };
  }

  /**
   * Connect to the WE1WEB network
   */
  async connect(serverUrl?: string): Promise<void> {
    // Use local server in development, production server in production
    const defaultUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://network.we1web.com'
      : 'ws://localhost:3001';
    
    const connectUrl = serverUrl || defaultUrl;
    
    return new Promise((resolve, reject) => {
      this.socket = io(connectUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        console.log('Connected to WE1WEB network');
        this.registerDevice();
        resolve();
      });

      // Handle ICE servers configuration
      this.socket.on('ice:servers', (data) => {
        if (data.iceServers) {
          this.rtcConfig.iceServers = data.iceServers;
        }
      });

      this.socket.on('peer:signal', this.handlePeerSignal.bind(this));
      this.socket.on('peer:new', (data) => this.createPeerConnection(data.peerId));
      this.socket.on('peer:disconnected', (data) => this.removePeerConnection(data.peerId));
      this.socket.on('task:assigned', this.handleTaskAssignment.bind(this));
      this.socket.on('pool:device-joined', this.handlePoolUpdate.bind(this));
      this.socket.on('pool:device-left', this.handlePoolUpdate.bind(this));
      this.socket.on('health:check', () => {
        this.socket?.emit('health:pong', { 
          latency: Date.now(),
          deviceId: this.capabilities?.deviceId 
        });
      });
      
      this.socket.on('error', reject);
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  /**
   * Register device with network
   */
  private registerDevice(): void {
    if (!this.socket || !this.capabilities) return;
    
    this.socket.emit('device:register', {
      capabilities: this.capabilities,
      timestamp: Date.now()
    });
  }

  /**
   * Join or create a computing pool
   */
  async joinPool(poolId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to network'));
        return;
      }

      this.socket.emit('pool:join', { poolId }, (response: any) => {
        if (response.success) {
          this.currentPool = response.pool;
          this.connectToPeers(response.peers);
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Connect to pool peers via WebRTC
   */
  private async connectToPeers(peers: string[]): Promise<void> {
    for (const peerId of peers) {
      await this.createPeerConnection(peerId);
    }
  }

  /**
   * Create WebRTC peer connection
   */
  private async createPeerConnection(peerId: string): Promise<void> {
    const pc = new RTCPeerConnection(this.rtcConfig);
    
    // Create data channel for task coordination
    const dataChannel = pc.createDataChannel('tasks', {
      ordered: true,
      maxRetransmits: 3
    });
    
    dataChannel.onopen = () => {
      console.log(`Data channel opened with peer ${peerId}`);
      this.dataChannels.set(peerId, dataChannel);
    };
    
    dataChannel.onmessage = (event) => {
      this.handlePeerMessage(peerId, JSON.parse(event.data));
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('peer:ice-candidate', {
          targetPeer: peerId,
          candidate: event.candidate
        });
      }
    };
    
    // Create and send offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    if (this.socket) {
      this.socket.emit('peer:offer', {
        targetPeer: peerId,
        offer: offer
      });
    }
    
    this.peers.set(peerId, pc);
  }

  /**
   * Remove peer connection
   */
  private removePeerConnection(peerId: string): void {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    
    const dc = this.dataChannels.get(peerId);
    if (dc) {
      dc.close();
      this.dataChannels.delete(peerId);
    }
    
    console.log(`Peer disconnected: ${peerId}`);
  }

  /**
   * Handle peer signaling
   */
  private async handlePeerSignal(data: any): Promise<void> {
    const { type, peerId, signal } = data;
    
    let pc = this.peers.get(peerId);
    if (!pc) {
      pc = new RTCPeerConnection(this.rtcConfig);
      this.peers.set(peerId, pc);
    }
    
    switch (type) {
      case 'offer':
        await pc.setRemoteDescription(signal);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket?.emit('peer:answer', {
          targetPeer: peerId,
          answer
        });
        break;
        
      case 'answer':
        await pc.setRemoteDescription(signal);
        break;
        
      case 'ice-candidate':
        await pc.addIceCandidate(signal);
        break;
    }
  }

  /**
   * Execute compute task
   */
  async executeTask(task: ComputeTask): Promise<any> {
    switch (task.type) {
      case ComputeTaskType.HUMAN_FEEDBACK:
        return this.executeHumanFeedbackTask(task);
      case ComputeTaskType.SYNTHETIC_CONVERSATIONS:
        return this.generateSyntheticConversations(task);
      case ComputeTaskType.CODE_REVIEW:
        return this.executeCodeReview(task);
      case ComputeTaskType.MULTIMODAL_ANNOTATION:
        return this.executeMultimodalAnnotation(task);
      case ComputeTaskType.FACT_VERIFICATION:
        return this.executeFactVerification(task);
      case ComputeTaskType.EDGE_CASE_DISCOVERY:
        return this.discoverEdgeCases(task);
      case ComputeTaskType.TRANSLATION_PAIRS:
        return this.generateTranslations(task);
      case ComputeTaskType.SAFETY_TESTING:
        return this.executeSafetyTesting(task);
      case ComputeTaskType.PREFERENCE_LEARNING:
        return this.collectPreferences(task);
      case ComputeTaskType.KNOWLEDGE_GRAPHS:
        return this.extractKnowledgeGraph(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Task: Generate human feedback for RLHF
   */
  private async executeHumanFeedbackTask(task: ComputeTask): Promise<any> {
    const { prompt, responses } = task.payload;
    
    // Present options to user for ranking
    // This would integrate with a UI component
    return {
      taskId: task.taskId,
      type: 'human_feedback',
      data: {
        prompt,
        rankings: [], // User rankings
        rationale: '', // Why they ranked this way
        timestamp: Date.now()
      }
    };
  }

  /**
   * Task: Generate synthetic conversations
   */
  private async generateSyntheticConversations(task: ComputeTask): Promise<any> {
    const { topic, style, length } = task.payload;
    
    // Use local LLM or rule-based generation
    return {
      taskId: task.taskId,
      type: 'synthetic_conversation',
      data: {
        conversation: [],
        metadata: { topic, style, length }
      }
    };
  }

  /**
   * Measure network bandwidth
   */
  private async measureBandwidth(): Promise<number> {
    const testSize = 1000000; // 1MB
    const testData = new ArrayBuffer(testSize);
    const startTime = performance.now();
    
    // Simulate bandwidth test (in production, would use actual server)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000; // seconds
    const bandwidth = (testSize * 8) / duration / 1000000; // Mbps
    
    return Math.min(bandwidth, 1000); // Cap at 1Gbps
  }

  /**
   * Measure network latency
   */
  private async measureLatency(): Promise<number> {
    const startTime = performance.now();
    
    // Ping test (in production, would use actual server)
    await fetch('/api/ping').catch(() => null);
    
    const endTime = performance.now();
    return endTime - startTime;
  }

  /**
   * Detect GPU capabilities
   */
  private detectGPU(): any {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return null;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return null;
    
    return {
      model: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      memory: 4, // Estimated
      cuda: false // WebGL doesn't support CUDA
    };
  }

  /**
   * Helper methods
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectDeviceType(): 'desktop' | 'laptop' | 'mobile' | 'server' {
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) return 'mobile';
    
    // @ts-ignore
    const hasBattery = navigator.getBattery;
    return hasBattery ? 'laptop' : 'desktop';
  }

  private detectOS(): string {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) return 'Windows';
    if (platform.includes('mac')) return 'macOS';
    if (platform.includes('linux')) return 'Linux';
    return 'Unknown';
  }

  private getDefaultSchedule(): Array<{ start: string; end: string }> {
    return [
      { start: '00:00', end: '08:00' }, // Night time
      { start: '20:00', end: '23:59' }  // Evening
    ];
  }

  // Additional task implementations...
  private async executeCodeReview(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async executeMultimodalAnnotation(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async executeFactVerification(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async discoverEdgeCases(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async generateTranslations(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async executeSafetyTesting(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async collectPreferences(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private async extractKnowledgeGraph(task: ComputeTask): Promise<any> {
    // Implementation
    return {};
  }

  private handleTaskAssignment(task: ComputeTask): void {
    this.activeTasks.set(task.taskId, task);
    this.executeTask(task);
  }

  private handlePoolUpdate(update: any): void {
    // Handle pool updates
  }

  private handlePeerMessage(peerId: string, message: any): void {
    // Handle peer messages
  }
}