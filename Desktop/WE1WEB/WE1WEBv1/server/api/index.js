/**
 * WE1WEB Main API Server
 * The heart of the world's largest decentralized living neural network
 * 
 * @copyright 2024 WE1WEB - All Rights Reserved
 * @author Yassine Drani & Claude AI
 * @license Proprietary - See LICENSE file
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import our core services
import nodeManager from '../services/nodeManager.js';
import taskProcessor from '../services/taskProcessor.js';
import taskDistributor from '../services/taskDistributor.js';
import paymentProcessor from '../services/paymentProcessor.js';
import webrtcManager from '../services/webrtcManager.js';

// Import routes
import authRoutes from './routes/auth.js';
import nodeRoutes from './routes/nodes.js';
import taskRoutes from './routes/tasks.js';
import paymentRoutes from './routes/payments.js';
import statsRoutes from './routes/stats.js';

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new SocketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://we1web.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    network: nodeManager.getNetworkStats(),
    tasks: taskProcessor.getStats(),
    version: '1.0.0'
  };
  res.json(stats);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`New WebSocket connection: ${socket.id}`);
  
  // Handle node registration
  socket.on('node:register', async (data) => {
    try {
      const result = await nodeManager.connectNode(
        data.userId,
        data.deviceInfo,
        socket.id
      );
      
      if (result.success) {
        socket.join(`user:${data.userId}`);
        socket.join(`node:${result.nodeId}`);
        socket.emit('node:registered', result);
        
        // Notify user of node connection
        io.to(`user:${data.userId}`).emit('node:connected', {
          nodeId: result.nodeId,
          timestamp: new Date()
        });
      } else {
        socket.emit('node:error', result);
      }
    } catch (error) {
      console.error('Node registration error:', error);
      socket.emit('node:error', { error: error.message });
    }
  });

  // Handle heartbeat
  socket.on('node:heartbeat', async (data) => {
    try {
      const result = await nodeManager.handleHeartbeat(
        data.nodeId,
        data.metrics
      );
      socket.emit('node:heartbeat:ack', result);
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  });

  // Handle task completion
  socket.on('task:complete', async (data) => {
    try {
      const result = await nodeManager.completeTask(
        data.nodeId,
        data.taskId,
        data.result
      );
      
      if (result.success) {
        socket.emit('task:completed', result);
        
        // Notify task requester
        io.emit('task:finished', {
          taskId: data.taskId,
          status: result.status
        });
      } else {
        socket.emit('task:error', result);
      }
    } catch (error) {
      console.error('Task completion error:', error);
      socket.emit('task:error', { error: error.message });
    }
  });

  // Handle WebRTC signaling
  socket.on('webrtc:offer', async (data) => {
    try {
      const result = await webrtcManager.createOffer(data.nodeId);
      socket.emit('webrtc:offer:created', result);
    } catch (error) {
      console.error('WebRTC offer error:', error);
      socket.emit('webrtc:error', { error: error.message });
    }
  });

  socket.on('webrtc:answer', async (data) => {
    try {
      const result = await webrtcManager.handleAnswer(
        data.nodeId,
        data.answer
      );
      socket.emit('webrtc:answer:accepted', result);
    } catch (error) {
      console.error('WebRTC answer error:', error);
      socket.emit('webrtc:error', { error: error.message });
    }
  });

  socket.on('webrtc:ice', async (data) => {
    try {
      const result = await webrtcManager.addIceCandidate(
        data.nodeId,
        data.candidate
      );
      socket.emit('webrtc:ice:added', result);
    } catch (error) {
      console.error('ICE candidate error:', error);
      socket.emit('webrtc:error', { error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`WebSocket disconnected: ${socket.id}`);
    
    // Find and disconnect node
    for (const [nodeId, node] of nodeManager.connectedNodes.entries()) {
      if (node.socketId === socket.id) {
        await nodeManager.disconnectNode(nodeId);
        break;
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'SERVER_ERROR',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
      path: req.path
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    WE1WEB NEURAL NETWORK                    ║
║              The Living Brain of Humanity's AI              ║
║                                                              ║
║  Status: ONLINE                                              ║
║  Port: ${PORT}                                              ║
║  Environment: ${process.env.NODE_ENV || 'development'}      ║
║  Version: 1.0.0                                              ║
║                                                              ║
║  "Building the world's largest decentralized                ║
║   living neural network powered by personal devices"        ║
║                                                              ║
║  © 2024 WE1WEB - Yassine Drani & Claude AI                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
  
  // Initialize services
  console.log('🧠 Initializing neural network services...');
  
  // Start periodic tasks
  setInterval(() => {
    taskDistributor.optimizeDistribution();
  }, 60000); // Optimize every minute
  
  setInterval(async () => {
    await paymentProcessor.processBatchPayouts();
  }, 3600000); // Process payouts every hour
  
  console.log('✅ All systems operational!');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Close all connections
  for (const [nodeId] of nodeManager.connectedNodes.entries()) {
    await nodeManager.disconnectNode(nodeId);
  }
  
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;