/**
 * Type definitions for the Soneium blockchain client
 */
import { Logger, LogLevel } from './logger';
/**
 * Network configuration
 */
export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
}
/**
 * Account Abstraction configuration
 */
export interface AccountAbstractionConfig {
    bundlerUrl: string;
    paymasterUrl: string;
    entryPointAddress: string;
}
/**
 * Soneium client configuration
 */
export interface SoneiumConfig {
    mainnet: NetworkConfig;
    testnet: NetworkConfig;
    defaultTimeout: number;
    accountAbstraction: AccountAbstractionConfig;
}
/**
 * Network type
 */
export type NetworkType = 'mainnet' | 'testnet';
/**
 * Client options
 */
export interface ClientOptions {
    /**
     * Timeout for RPC requests in milliseconds
     */
    timeout?: number;
    /**
     * Logger instance
     */
    logger?: Logger;
    /**
     * Log level
     */
    logLevel?: LogLevel;
    /**
     * Whether to enable logging
     */
    enableLogging?: boolean;
}
/**
 * Transaction request parameters
 */
export interface TransactionRequest {
    to: string;
    data?: string;
    value?: bigint;
    gasLimit?: bigint;
}
/**
 * User operation for Account Abstraction
 */
export interface UserOperation {
    sender: string;
    nonce: bigint;
    initCode: string;
    callData: string;
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
    paymasterAndData: string;
    signature: string;
}
/**
 * Paymaster request parameters
 */
export interface PaymasterRequest {
    userOp: Partial<UserOperation>;
    sponsorType: 'gasless' | 'token';
    token?: string;
}
/**
 * Paymaster response
 */
export interface PaymasterResponse {
    paymasterAndData: string;
}
/**
 * Gas estimation result
 */
export interface GasEstimationResult {
    /**
     * Gas limit for the transaction
     */
    gasLimit: bigint;
    /**
     * Max fee per gas
     */
    maxFeePerGas?: bigint;
    /**
     * Max priority fee per gas
     */
    maxPriorityFeePerGas?: bigint;
}
/**
 * User operation gas estimation result
 */
export interface UserOperationGasEstimationResult {
    /**
     * Gas limit for the call
     */
    callGasLimit: bigint;
    /**
     * Gas limit for verification
     */
    verificationGasLimit: bigint;
    /**
     * Pre-verification gas
     */
    preVerificationGas: bigint;
    /**
     * Max fee per gas
     */
    maxFeePerGas: bigint;
    /**
     * Max priority fee per gas
     */
    maxPriorityFeePerGas: bigint;
}
