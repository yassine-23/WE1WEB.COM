/**
 * Test WebSocket connection to signaling server
 * Run with: node test/test-websocket.js
 */

import { io } from 'socket.io-client';

const SIGNALING_SERVER = 'http://localhost:3001';

console.log('Testing WebSocket connection to:', SIGNALING_SERVER);

const socket = io(SIGNALING_SERVER, {
  transports: ['websocket', 'polling'],
  reconnection: true
});

socket.on('connect', () => {
  console.log('✅ Connected to signaling server');
  console.log('Socket ID:', socket.id);
  
  // Register device
  socket.emit('device:register', {
    capabilities: {
      deviceType: 'test',
      cpu: { cores: 4, speed: 2.5 },
      memory: { total: 8, available: 4 }
    }
  });
});

socket.on('device:registered', (data) => {
  console.log('✅ Device registered:', data);
  
  // Join a test pool
  socket.emit('pool:join', { 
    poolId: 'test-pool-1',
    capabilities: {
      deviceType: 'test',
      cpu: { cores: 4 }
    }
  }, (response) => {
    if (response.success) {
      console.log('✅ Joined pool:', response.pool);
      console.log('Peers in pool:', response.peers);
    } else {
      console.log('❌ Failed to join pool:', response.error);
    }
  });
});

socket.on('ice:servers', (data) => {
  console.log('✅ Received ICE servers configuration');
  console.log('STUN servers:', data.iceServers.filter(s => s.urls.includes('stun')).length);
  console.log('TURN servers:', data.iceServers.filter(s => s.urls.includes('turn')).length);
});

socket.on('pool:device-joined', (data) => {
  console.log('📢 New device joined pool:', data.deviceId);
});

socket.on('pool:device-left', (data) => {
  console.log('📢 Device left pool:', data.deviceId);
});

socket.on('peer:new', (data) => {
  console.log('🤝 New peer to connect:', data.peerId);
});

socket.on('health:check', () => {
  console.log('💓 Health check received, sending pong...');
  socket.emit('health:pong', { 
    latency: Date.now(),
    deviceId: socket.id 
  });
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.log('Make sure the signaling server is running on port 3001');
  console.log('Run: npm run dev:signaling');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from signaling server');
});

// Test sending stats after 5 seconds
setTimeout(() => {
  if (socket.connected) {
    console.log('📊 Sending device stats...');
    socket.emit('health:stats', {
      cpu: 45,
      memory: 62,
      bandwidth: 100,
      tasksCompleted: 5
    });
  }
}, 5000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test client...');
  socket.disconnect();
  process.exit(0);
});

console.log('Test client running. Press Ctrl+C to exit.');
console.log('Waiting for connection...');