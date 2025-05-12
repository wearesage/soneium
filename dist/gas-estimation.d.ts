/**
 * Gas estimation utilities for the Soneium blockchain client
 */
import { PublicClient, Address } from 'viem';
import { Logger } from './logger';
/**
 * Gas estimation options
 */
export interface GasEstimationOptions {
    /**
     * Buffer percentage to add to the estimated gas (default: 20%)
     */
    bufferPercentage?: number;
    /**
     * Maximum gas limit to use (default: 10000000)
     */
    maxGasLimit?: bigint;
    /**
     * Logger instance
     */
    logger?: Logger;
}
/**
 * Estimate gas for a transaction
 * @param client - The public client
 * @param tx - The transaction to estimate gas for
 * @param options - Gas estimation options
 * @returns The estimated gas limit
 */
export declare function estimateGas(client: PublicClient, tx: {
    from: Address;
    to: Address;
    data?: `0x${string}`;
    value?: bigint;
}, options?: GasEstimationOptions): Promise<bigint>;
/**
 * Estimate gas for an AA transaction
 * @param client - The public client
 * @param entryPointAddress - The entry point address
 * @param userOp - The user operation
 * @param options - Gas estimation options
 * @returns The estimated gas parameters
 */
export declare function estimateUserOperationGas(client: PublicClient, entryPointAddress: Address, userOp: {
    sender: Address;
    callData: `0x${string}`;
    initCode?: `0x${string}`;
}, options?: GasEstimationOptions): Promise<{
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
}>;
/**
 * Get current gas prices from the network
 * @param client - The public client
 * @param options - Gas estimation options
 * @returns The current gas prices
 */
export declare function getCurrentGasPrices(client: PublicClient, options?: GasEstimationOptions): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
}>;
/**
 * Create a gas estimation middleware for AA transactions
 * @param client - The public client
 * @param entryPointAddress - The entry point address
 * @param options - Gas estimation options
 * @returns The gas estimation middleware
 */
export declare function createGasEstimationMiddleware(client: PublicClient, entryPointAddress: Address, options?: GasEstimationOptions): {
    gasEstimator: (userOp: any) => Promise<any>;
};
