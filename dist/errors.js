"use strict";
/**
 * Custom error types for the Soneium blockchain client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GasEstimationError = exports.TransactionRejectedError = exports.BundlerError = exports.PaymasterError = exports.AccountAbstractionError = exports.WalletError = exports.RpcTimeoutError = exports.RpcError = exports.SoneiumError = void 0;
/**
 * Base error class for Soneium client errors
 */
class SoneiumError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SoneiumError';
    }
}
exports.SoneiumError = SoneiumError;
/**
 * Error thrown when there's an issue with the RPC connection
 */
class RpcError extends SoneiumError {
    constructor(message, options) {
        super(`RPC Error: ${message}`);
        this.name = 'RpcError';
        this.code = options?.code;
        this.data = options?.data;
        this.url = options?.url;
        this.method = options?.method;
    }
}
exports.RpcError = RpcError;
/**
 * Error thrown when an RPC request times out
 */
class RpcTimeoutError extends RpcError {
    constructor(url, timeoutMs) {
        super(`Request to ${url} timed out after ${timeoutMs}ms`, { url });
        this.name = 'RpcTimeoutError';
    }
}
exports.RpcTimeoutError = RpcTimeoutError;
/**
 * Error thrown when there's an issue with the wallet
 */
class WalletError extends SoneiumError {
    constructor(message) {
        super(`Wallet Error: ${message}`);
        this.name = 'WalletError';
    }
}
exports.WalletError = WalletError;
/**
 * Error thrown when there's an issue with account abstraction
 */
class AccountAbstractionError extends SoneiumError {
    constructor(message) {
        super(`Account Abstraction Error: ${message}`);
        this.name = 'AccountAbstractionError';
    }
}
exports.AccountAbstractionError = AccountAbstractionError;
/**
 * Error thrown when there's an issue with the paymaster
 */
class PaymasterError extends AccountAbstractionError {
    constructor(message, response) {
        super(`Paymaster Error: ${message}`);
        this.name = 'PaymasterError';
        this.response = response;
    }
}
exports.PaymasterError = PaymasterError;
/**
 * Error thrown when there's an issue with the bundler
 */
class BundlerError extends AccountAbstractionError {
    constructor(message, response) {
        super(`Bundler Error: ${message}`);
        this.name = 'BundlerError';
        this.response = response;
    }
}
exports.BundlerError = BundlerError;
/**
 * Error thrown when a transaction is rejected
 */
class TransactionRejectedError extends SoneiumError {
    constructor(message, reason) {
        super(`Transaction Rejected: ${message}`);
        this.name = 'TransactionRejectedError';
        this.reason = reason;
    }
}
exports.TransactionRejectedError = TransactionRejectedError;
/**
 * Error thrown when gas estimation fails
 */
class GasEstimationError extends SoneiumError {
    constructor(message) {
        super(`Gas Estimation Error: ${message}`);
        this.name = 'GasEstimationError';
    }
}
exports.GasEstimationError = GasEstimationError;
//# sourceMappingURL=errors.js.map