/**
 * Custom error types for the Soneium blockchain client
 */
/**
 * Base error class for Soneium client errors
 */
export declare class SoneiumError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when there's an issue with the RPC connection
 */
export declare class RpcError extends SoneiumError {
    readonly code?: number;
    readonly data?: any;
    readonly url?: string;
    readonly method?: string;
    constructor(message: string, options?: {
        code?: number;
        data?: any;
        url?: string;
        method?: string;
    });
}
/**
 * Error thrown when an RPC request times out
 */
export declare class RpcTimeoutError extends RpcError {
    constructor(url: string, timeoutMs: number);
}
/**
 * Error thrown when there's an issue with the wallet
 */
export declare class WalletError extends SoneiumError {
    constructor(message: string);
}
/**
 * Error thrown when there's an issue with account abstraction
 */
export declare class AccountAbstractionError extends SoneiumError {
    constructor(message: string);
}
/**
 * Error thrown when there's an issue with the paymaster
 */
export declare class PaymasterError extends AccountAbstractionError {
    readonly response?: any;
    constructor(message: string, response?: any);
}
/**
 * Error thrown when there's an issue with the bundler
 */
export declare class BundlerError extends AccountAbstractionError {
    readonly response?: any;
    constructor(message: string, response?: any);
}
/**
 * Error thrown when a transaction is rejected
 */
export declare class TransactionRejectedError extends SoneiumError {
    readonly reason?: string;
    constructor(message: string, reason?: string);
}
/**
 * Error thrown when gas estimation fails
 */
export declare class GasEstimationError extends SoneiumError {
    constructor(message: string);
}
