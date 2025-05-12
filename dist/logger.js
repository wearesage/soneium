"use strict";
/**
 * Logger interface for the Soneium blockchain client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultLogger = exports.NoopLogger = exports.ConsoleLogger = exports.LogLevel = void 0;
/**
 * Log levels
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Default logger implementation that logs to console
 */
class ConsoleLogger {
    /**
     * Create a new ConsoleLogger
     * @param level - The minimum log level to output
     */
    constructor(level = LogLevel.INFO) {
        this.level = level;
    }
    /**
     * Set the log level
     * @param level - The minimum log level to output
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * Log a debug message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    debug(message, ...args) {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
    /**
     * Log an info message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    info(message, ...args) {
        if (this.level <= LogLevel.INFO) {
            console.info(`[INFO] ${message}`, ...args);
        }
    }
    /**
     * Log a warning message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    warn(message, ...args) {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }
    /**
     * Log an error message
     * @param message - The message to log
     * @param args - Additional arguments to log
     */
    error(message, ...args) {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
/**
 * No-op logger that doesn't log anything
 */
class NoopLogger {
    debug(_message, ..._args) { }
    info(_message, ..._args) { }
    warn(_message, ..._args) { }
    error(_message, ..._args) { }
}
exports.NoopLogger = NoopLogger;
/**
 * Default logger instance
 */
exports.defaultLogger = new ConsoleLogger(LogLevel.INFO);
//# sourceMappingURL=logger.js.map