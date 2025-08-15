/**
 * WE1WEB Signaling Server
 * Handles WebRTC signaling, room management, and device coordination
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors());
app.use(express.json());

// STUN/TURN server configuration
const ICE_SERVERS = [
  {
    urls: 'stun:stun.l.google.com:19302'
  },
  {
    urls: 'stun:stun1.l.google.com:19302'
  },
  // Free TURN servers (replace with your own in production)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

// Room/Pool management
class PoolManager {
  constructor() {
    this.pools = new Map(); // poolId -> Pool
    this.devices = new Map(); // socketId -> Device
    this.socketToPool = new Map(); // socketId -> poolId
  }

  createPool(poolId, config = {}) {
    if (!this.pools.has(poolId)) {
      this.pools.set(poolId, {
        id: poolId,
        name: config.name || `Pool ${poolId}`,
        devices: new Set(),
        tasks: [],
        config: {
          maxDevices: config.maxDevices || 100,
          minDevices: config.minDevices || 2,
          taskTypes: config.taskTypes || [],
          consensusThreshold: config.consensusThreshold || 0.66
        },
        stats: {
          tasksCompleted: 0,
          totalEarnings: 0,
          activeDevices: 0
        },
        createdAt: Date.now()
      });
    }
    return this.pools.get(poolId);
  }

  joinPool(socketId, poolId, deviceInfo) {
    const pool = this.pools.get(poolId) || this.createPool(poolId);
    
    // Check if pool is full
    if (pool.devices.size >= pool.config.maxDevices) {
      return { success: false, error: 'Pool is full' };
    }

    // Add device to pool
    pool.devices.add(socketId);
    pool.stats.activeDevices = pool.devices.size;
    
    // Store device info
    this.devices.set(socketId, {
      id: socketId,
      poolId,
      info: deviceInfo,
      joinedAt: Date.now(),
      stats: {
        tasksCompleted: 0,
        earnings: 0,
        uptime: 0
      }
    });
    
    // Map socket to pool
    this.socketToPool.set(socketId, poolId);
    
    return { 
      success: true, 
      pool: this.getPoolInfo(poolId),
      peers: Array.from(pool.devices).filter(id => id !== socketId)
    };
  }

  leavePool(socketId) {
    const poolId = this.socketToPool.get(socketId);
    if (!poolId) return;

    const pool = this.pools.get(poolId);
    if (pool) {
      pool.devices.delete(socketId);
      pool.stats.activeDevices = pool.devices.size;
      
      // Clean up empty pools
      if (pool.devices.size === 0) {
        this.pools.delete(poolId);
      }
    }

    this.devices.delete(socketId);
    this.socketToPool.delete(socketId);
  }

  getPoolInfo(poolId) {
    const pool = this.pools.get(poolId);
    if (!pool) return null;

    return {
      id: pool.id,
      name: pool.name,
      deviceCount: pool.devices.size,
      config: pool.config,
      stats: pool.stats
    };
  }

  getDevicesInPool(poolId) {
    const pool = this.pools.get(poolId);
    if (!pool) return [];
    
    return Array.from(pool.devices).map(socketId => {
      const device = this.devices.get(socketId);
      return device ? device.info : null;
    }).filter(Boolean);
  }

  updateDeviceStats(socketId, stats) {
    const device = this.devices.get(socketId);
    if (device) {
      device.stats = { ...device.stats, ...stats };
      
      // Update pool stats
      const pool = this.pools.get(device.poolId);
      if (pool && stats.earnings) {
        pool.stats.totalEarnings += stats.earnings;
      }
      if (pool && stats.tasksCompleted) {
        pool.stats.tasksCompleted += stats.tasksCompleted;
      }
    }
  }
}

// Connection health monitoring
class HealthMonitor {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // socketId -> health data
    this.startMonitoring();
  }

  startMonitoring() {
    setInterval(() => {
      this.checkConnections();
    }, 5000); // Check every 5 seconds
  }

  trackConnection(socketId) {
    this.connections.set(socketId, {
      lastPing: Date.now(),
      latency: 0,
      status: 'healthy',
      reconnects: 0
    });
  }

  updatePing(socketId, latency) {
    const conn = this.connections.get(socketId);
    if (conn) {
      conn.lastPing = Date.now();
      conn.latency = latency;
      conn.status = latency < 100 ? 'healthy' : latency < 300 ? 'degraded' : 'poor';
    }
  }

  checkConnections() {
    const now = Date.now();
    this.connections.forEach((conn, socketId) => {
      if (now - conn.lastPing > 10000) { // 10 seconds timeout
        conn.status = 'disconnected';
        this.io.to(socketId).emit('health:check');
      }
    });
  }

  removeConnection(socketId) {
    this.connections.delete(socketId);
  }
}

// Initialize managers
const poolManager = new PoolManager();
const healthMonitor = new HealthMonitor(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Device connected: ${socket.id}`);
  healthMonitor.trackConnection(socket.id);

  // Send ICE servers configuration
  socket.emit('ice:servers', { iceServers: ICE_SERVERS });

  // Device registration
  socket.on('device:register', (data) => {
    const { capabilities } = data;
    console.log(`Device registered: ${socket.id}`, capabilities);
    socket.emit('device:registered', { 
      deviceId: socket.id,
      timestamp: Date.now() 
    });
  });

  // Pool management
  socket.on('pool:join', (data, callback) => {
    const { poolId } = data;
    const deviceInfo = {
      socketId: socket.id,
      capabilities: data.capabilities || {},
      timestamp: Date.now()
    };
    
    const result = poolManager.joinPool(socket.id, poolId, deviceInfo);
    
    if (result.success) {
      socket.join(`pool:${poolId}`);
      
      // Notify other devices in pool
      socket.to(`pool:${poolId}`).emit('pool:device-joined', {
        deviceId: socket.id,
        deviceInfo
      });
      
      // Send current pool members to new device
      result.peers.forEach(peerId => {
        socket.emit('peer:new', { peerId });
      });
    }
    
    callback(result);
  });

  socket.on('pool:leave', () => {
    const poolId = poolManager.socketToPool.get(socket.id);
    if (poolId) {
      socket.leave(`pool:${poolId}`);
      poolManager.leavePool(socket.id);
      
      // Notify other devices
      socket.to(`pool:${poolId}`).emit('pool:device-left', {
        deviceId: socket.id
      });
    }
  });

  // WebRTC signaling
  socket.on('peer:offer', (data) => {
    const { targetPeer, offer } = data;
    io.to(targetPeer).emit('peer:signal', {
      type: 'offer',
      peerId: socket.id,
      signal: offer
    });
  });

  socket.on('peer:answer', (data) => {
    const { targetPeer, answer } = data;
    io.to(targetPeer).emit('peer:signal', {
      type: 'answer',
      peerId: socket.id,
      signal: answer
    });
  });

  socket.on('peer:ice-candidate', (data) => {
    const { targetPeer, candidate } = data;
    io.to(targetPeer).emit('peer:signal', {
      type: 'ice-candidate',
      peerId: socket.id,
      signal: candidate
    });
  });

  // Task coordination
  socket.on('task:complete', (data) => {
    const { taskId, result, earnings } = data;
    
    // Update device stats
    poolManager.updateDeviceStats(socket.id, {
      tasksCompleted: 1,
      earnings: earnings || 0
    });
    
    // Broadcast to pool for consensus
    const poolId = poolManager.socketToPool.get(socket.id);
    if (poolId) {
      socket.to(`pool:${poolId}`).emit('task:validate', {
        taskId,
        result,
        deviceId: socket.id
      });
    }
  });

  // Health monitoring
  socket.on('health:pong', (data) => {
    healthMonitor.updatePing(socket.id, data.latency || 0);
  });

  socket.on('health:stats', (data) => {
    const poolId = poolManager.socketToPool.get(socket.id);
    if (poolId) {
      io.to(`pool:${poolId}`).emit('device:stats', {
        deviceId: socket.id,
        stats: data
      });
    }
  });

  // Disconnection handling
  socket.on('disconnect', () => {
    console.log(`Device disconnected: ${socket.id}`);
    
    const poolId = poolManager.socketToPool.get(socket.id);
    if (poolId) {
      // Notify pool members
      socket.to(`pool:${poolId}`).emit('peer:disconnected', {
        peerId: socket.id
      });
    }
    
    poolManager.leavePool(socket.id);
    healthMonitor.removeConnection(socket.id);
  });
});

// REST API endpoints for pool information
app.get('/api/pools', (req, res) => {
  const pools = Array.from(poolManager.pools.values()).map(pool => ({
    id: pool.id,
    name: pool.name,
    deviceCount: pool.devices.size,
    stats: pool.stats
  }));
  res.json(pools);
});

app.get('/api/pools/:poolId', (req, res) => {
  const poolInfo = poolManager.getPoolInfo(req.params.poolId);
  if (!poolInfo) {
    return res.status(404).json({ error: 'Pool not found' });
  }
  res.json(poolInfo);
});

app.get('/api/pools/:poolId/devices', (req, res) => {
  const devices = poolManager.getDevicesInPool(req.params.poolId);
  res.json(devices);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    pools: poolManager.pools.size,
    devices: poolManager.devices.size,
    timestamp: Date.now()
  });
});

const PORT = process.env.SIGNALING_PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`WE1WEB Signaling Server running on port ${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});