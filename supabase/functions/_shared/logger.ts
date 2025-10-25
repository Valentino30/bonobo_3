// @ts-nocheck - Deno project with .ts imports
// Logging utilities
// Provides structured logging for Edge Functions

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogContext {
  [key: string]: any
}

/**
 * Logger class for structured logging
 */
export class Logger {
  constructor(private functionName: string, private minLevel: LogLevel = LogLevel.INFO) {}

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    return levels.indexOf(level) >= levels.indexOf(this.minLevel)
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] [${this.functionName}] ${message}${contextStr}`
  }

  /**
   * Log debug message
   * @param message - Log message
   * @param context - Additional context
   */
  debug(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, context))
    }
  }

  /**
   * Log info message
   * @param message - Log message
   * @param context - Additional context
   */
  info(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, context))
    }
  }

  /**
   * Log warning message
   * @param message - Log message
   * @param context - Additional context
   */
  warn(message: string, context?: LogContext): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context))
    }
  }

  /**
   * Log error message
   * @param message - Log message
   * @param context - Additional context or Error object
   */
  error(message: string, context?: LogContext | Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      if (context instanceof Error) {
        console.error(this.formatMessage(LogLevel.ERROR, message, {
          error: context.message,
          stack: context.stack,
        }))
      } else {
        console.error(this.formatMessage(LogLevel.ERROR, message, context))
      }
    }
  }

  /**
   * Log request start
   * @param method - HTTP method
   * @param path - Request path
   */
  logRequest(method: string, path?: string): void {
    this.info(`Request received: ${method} ${path || ''}`)
  }

  /**
   * Log response
   * @param statusCode - HTTP status code
   * @param duration - Request duration in ms
   */
  logResponse(statusCode: number, duration?: number): void {
    const durationStr = duration ? ` (${duration}ms)` : ''
    this.info(`Response sent: ${statusCode}${durationStr}`)
  }

  /**
   * Create a child logger with additional context
   * @param context - Additional context for all logs
   * @returns New logger instance with context
   */
  child(context: LogContext): ContextLogger {
    return new ContextLogger(this, context)
  }
}

/**
 * Context logger that includes default context in all logs
 */
class ContextLogger {
  constructor(private parent: Logger, private defaultContext: LogContext) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.defaultContext, ...context }
  }

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, this.mergeContext(context))
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, this.mergeContext(context))
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, this.mergeContext(context))
  }

  error(message: string, context?: LogContext | Error): void {
    if (context instanceof Error) {
      this.parent.error(message, context)
    } else {
      this.parent.error(message, this.mergeContext(context))
    }
  }
}

/**
 * Create a logger instance for an Edge Function
 * @param functionName - Name of the Edge Function
 * @param minLevel - Minimum log level to output
 * @returns Logger instance
 */
export function createLogger(functionName: string, minLevel?: LogLevel): Logger {
  return new Logger(functionName, minLevel)
}

/**
 * Measure execution time of an async function
 * @param fn - Async function to measure
 * @param logger - Logger instance
 * @param operationName - Name of the operation for logging
 * @returns Result of the function and duration
 */
export async function measureTime<T>(
  fn: () => Promise<T>,
  logger: Logger,
  operationName: string
): Promise<{ result: T; duration: number }> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    logger.debug(`${operationName} completed`, { duration })
    return { result, duration }
  } catch (error) {
    const duration = Date.now() - start
    logger.error(`${operationName} failed`, { duration, error })
    throw error
  }
}
