// Simple logging utility that can be extended to use external services

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  userId?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    // Set log level based on environment
    this.minLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    const userId = entry.userId ? `[User: ${entry.userId}]` : '';
    
    let message = `${timestamp} ${level} ${context}${userId} ${entry.message}`;
    
    if (entry.data) {
      message += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }
    
    if (entry.error) {
      message += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, context?: string, userId?: string, data?: any, error?: Error) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      userId,
      data,
      error
    };

    const formattedMessage = this.formatLogEntry(entry);

    // Log to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to external service
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.ERROR) {
      // TODO: Send to external logging service (e.g., Sentry, LogRocket, etc.)
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    // Placeholder for external logging service integration
    // This could be Sentry, LogRocket, CloudWatch, etc.
  }

  debug(message: string, context?: string, userId?: string, data?: any) {
    this.log(LogLevel.DEBUG, message, context, userId, data);
  }

  info(message: string, context?: string, userId?: string, data?: any) {
    this.log(LogLevel.INFO, message, context, userId, data);
  }

  warn(message: string, context?: string, userId?: string, data?: any, error?: Error) {
    this.log(LogLevel.WARN, message, context, userId, data, error);
  }

  error(message: string, context?: string, userId?: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, message, context, userId, data, error);
  }

  // Convenience methods for common use cases
  userAction(action: string, userId: string, data?: any) {
    this.info(`User action: ${action}`, 'USER_ACTION', userId, data);
  }

  adminAction(action: string, adminId: string, data?: any) {
    this.info(`Admin action: ${action}`, 'ADMIN_ACTION', adminId, data);
  }

  authEvent(event: string, userId?: string, data?: any) {
    this.info(`Auth event: ${event}`, 'AUTH', userId, data);
  }

  securityEvent(event: string, userId?: string, data?: any) {
    this.warn(`Security event: ${event}`, 'SECURITY', userId, data);
  }

  dbQuery(query: string, duration?: number, userId?: string) {
    this.debug(`DB Query: ${query}`, 'DATABASE', userId, { duration });
  }

  graphqlQuery(operation: string, userId?: string, variables?: any, duration?: number) {
    this.debug(`GraphQL ${operation}`, 'GRAPHQL', userId, { variables, duration });
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience exports
export const log = logger;
export default logger;