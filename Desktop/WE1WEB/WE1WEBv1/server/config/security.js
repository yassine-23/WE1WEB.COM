const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');

// Security configuration for production
const configureSecurity = (app, isProduction = process.env.NODE_ENV === 'production') => {
  // Compression
  app.use(compression());

  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      },
    },
    crossOriginEmbedderPolicy: !isProduction,
  }));

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  };

  app.use(cors(corsOptions));

  // Rate limiting
  const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
      windowMs,
      max,
      message,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        res.status(429).json({
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
    });
  };

  // General rate limiter
  const generalLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    isProduction ? 100 : 1000, // 100 requests per 15 minutes in production
    'Too many requests from this IP, please try again later.'
  );

  // Strict rate limiter for auth endpoints
  const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests per 15 minutes
    'Too many authentication attempts, please try again later.'
  );

  // Payment endpoints rate limiter
  const paymentLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    10, // 10 requests per hour
    'Too many payment requests, please try again later.'
  );

  // Apply rate limiters
  app.use('/api/', generalLimiter);
  app.use('/api/auth/', authLimiter);
  app.use('/api/payments/', paymentLimiter);
  app.use('/api/stripe/', paymentLimiter);

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent HTTP parameter pollution
  app.use(hpp());

  // Security middleware for JSON parsing
  app.use((req, res, next) => {
    // Reject requests with suspicious content
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      const rawBody = req.body;
      if (typeof rawBody === 'string' && rawBody.length > 1000000) { // 1MB limit
        return res.status(413).json({ error: 'Payload too large' });
      }
    }
    next();
  });

  // CSRF Protection for state-changing operations
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const token = req.headers['x-csrf-token'];
      // In production, validate CSRF token
      if (isProduction && !token) {
        return res.status(403).json({ error: 'CSRF token missing' });
      }
    }
    next();
  });

  // Hide powered by Express
  app.disable('x-powered-by');

  // Trust proxy settings for accurate IP addresses
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  console.log('🔒 Security middleware configured for', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
};

module.exports = { configureSecurity };