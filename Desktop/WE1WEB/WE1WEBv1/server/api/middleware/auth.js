/**
 * WE1WEB Authentication Middleware
 * Protects routes and validates user sessions
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Require authentication middleware
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Require admin role middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // First check authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided'
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Check admin role in user metadata
    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.email === 'yassinedrani23@gmail.com'; // Your admin email
    
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    req.user = user;
    req.token = token;
    req.isAdmin = true;
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(403).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

/**
 * Rate limiting per user
 */
export const userRateLimit = (requests = 100, windowMs = 60000) => {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    
    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }
    
    const timestamps = userRequests.get(userId);
    const recentRequests = timestamps.filter(t => now - t < windowMs);
    
    if (recentRequests.length >= requests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.'
      });
    }
    
    recentRequests.push(now);
    userRequests.set(userId, recentRequests);
    
    next();
  };
};

export default {
  requireAuth,
  optionalAuth,
  requireAdmin,
  userRateLimit
};