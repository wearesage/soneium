/**
 * Custom error types for the Soneium blockchain client
 */

/**
 * Base error class for Soneium client errors
 */
export class SoneiumError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SoneiumError';
  }
}

/**
 * Error thrown when there's an issue with the RPC connection
 */
export class RpcError extends SoneiumError {
  public readonly code?: number;
  public readonly data?: any;
  public readonly url?: string;
  public readonly method?: string;

  constructor(message: string, options?: { code?: number; data?: any; url?: string; method?: string }) {
    super(`RPC Error: ${message}`);
    this.name = 'RpcError';
    this.code = options?.code;
    this.data = options?.data;
    this.url = options?.url;
    this.method = options?.method;
  }
}

/**
 * Error thrown when an RPC request times out
 */
export class RpcTimeoutError extends RpcError {
  constructor(url: string, timeoutMs: number) {
    super(`Request to ${url} timed out after ${timeoutMs}ms`, { url });
    this.name = 'RpcTimeoutError';
  }
}

/**
 * Error thrown when there's an issue with the wallet
 */
export class WalletError extends SoneiumError {
  constructor(message: string) {
    super(`Wallet Error: ${message}`);
    this.name = 'WalletError';
  }
}

/**
 * Error thrown when there's an issue with account abstraction
 */
export class AccountAbstractionError extends SoneiumError {
  constructor(message: string) {
    super(`Account Abstraction Error: ${message}`);
    this.name = 'AccountAbstractionError';
  }
}

/**
 * Error thrown when there's an issue with the paymaster
 */
export class PaymasterError extends AccountAbstractionError {
  public readonly response?: any;
  
  constructor(message: string, response?: any) {
    super(`Paymaster Error: ${message}`);
    this.name = 'PaymasterError';
    this.response = response;
  }
}

/**
 * Error thrown when there's an issue with the bundler
 */
export class BundlerError extends AccountAbstractionError {
  public readonly response?: any;
  
  constructor(message: string, response?: any) {
    super(`Bundler Error: ${message}`);
    this.name = 'BundlerError';
    this.response = response;
  }
}

/**
 * Error thrown when a transaction is rejected
 */
export class TransactionRejectedError extends SoneiumError {
  public readonly reason?: string;
  
  constructor(message: string, reason?: string) {
    super(`Transaction Rejected: ${message}`);
    this.name = 'TransactionRejectedError';
    this.reason = reason;
  }
}

/**
 * Error thrown when gas estimation fails
 */
export class GasEstimationError extends SoneiumError {
  constructor(message: string) {
    super(`Gas Estimation Error: ${message}`);
    this.name = 'GasEstimationError';
  }
}