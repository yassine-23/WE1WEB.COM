import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log levels
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
      environment: process.env.NODE_ENV || 'development'
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(message) {
    if (!this.isDevelopment) {
      fs.appendFileSync(this.logFile, message + '\n');
    }
  }

  log(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with color coding
    switch (level) {
      case LogLevel.ERROR:
        console.error(`🔴 ${message}`, meta);
        break;
      case LogLevel.WARN:
        console.warn(`🟡 ${message}`, meta);
        break;
      case LogLevel.INFO:
        console.info(`🔵 ${message}`, meta);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(`⚪ ${message}`, meta);
        }
        break;
    }

    // Write to file in production
    this.writeToFile(formattedMessage);
  }

  error(message, error = null) {
    const meta = error ? {
      error: error.message,
      stack: error.stack,
      code: error.code
    } : {};
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LogLevel.DEBUG, message, meta);
  }

  // Log API requests
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id
    };
    
    const level = res.statusCode >= 500 ? LogLevel.ERROR :
                  res.statusCode >= 400 ? LogLevel.WARN :
                  LogLevel.INFO;
    
    this.log(level, `${req.method} ${req.url} ${res.statusCode}`, meta);
  }

  // Log errors with context
  logError(error, context = {}) {
    this.error(`Error occurred: ${error.message}`, {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      }
    });
  }

  // Log payment events
  logPayment(event, data) {
    this.info(`Payment event: ${event}`, {
      event,
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Log WebSocket events
  logWebSocket(event, data) {
    this.debug(`WebSocket event: ${event}`, data);
  }

  // Log task processing
  logTask(taskId, status, details = {}) {
    this.info(`Task ${taskId}: ${status}`, {
      taskId,
      status,
      ...details
    });
  }

  // Log security events
  logSecurity(event, details) {
    this.warn(`Security event: ${event}`, {
      event,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton logger instance
const logger = new Logger();

// Express middleware for request logging
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request received
  logger.debug(`Incoming ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
    originalSend.call(this, data);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err, req, res, next) => {
  logger.logError(err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.id
  });
  
  next(err);
};

// Production error handler
export const productionErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

export default logger;