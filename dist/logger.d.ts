/**
 * Logger interface for the Soneium blockchain client
 */
/**
 * Log levels
 */
export declare enum LogLevel {
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
export declare class ConsoleLogger implements Logger {
    private level;
    /**
     * Create a new ConsoleLogger
     * @param level - The minimum log level to output
     */
    constructor(level?: LogLevel);
    /**
     * Set the log level
     * @param level - The minimum log level to output
     */
    setLevel(level: LogLevel): void;
    /**
     * Log a debug message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    debug(message: string, ...args: any[]): void;
    /**
     * Log an info message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    info(message: string, ...args: any[]): void;
    /**
     * Log a warning message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    warn(message: string, ...args: any[]): void;
    /**
     * Log an error message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    error(message: string, ...args: any[]): void;
}
/**
 * No-op logger that doesn't log anything
 */
export declare class NoopLogger implements Logger {
    debug(_message: string, ..._args: any[]): void;
    info(_message: string, ..._args: any[]): void;
    warn(_message: string, ..._args: any[]): void;
    error(_message: string, ..._args: any[]): void;
}
/**
 * Default logger instance
 */
export declare const defaultLogger: ConsoleLogger;
