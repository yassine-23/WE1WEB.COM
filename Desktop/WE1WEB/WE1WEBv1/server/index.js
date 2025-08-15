import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import paymentRouter from './payment-system.js';
import { applyRateLimiting } from './middleware/rateLimiter.js';
import logger, { requestLogger, errorLogger, productionErrorHandler } from './middleware/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Apply rate limiting
applyRateLimiting(app);

// Request logging
app.use(requestLogger);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Auth middleware
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Payment system routes
app.use('/api/payments', paymentRouter);

// Ping endpoint for latency testing
app.get('/api/ping', (req, res) => {
  res.json({ pong: Date.now() });
});

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      database: 'unknown',
      websocket: 'unknown'
    },
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB'
    }
  };

  // Check database connection
  try {
    const { error } = await supabase.from('network_stats').select('id').limit(1);
    health.services.database = error ? 'degraded' : 'operational';
  } catch (err) {
    health.services.database = 'offline';
    health.status = 'degraded';
  }

  // Check WebSocket server
  try {
    const wsResponse = await fetch('http://localhost:3001/health');
    if (wsResponse.ok) {
      health.services.websocket = 'operational';
    } else {
      health.services.websocket = 'degraded';
      health.status = 'degraded';
    }
  } catch (err) {
    health.services.websocket = 'offline';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Detailed health check (for monitoring systems)
app.get('/api/health/detailed', async (req, res) => {
  const detailed = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: {
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid,
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: PORT,
      hasSupabase: !!process.env.VITE_SUPABASE_URL,
      hasStripe: !!process.env.STRIPE_SECRET_KEY
    },
    dependencies: {
      express: true,
      supabase: !!supabase,
      cors: true,
      rateLimiting: true
    }
  };

  res.json(detailed);
});

// Readiness check (for container orchestration)
app.get('/api/ready', async (req, res) => {
  // Check if all critical services are ready
  let isReady = true;
  const checks = [];

  // Check database
  try {
    await supabase.from('network_stats').select('id').limit(1);
    checks.push({ service: 'database', ready: true });
  } catch (err) {
    checks.push({ service: 'database', ready: false });
    isReady = false;
  }

  // Check required environment variables
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  requiredEnvVars.forEach(envVar => {
    const hasVar = !!process.env[envVar];
    checks.push({ service: `env:${envVar}`, ready: hasVar });
    if (!hasVar) isReady = false;
  });

  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    checks,
    timestamp: new Date().toISOString()
  });
});

// Liveness check (for container orchestration)
app.get('/api/alive', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  res.json({ success: true });
});

// Protected user profile endpoint
app.get('/api/user/profile', requireAuth, async (req, res) => {
  res.json({ 
    user: req.user,
    message: 'Profile data retrieved successfully' 
  });
});

// App download links endpoint
app.get('/api/downloads', (req, res) => {
  const userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  res.json({
    android: {
      available: true,
      directDownload: true,
      url: '/downloads/we1web-latest.apk',
      version: '1.0.0',
      size: '14.2 MB',
      message: 'Direct APK download available',
      requirements: ['Android 7.0+', 'Allow Unknown Sources'],
      sha256: '3f4a8b2c9d1e5f6789abcdef1234567890'
    },
    ios: {
      available: false, // Will be true for EU users
      euOnly: true,
      url: '/downloads/install-ios',
      message: 'Available for EU users (iOS 17.5+)',
      requirements: ['iOS 17.5+', 'EU Location', 'Safari Browser'],
      notifyUrl: '/api/notify/ios'
    },
    distribution: {
      germany: {
        legal: true,
        method: 'Direct Download',
        stores: ['F-Droid', 'Direct APK', 'AltStore PAL'],
        benefits: [
          'No store fees (save 30%)',
          'Instant updates',
          'Full privacy control',
          'GDPR compliant'
        ]
      },
      eu: {
        legal: true,
        regulation: 'Digital Markets Act (DMA)',
        effectiveDate: 'March 2024',
        allowsSideloading: true
      }
    }
  });
});

// Direct APK download handler
app.get('/downloads/we1web-latest.apk', (req, res) => {
  // In production, this would serve the actual APK file
  // For now, redirect to a placeholder or show instructions
  res.status(200).json({
    message: 'APK file will be available here after build',
    instructions: 'Run Android build process to generate APK',
    buildCommand: 'cd mobile-apps/android && ./gradlew assembleRelease'
  });
});

// iOS installation handler for EU users
app.get('/downloads/install-ios', (req, res) => {
  // Check if user is from EU (you'd implement proper geo-detection)
  const isEU = true; // Placeholder
  
  if (isEU) {
    res.redirect('https://we1web.com/ios-install-manifest.plist');
  } else {
    res.status(403).json({
      error: 'Direct iOS installation is only available in EU countries',
      reason: 'Apple restrictions outside EU',
      alternative: 'Please join our waitlist for your region'
    });
  }
});

// Notify when app is ready
app.post('/api/notify/:platform', async (req, res) => {
  const { platform } = req.params;
  const { email } = req.body;
  
  // TODO: Save email to waitlist in database
  console.log(`Added ${email} to ${platform} waitlist`);
  
  res.json({ 
    success: true, 
    message: `We'll notify you when the ${platform} app is ready!` 
  });
});

// Catch-all route for React app (production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Error handling middleware (must be last)
app.use(errorLogger);
app.use(productionErrorHandler);

// Start main server
const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
  console.log(`Main server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('=================================');
  console.log('🚀 WE1WEB Backend Services Ready');
  console.log('=================================');
  console.log(`Main API: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:3001`);
  console.log('');
  console.log('To start the signaling server, run:');
  console.log('npm run dev:signaling (development)');
  console.log('npm run start:signaling (production)');
  console.log('');
  console.log('Or run all services with:');
  console.log('npm run dev (development)');
  console.log('npm run start:all (production)');
  console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});