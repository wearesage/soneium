/**
 * Logger interface for the Soneium blockchain client
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

/**
 * Logger interface
 */
export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

/**
 * Default logger implementation that logs to console
 */
export class ConsoleLogger implements Logger {
  private level: LogLevel;

  /**
   * Create a new ConsoleLogger
   * @param level - The minimum log level to output
   */
  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
  }

  /**
   * Set the log level
   * @param level - The minimum log level to output
   */
  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  public debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * Log an info message
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  public info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  public warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  public error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

/**
 * No-op logger that doesn't log anything
 */
export class NoopLogger implements Logger {
  public debug(_message: string, ..._args: any[]): void {}
  public info(_message: string, ..._args: any[]): void {}
  public warn(_message: string, ..._args: any[]): void {}
  public error(_message: string, ..._args: any[]): void {}
}

/**
 * Default logger instance
 */
export const defaultLogger = new ConsoleLogger(LogLevel.INFO);