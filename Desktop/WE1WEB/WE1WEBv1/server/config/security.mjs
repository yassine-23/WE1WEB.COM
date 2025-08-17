import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

// Production-ready security configuration
export const configureSecurity = (app, isProduction = process.env.NODE_ENV === 'production') => {
  // Enable compression for all responses
  app.use(compression());

  // Helmet for comprehensive security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://*.supabase.co",
          "wss://*.supabase.co",
          "ws://localhost:*",
          "wss://localhost:*"
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: !isProduction,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  if (isProduction) {
    allowedOrigins.push('https://we1web.com', 'https://www.we1web.com');
  }

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin && !isProduction) return callback(null, true);
      
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: ${origin} is not allowed`));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-RateLimit-Remaining']
  };

  app.use(cors(corsOptions));

  // Enhanced rate limiting
  const createRateLimiter = (options) => {
    return rateLimit({
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      message: options.message || 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      handler: (req, res) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
        res.status(429).json({
          error: options.message,
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }
    });
  };

  // Different rate limiters for different endpoints
  const limiters = {
    general: createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: isProduction ? 100 : 1000,
      message: 'Too many requests from this IP, please try again later.'
    }),
    auth: createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true
    }),
    payment: createRateLimiter({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: 'Too many payment requests, please try again later.'
    }),
    api: createRateLimiter({
      windowMs: 1 * 60 * 1000,
      max: isProduction ? 30 : 100,
      message: 'API rate limit exceeded, please slow down.'
    })
  };

  // Apply rate limiters to specific routes
  app.use('/api/', limiters.api);
  app.use('/api/auth/', limiters.auth);
  app.use('/api/payments/', limiters.payment);
  app.use('/api/stripe/', limiters.payment);
  
  // Trust proxy for accurate IP addresses
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  // Additional security headers
  app.use((req, res, next) => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add additional security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  });

  // Request size limiting
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Input validation middleware
  app.use((req, res, next) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      sanitizeObject(req.query);
    }
    
    next();
  });

  console.log(`🔒 Security middleware configured for ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} environment`);
  console.log(`   ✓ Helmet security headers enabled`);
  console.log(`   ✓ CORS configured for: ${allowedOrigins.join(', ')}`);
  console.log(`   ✓ Rate limiting enabled`);
  console.log(`   ✓ Compression enabled`);
  console.log(`   ✓ Input sanitization active`);
};

// Helper function to sanitize objects
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove potential XSS attempts
      obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      // Remove SQL injection attempts
      obj[key] = obj[key].replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/gi, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

export default configureSecurity;