/**
 * WE1WEB WebRTC Data Channel Manager
 * Handles P2P connections for distributed task execution
 */

import { EventEmitter } from 'events';
import nodeManager from './nodeManager.js';
import taskProcessor from './taskProcessor.js';

class WebRTCManager extends EventEmitter {
  constructor() {
    super();
    this.peers = new Map();
    this.dataChannels = new Map();
    this.pendingOffers = new Map();
    this.taskChannels = new Map();
    
    // STUN/TURN servers for NAT traversal
    this.iceServers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      // Add TURN servers if available
      ...(process.env.TURN_SERVER_URL ? [{
        urls: process.env.TURN_SERVER_URL,
        username: process.env.TURN_USERNAME,
        credential: process.env.TURN_CREDENTIAL
      }] : [])
    ];
  }

  /**
   * Initialize WebRTC connection for a node
   */
  async initializePeerConnection(nodeId, isInitiator = false) {
    try {
      // Create RTCPeerConnection
      const pc = {
        id: nodeId,
        isInitiator,
        localDescription: null,
        remoteDescription: null,
        iceCandidates: [],
        dataChannel: null,
        stats: {
          bytesSent: 0,
          bytesReceived: 0,
          latency: 0,
          packetsLost: 0
        },
        connectionState: 'new',
        signalingState: 'stable'
      };

      // Store peer connection
      this.peers.set(nodeId, pc);

      // Create data channel configuration
      const dataChannelConfig = {
        ordered: true,
        maxRetransmits: 3,
        protocol: 'we1web-protocol',
        negotiated: false,
        id: Math.floor(Math.random() * 65535)
      };

      // Setup data channels
      this.setupDataChannels(nodeId, dataChannelConfig);

      return {
        success: true,
        peerId: nodeId,
        iceServers: this.iceServers
      };
    } catch (error) {
      console.error('Error initializing peer connection:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Setup data channels for task distribution
   */
  setupDataChannels(nodeId, config) {
    // Main control channel
    const controlChannel = {
      id: `control-${nodeId}`,
      type: 'control',
      config,
      buffer: [],
      state: 'connecting',
      onMessage: (data) => this.handleControlMessage(nodeId, data),
      onOpen: () => this.handleChannelOpen(nodeId, 'control'),
      onClose: () => this.handleChannelClose(nodeId, 'control')
    };

    // Task data channel
    const taskChannel = {
      id: `task-${nodeId}`,
      type: 'task',
      config: { ...config, ordered: false }, // Unordered for speed
      buffer: [],
      state: 'connecting',
      onMessage: (data) => this.handleTaskMessage(nodeId, data),
      onOpen: () => this.handleChannelOpen(nodeId, 'task'),
      onClose: () => this.handleChannelClose(nodeId, 'task')
    };

    // Result channel
    const resultChannel = {
      id: `result-${nodeId}`,
      type: 'result',
      config,
      buffer: [],
      state: 'connecting',
      onMessage: (data) => this.handleResultMessage(nodeId, data),
      onOpen: () => this.handleChannelOpen(nodeId, 'result'),
      onClose: () => this.handleChannelClose(nodeId, 'result')
    };

    // Store channels
    this.dataChannels.set(nodeId, {
      control: controlChannel,
      task: taskChannel,
      result: resultChannel
    });
  }

  /**
   * Create offer for peer connection
   */
  async createOffer(nodeId) {
    const peer = this.peers.get(nodeId);
    
    if (!peer) {
      return { success: false, error: 'Peer not found' };
    }

    try {
      // Simulate offer creation
      const offer = {
        type: 'offer',
        sdp: this.generateSDP('offer', nodeId),
        timestamp: Date.now()
      };

      peer.localDescription = offer;
      peer.signalingState = 'have-local-offer';
      
      // Store pending offer
      this.pendingOffers.set(nodeId, offer);

      return {
        success: true,
        offer
      };
    } catch (error) {
      console.error('Error creating offer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create answer for peer connection
   */
  async createAnswer(nodeId, offer) {
    const peer = this.peers.get(nodeId);
    
    if (!peer) {
      await this.initializePeerConnection(nodeId, false);
    }

    try {
      // Store remote offer
      peer.remoteDescription = offer;
      peer.signalingState = 'have-remote-offer';

      // Create answer
      const answer = {
        type: 'answer',
        sdp: this.generateSDP('answer', nodeId),
        timestamp: Date.now()
      };

      peer.localDescription = answer;
      peer.signalingState = 'stable';
      peer.connectionState = 'connected';

      // Open data channels
      this.openDataChannels(nodeId);

      return {
        success: true,
        answer
      };
    } catch (error) {
      console.error('Error creating answer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle answer from remote peer
   */
  async handleAnswer(nodeId, answer) {
    const peer = this.peers.get(nodeId);
    
    if (!peer) {
      return { success: false, error: 'Peer not found' };
    }

    try {
      peer.remoteDescription = answer;
      peer.signalingState = 'stable';
      peer.connectionState = 'connected';

      // Open data channels
      this.openDataChannels(nodeId);

      // Clear pending offer
      this.pendingOffers.delete(nodeId);

      this.emit('peer:connected', { nodeId });

      return { success: true };
    } catch (error) {
      console.error('Error handling answer:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(nodeId, candidate) {
    const peer = this.peers.get(nodeId);
    
    if (!peer) {
      return { success: false, error: 'Peer not found' };
    }

    try {
      peer.iceCandidates.push(candidate);
      
      // Process buffered candidates if connection is stable
      if (peer.signalingState === 'stable') {
        this.processIceCandidates(nodeId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send task through data channel
   */
  async sendTask(nodeId, task) {
    const channels = this.dataChannels.get(nodeId);
    
    if (!channels || channels.task.state !== 'open') {
      return { success: false, error: 'Task channel not open' };
    }

    try {
      // Prepare task payload
      const payload = {
        id: task.id,
        type: task.type,
        data: task.payload,
        requirements: task.requirements,
        timeout: 300000, // 5 minutes
        timestamp: Date.now()
      };

      // Send through task channel
      this.sendDataThroughChannel(channels.task, payload);

      // Track task assignment
      this.taskChannels.set(task.id, nodeId);

      // Update stats
      const peer = this.peers.get(nodeId);
      if (peer) {
        peer.stats.bytesSent += JSON.stringify(payload).length;
      }

      this.emit('task:sent', { nodeId, task: task.id });

      return { success: true };
    } catch (error) {
      console.error('Error sending task:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Handle control message
   */
  handleControlMessage(nodeId, data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      switch (message.type) {
        case 'heartbeat':
          this.handleHeartbeat(nodeId, message);
          break;
        
        case 'status':
          this.handleStatusUpdate(nodeId, message);
          break;
        
        case 'capability':
          this.handleCapabilityUpdate(nodeId, message);
          break;
        
        default:
          console.log(`Unknown control message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling control message:', error);
    }
  }

  /**
   * Handle task message
   */
  handleTaskMessage(nodeId, data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      switch (message.type) {
        case 'progress':
          this.emit('task:progress', { nodeId, taskId: message.taskId, progress: message.progress });
          break;
        
        case 'error':
          this.handleTaskError(nodeId, message);
          break;
        
        case 'accepted':
          this.emit('task:accepted', { nodeId, taskId: message.taskId });
          break;
        
        default:
          console.log(`Unknown task message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling task message:', error);
    }
  }

  /**
   * Handle result message
   */
  async handleResultMessage(nodeId, data) {
    try {
      const message = typeof data === 'string' ? JSON.parse(data) : data;
      
      // Update peer stats
      const peer = this.peers.get(nodeId);
      if (peer) {
        peer.stats.bytesReceived += JSON.stringify(message).length;
      }

      // Process task completion
      const result = await nodeManager.completeTask(nodeId, message.taskId, message.result);
      
      if (result.success) {
        this.emit('task:completed', { 
          nodeId, 
          taskId: message.taskId, 
          result: message.result 
        });
      }

      // Clean up
      this.taskChannels.delete(message.taskId);
    } catch (error) {
      console.error('Error handling result message:', error);
    }
  }

  /**
   * Handle heartbeat
   */
  handleHeartbeat(nodeId, message) {
    const peer = this.peers.get(nodeId);
    if (peer) {
      peer.stats.latency = Date.now() - message.timestamp;
      
      // Send heartbeat response
      const channels = this.dataChannels.get(nodeId);
      if (channels?.control.state === 'open') {
        this.sendDataThroughChannel(channels.control, {
          type: 'heartbeat_ack',
          timestamp: message.timestamp,
          serverTime: Date.now()
        });
      }
    }
  }

  /**
   * Handle task error
   */
  handleTaskError(nodeId, message) {
    console.error(`Task error from node ${nodeId}:`, message.error);
    
    // Retry task with different node
    const taskId = message.taskId;
    const task = taskProcessor.activeTasks.get(taskId);
    
    if (task) {
      task.status = 'pending';
      task.attempts++;
      taskProcessor.taskQueue.push(task);
      taskProcessor.processPendingTasks();
    }
    
    this.emit('task:error', { nodeId, taskId, error: message.error });
  }

  /**
   * Open data channels
   */
  openDataChannels(nodeId) {
    const channels = this.dataChannels.get(nodeId);
    
    if (!channels) return;

    // Mark channels as open
    Object.values(channels).forEach(channel => {
      channel.state = 'open';
      channel.onOpen();
    });
  }

  /**
   * Handle channel open
   */
  handleChannelOpen(nodeId, channelType) {
    console.log(`Data channel opened: ${channelType} for node ${nodeId}`);
    
    const channels = this.dataChannels.get(nodeId);
    if (channels) {
      // Process buffered messages
      const channel = channels[channelType];
      if (channel.buffer.length > 0) {
        channel.buffer.forEach(data => this.sendDataThroughChannel(channel, data));
        channel.buffer = [];
      }
    }
    
    this.emit('channel:open', { nodeId, channelType });
  }

  /**
   * Handle channel close
   */
  handleChannelClose(nodeId, channelType) {
    console.log(`Data channel closed: ${channelType} for node ${nodeId}`);
    
    const channels = this.dataChannels.get(nodeId);
    if (channels) {
      channels[channelType].state = 'closed';
    }
    
    this.emit('channel:close', { nodeId, channelType });
    
    // Clean up if all channels are closed
    if (channels && Object.values(channels).every(c => c.state === 'closed')) {
      this.closePeerConnection(nodeId);
    }
  }

  /**
   * Send data through channel
   */
  sendDataThroughChannel(channel, data) {
    try {
      const message = JSON.stringify(data);
      
      if (channel.state === 'open') {
        // Simulate sending (in real implementation, use actual DataChannel.send())
        console.log(`Sending data through channel ${channel.id}:`, message.substring(0, 100));
        
        // Trigger message handler for testing
        setTimeout(() => {
          if (channel.type === 'result') {
            channel.onMessage(data);
          }
        }, 100);
      } else {
        // Buffer message
        channel.buffer.push(data);
      }
    } catch (error) {
      console.error('Error sending data through channel:', error);
    }
  }

  /**
   * Close peer connection
   */
  closePeerConnection(nodeId) {
    const peer = this.peers.get(nodeId);
    
    if (peer) {
      peer.connectionState = 'closed';
      this.peers.delete(nodeId);
    }
    
    this.dataChannels.delete(nodeId);
    this.pendingOffers.delete(nodeId);
    
    // Clean up task assignments
    for (const [taskId, assignedNode] of this.taskChannels.entries()) {
      if (assignedNode === nodeId) {
        this.taskChannels.delete(taskId);
      }
    }
    
    this.emit('peer:disconnected', { nodeId });
  }

  /**
   * Generate mock SDP for testing
   */
  generateSDP(type, nodeId) {
    return `v=0
o=- ${Date.now()} 2 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=msid-semantic: WMS
m=application 9 UDP/DTLS/SCTP webrtc-datachannel
c=IN IP4 0.0.0.0
a=ice-ufrag:${Math.random().toString(36).substring(7)}
a=ice-pwd:${Math.random().toString(36).substring(7)}
a=fingerprint:sha-256:${crypto.randomBytes(32).toString('hex')}
a=setup:${type === 'offer' ? 'actpass' : 'active'}
a=mid:0
a=sctp-port:5000
a=max-message-size:262144`;
  }

  /**
   * Process ICE candidates
   */
  processIceCandidates(nodeId) {
    const peer = this.peers.get(nodeId);
    if (!peer) return;
    
    // Process buffered candidates
    peer.iceCandidates.forEach(candidate => {
      console.log(`Processing ICE candidate for ${nodeId}:`, candidate);
    });
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(nodeId) {
    const peer = this.peers.get(nodeId);
    const channels = this.dataChannels.get(nodeId);
    
    if (!peer) {
      return null;
    }

    return {
      connectionState: peer.connectionState,
      signalingState: peer.signalingState,
      stats: peer.stats,
      channels: channels ? {
        control: channels.control.state,
        task: channels.task.state,
        result: channels.result.state
      } : null
    };
  }

  /**
   * Get all active connections
   */
  getActiveConnections() {
    return Array.from(this.peers.entries()).map(([nodeId, peer]) => ({
      nodeId,
      state: peer.connectionState,
      stats: peer.stats
    }));
  }
}

export default new WebRTCManager();