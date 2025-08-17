// Error tracking configuration for production
// Using a lightweight error tracking solution

interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  line?: number;
  column?: number;
  userAgent: string;
  timestamp: string;
  environment: string;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private queue: ErrorReport[] = [];
  private isProduction = import.meta.env.PROD;
  private maxQueueSize = 10;
  private flushInterval = 30000; // 30 seconds
  private endpoint = import.meta.env.VITE_ERROR_TRACKING_ENDPOINT || '/api/errors';

  constructor() {
    if (this.isProduction) {
      this.setupErrorHandlers();
      this.startFlushTimer();
    }
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || String(event.reason),
      });
    });
  }

  captureError(error: Partial<ErrorReport>) {
    if (!this.isProduction) {
      console.error('Error captured (dev mode):', error);
      return;
    }

    const report: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      line: error.line,
      column: error.column,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      environment: 'production',
      metadata: error.metadata,
    };

    this.queue.push(report);

    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    }
  }

  captureMessage(message: string, metadata?: Record<string, any>) {
    this.captureError({
      message,
      metadata,
    });
  }

  private async flush() {
    if (this.queue.length === 0) return;

    const errors = [...this.queue];
    this.queue = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });
    } catch (error) {
      // Silently fail - we don't want error reporting to cause more errors
      console.warn('Failed to send error reports:', error);
      // Re-queue the errors for next attempt
      this.queue.unshift(...errors.slice(0, this.maxQueueSize));
    }
  }

  private startFlushTimer() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  setUser(userId: string, email?: string) {
    // Set user context for error tracking
    if (this.isProduction) {
      // Store user context for future error reports
      localStorage.setItem('error_tracking_user', JSON.stringify({ userId, email }));
    }
  }

  clearUser() {
    localStorage.removeItem('error_tracking_user');
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// React Error Boundary integration
export class ErrorBoundary extends Error {
  constructor(message: string, componentStack?: string) {
    super(message);
    this.name = 'React Error';
    
    errorTracker.captureError({
      message,
      stack: componentStack,
      metadata: {
        type: 'react-error-boundary',
      },
    });
  }
}

// Performance monitoring
if (import.meta.env.PROD) {
  // Monitor performance metrics
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      const metrics = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
        timeToFirstByte: perfData.responseStart - perfData.requestStart,
      };

      // Send performance metrics
      fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, timestamp: new Date().toISOString() }),
      }).catch(() => {
        // Silently fail
      });
    }
  });
}

export default errorTracker;