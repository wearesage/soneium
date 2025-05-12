/**
 * Soneium blockchain client implementation
 */
import { NetworkType, TransactionRequest, PaymasterResponse, UserOperation, ClientOptions } from './types';
import { Logger, LogLevel } from './logger';
/**
 * SoneiumClient class for interacting with the Soneium blockchain
 */
export declare class SoneiumClient {
    private publicClient;
    private walletClient;
    private account;
    private networkType;
    private logger;
    private timeout;
    /**
     * Create a new SoneiumClient instance
     * @param networkType - The network type to connect to (mainnet or testnet)
     */
    /**
     * Create a new SoneiumClient instance
     * @param networkType - The network type to connect to (mainnet or testnet)
     * @param options - Client options
     */
    constructor(networkType?: NetworkType, options?: ClientOptions);
    /**
     * Connect a wallet using a private key
     * @param privateKey - The private key to use for signing transactions
     * @returns The connected account address
     */
    /**
     * Connect a wallet using a private key
     * @param privateKey - The private key to use for signing transactions
     * @returns The connected account address
     */
    connectWallet(privateKey: string): string;
    /**
     * Get the current block number
     * @returns The current block number
     */
    /**
     * Get the current block number
     * @returns The current block number
     */
    getBlockNumber(): Promise<bigint>;
    /**
     * Get the balance of an address
     * @param address - The address to get the balance for
     * @returns The balance in wei
     */
    /**
     * Get the balance of an address
     * @param address - The address to get the balance for
     * @returns The balance in wei
     */
    getBalance(address: string): Promise<bigint>;
    /**
     * Send a transaction
     * @param transaction - The transaction to send
     * @returns The transaction hash
     */
    /**
     * Send a transaction
     * @param transaction - The transaction to send
     * @returns The transaction hash
     */
    sendTransaction(transaction: TransactionRequest): Promise<string>;
    /**
     * Create a user operation for account abstraction
     * @param transaction - The transaction to create a user operation for
     * @returns The user operation
     */
    /**
     * Create a user operation for account abstraction
     * @param transaction - The transaction to create a user operation for
     * @returns The user operation
     */
    createUserOperation(transaction: TransactionRequest): Promise<Partial<UserOperation>>;
    /**
     * Get a paymaster signature for a user operation
     * @param userOp - The user operation to get a signature for
     * @param sponsorType - The type of sponsorship (gasless or token)
     * @returns The paymaster response
     */
    /**
     * Get a paymaster signature for a user operation
     * @param userOp - The user operation to get a signature for
     * @param sponsorType - The type of sponsorship (gasless or token)
     * @param apiKey - The API key for the paymaster
     * @returns The paymaster response
     */
    getPaymasterSignature(userOp: Partial<UserOperation>, sponsorType?: 'gasless' | 'token', apiKey?: string): Promise<PaymasterResponse>;
    /**
     * Send a user operation to the bundler
     * @param userOp - The user operation to send
     * @returns The user operation hash
     */
    /**
     * Send a user operation to the bundler
     * @param userOp - The user operation to send
     * @param apiKey - The API key for the bundler (if required)
     * @returns The user operation hash
     */
    sendUserOperation(userOp: UserOperation, apiKey?: string): Promise<string>;
    /**
     * Get the current network type
     * @returns The current network type
     */
    /**
     * Get the current network type
     * @returns The current network type
     */
    getNetworkType(): NetworkType;
    /**
     * Switch to a different network
     * @param networkType - The network type to switch to
     */
    /**
     * Switch to a different network
     * @param networkType - The network type to switch to
     */
    switchNetwork(networkType: NetworkType): void;
    /**
     * Send a transaction using account abstraction
     * @param transaction - The transaction to send
     * @param privateKey - The private key to use (if different from the connected wallet)
     * @returns The transaction hash
     */
    /**
     * Send a transaction using account abstraction
     * @param transaction - The transaction to send
     * @param privateKey - The private key to use (if different from the connected wallet)
     * @param options - Additional options for the transaction
     * @returns The transaction hash
     */
    sendAATransaction(transaction: TransactionRequest, privateKey?: string, options?: {
        gasBufferPercentage?: number;
    }): Promise<string>;
    /**
     * Send a sponsored (gasless) transaction using account abstraction
     * @param transaction - The transaction to send
     * @param apiKey - The API key for the paymaster
     * @param privateKey - The private key to use (if different from the connected wallet)
     * @returns The transaction hash
     */
    /**
     * Send a sponsored (gasless) transaction using account abstraction
     * @param transaction - The transaction to send
     * @param apiKey - The API key for the paymaster
     * @param privateKey - The private key to use (if different from the connected wallet)
     * @param options - Additional options for the transaction
     * @returns The transaction hash
     */
    sendSponsoredTransaction(transaction: TransactionRequest, apiKey: string, privateKey?: string, options?: {
        gasBufferPercentage?: number;
    }): Promise<string>;
    /**
     * Estimate gas for a transaction
     * @param tx - The transaction to estimate gas for
     * @param options - Gas estimation options
     * @returns The estimated gas limit
     */
    estimateGas(tx: {
        to: string;
        data?: string;
        value?: bigint;
    }, options?: {
        bufferPercentage?: number;
        maxGasLimit?: bigint;
    }): Promise<bigint>;
    /**
     * Get current gas prices from the network
     * @param options - Gas estimation options
     * @returns The current gas prices (maxFeePerGas and maxPriorityFeePerGas)
     */
    getCurrentGasPrices(options?: {
        bufferPercentage?: number;
    }): Promise<{
        maxFeePerGas: bigint;
        maxPriorityFeePerGas: bigint;
    }>;
    /**
     * Make a read-only call to a contract
     * @param callData - The call data containing to and data properties
     * @returns The result of the call
     */
    call(callData: {
        to: string;
        data: string;
    }): Promise<unknown>;
    /**
     * Get the logger instance
     * @returns The logger instance
     */
    getLogger(): Logger;
    /**
     * Set the log level
     * @param level - The log level to set
     */
    setLogLevel(level: LogLevel): void;
}
