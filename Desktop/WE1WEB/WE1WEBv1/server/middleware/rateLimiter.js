import rateLimit from 'express-rate-limit';

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 payment requests per hour
  message: 'Too many payment requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for compute task submissions
export const taskLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 task submissions per minute
  message: 'Too many task submissions, please slow down.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for WebSocket connections
export const wsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 WebSocket connection attempts per 5 minutes
  message: 'Too many connection attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Dynamic rate limiting based on user tier
export const createDynamicLimiter = (tier = 'free') => {
  const limits = {
    free: { windowMs: 15 * 60 * 1000, max: 100 },
    basic: { windowMs: 15 * 60 * 1000, max: 500 },
    pro: { windowMs: 15 * 60 * 1000, max: 2000 },
    enterprise: { windowMs: 15 * 60 * 1000, max: 10000 }
  };

  const config = limits[tier] || limits.free;

  return rateLimit({
    ...config,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id || req.ip;
    },
    skip: (req) => {
      // Skip rate limiting for whitelisted IPs or admin users
      return req.user?.role === 'admin' || req.ip === '127.0.0.1';
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Rate limiting for public endpoints (more lenient)
export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});

// Export a middleware that applies appropriate rate limiting
export const applyRateLimiting = (app) => {
  // Apply general rate limiting to all routes
  app.use('/api/', apiLimiter);
  
  // Apply specific rate limiters to sensitive endpoints
  app.use('/api/auth/', authLimiter);
  app.use('/api/payments/', paymentLimiter);
  app.use('/api/tasks/', taskLimiter);
  app.use('/api/ws/', wsLimiter);
  
  // Public endpoints get more lenient limits
  app.use('/api/public/', publicLimiter);
  app.use('/api/health', publicLimiter);
  app.use('/api/stats', publicLimiter);
};