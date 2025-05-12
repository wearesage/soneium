/**
 * Account Abstraction functionality for Soneium blockchain
 * Using permissionless for account abstraction
 */
declare const createSmartAccountClient: any, SmartAccount: any;
import { type PublicClient } from 'viem';
import { NetworkType } from './types';
import { Logger } from './logger';
/**
 * Create a public client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The public client
 */
export declare function createSoneiumPublicClient(networkType?: NetworkType, options?: {
    timeout?: number;
    logger?: Logger;
}): any;
/**
 * Create a bundler client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The bundler client
 */
export declare function createSoneiumBundlerClient(networkType?: NetworkType, options?: {
    timeout?: number;
    logger?: Logger;
}): any;
/**
 * Create a smart account for the Soneium network
 * @param publicClient - The public client
 * @param privateKey - The private key for the EOA
 * @returns The smart account
 */
export declare function createSoneiumSmartAccount(publicClient: PublicClient, privateKey: string, options?: {
    logger?: Logger;
}): Promise<typeof SmartAccount>;
/**
 * Create middleware for sponsored transactions
 * @param apiKey - The API key for the paymaster (optional, uses config if not provided)
 * @returns The sponsorship middleware
 */
export declare function createSoneiumSponsorshipMiddleware(apiKey?: string, options?: {
    timeout?: number;
    logger?: Logger;
}): any;
/**
 * Helper function to create a smart account client for Soneium
 * @param privateKey - The private key for the EOA
 * @param networkType - The network type
 * @param withSponsorship - Whether to use sponsorship for gas
 * @param apiKey - The API key for the paymaster (required if withSponsorship is true)
 * @returns The smart account client and account address
 */
export declare function createSoneiumAAClient(privateKey: string, networkType?: NetworkType, withSponsorship?: boolean, apiKey?: string, options?: {
    timeout?: number;
    logger?: Logger;
    gasBufferPercentage?: number;
}): Promise<any>;
/**
 * Send a transaction through a smart account
 * @param client - The smart account client
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @returns The transaction hash
 */
export declare function sendTransaction(client: ReturnType<typeof createSmartAccountClient>, to: string, amount: string, options?: {
    logger?: Logger;
}): Promise<any>;
/**
 * Send a sponsored transaction through a smart account
 * @param privateKey - The private key for the EOA
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @param apiKey - The API key for the paymaster
 * @param networkType - The network type
 * @returns The transaction hash
 */
export declare function sendSponsoredTransaction(privateKey: string, to: string, amount: string, apiKey: string, networkType?: NetworkType, options?: {
    timeout?: number;
    logger?: Logger;
    gasBufferPercentage?: number;
}): Promise<any>;
export {};
