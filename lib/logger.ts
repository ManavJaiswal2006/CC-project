/**
 * Production-safe logging utility
 * Only logs errors in development, or sends to error tracking service in production
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  error: (message: string, error?: any, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error || "", context || "");
    } else {
      // In production, send to error tracking service (e.g., Sentry)
      // Example: Sentry.captureException(error, { extra: { message, context } });
      
      // For now, log minimal info (no sensitive data)
      console.error(`[ERROR] ${message}`);
      
      // TODO: Integrate with error tracking service
      // if (typeof window !== "undefined" && window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     tags: { context },
      //     extra: { message },
      //   });
      // }
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, context || "");
    }
    // In production, warnings are typically not logged
  },

  info: (message: string, context?: Record<string, any>) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, context || "");
    }
    // In production, info logs are typically not needed
  },
};

