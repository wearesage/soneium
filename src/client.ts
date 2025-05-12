/**
 * Soneium blockchain client implementation
 */

import { createPublicClient, http, PublicClient, createWalletClient, WalletClient, Account, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import axios from 'axios';
import { NETWORKS, DEFAULT_NETWORK, SONEIUM_CONFIG } from './config';
import { NetworkType, TransactionRequest, PaymasterRequest, PaymasterResponse, UserOperation, ClientOptions } from './types';
import { getSoneiumChain } from './chains';
import { estimateUserOperationGas } from './gas-estimation';
import {
  createSoneiumAAClient,
  createSoneiumPublicClient,
  sendTransaction as sendAATransaction,
  sendSponsoredTransaction
} from './account-abstraction';
import {
  SoneiumError,
  RpcError,
  RpcTimeoutError,
  WalletError,
  AccountAbstractionError,
  PaymasterError,
  BundlerError,
  TransactionRejectedError,
  GasEstimationError
} from './errors';
import { Logger, defaultLogger, LogLevel, ConsoleLogger, NoopLogger } from './logger';
import { estimateGas, getCurrentGasPrices } from './gas-estimation';

/**
 * SoneiumClient class for interacting with the Soneium blockchain
 */
export class SoneiumClient {
  private publicClient: PublicClient;
  private walletClient: WalletClient | null = null;
  private account: Account | null = null;
  private networkType: NetworkType;
  private logger: Logger;
  private timeout: number;

  /**
   * Create a new SoneiumClient instance
   * @param networkType - The network type to connect to (mainnet or testnet)
   */
  /**
   * Create a new SoneiumClient instance
   * @param networkType - The network type to connect to (mainnet or testnet)
   * @param options - Client options
   */
  constructor(networkType: NetworkType = DEFAULT_NETWORK, options: ClientOptions = {}) {
    this.networkType = networkType;
    this.timeout = options.timeout || SONEIUM_CONFIG.defaultTimeout;
    
    // Set up logger
    if (options.logger) {
      this.logger = options.logger;
    } else if (options.logLevel !== undefined) {
      this.logger = new ConsoleLogger(options.logLevel);
    } else if (options.enableLogging === false) {
      this.logger = new NoopLogger();
    } else {
      this.logger = defaultLogger;
    }
    
    this.logger.info(`Creating Soneium client for ${networkType}`);
    
    const chain = getSoneiumChain(networkType);

    try {
      // Create a public client for reading from the blockchain
      this.publicClient = createPublicClient({
        chain,
        transport: http(chain.rpcUrls.default.http[0], {
          timeout: this.timeout,
        }),
      });
      
      this.logger.debug('Public client created successfully');
    } catch (error) {
      this.logger.error('Failed to create public client', error);
      throw new RpcError(`Failed to create public client: ${(error as Error).message}`);
    }
  }

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
  public connectWallet(privateKey: string): string {
    this.logger.info('Connecting wallet');
    
    try {
      const chain = getSoneiumChain(this.networkType);
      
      // Create an account from the private key
      this.account = privateKeyToAccount(privateKey as `0x${string}`);
      
      // Create a wallet client for sending transactions
      this.walletClient = createWalletClient({
        account: this.account,
        chain,
        transport: http(chain.rpcUrls.default.http[0], {
          timeout: this.timeout,
        }),
      });
      
      this.logger.info('Wallet connected successfully', { address: this.account.address });
      return this.account.address;
    } catch (error) {
      this.logger.error('Failed to connect wallet', error);
      throw new WalletError(`Failed to connect wallet: ${(error as Error).message}`);
    }
  }

  /**
   * Get the current block number
   * @returns The current block number
   */
  /**
   * Get the current block number
   * @returns The current block number
   */
  public async getBlockNumber(): Promise<bigint> {
    this.logger.debug('Getting block number');
    
    try {
      const blockNumber = await this.publicClient.getBlockNumber();
      this.logger.debug('Block number retrieved', { blockNumber });
      return blockNumber;
    } catch (error) {
      this.logger.error('Failed to get block number', error);
      throw new RpcError(`Failed to get block number: ${(error as Error).message}`);
    }
  }

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
  public async getBalance(address: string): Promise<bigint> {
    this.logger.debug('Getting balance', { address });
    
    try {
      const balance = await this.publicClient.getBalance({ address: address as `0x${string}` });
      this.logger.debug('Balance retrieved', { address, balance });
      return balance;
    } catch (error) {
      this.logger.error('Failed to get balance', { address, error });
      throw new RpcError(`Failed to get balance for ${address}: ${(error as Error).message}`);
    }
  }

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
  public async sendTransaction(transaction: TransactionRequest): Promise<string> {
    this.logger.info('Sending transaction', { to: transaction.to, value: transaction.value });
    
    if (!this.walletClient || !this.account) {
      this.logger.error('Wallet not connected');
      throw new WalletError('Wallet not connected. Call connectWallet first.');
    }

    try {
      // Estimate gas if not provided
      let gas = transaction.gasLimit;
      if (!gas) {
        this.logger.debug('Estimating gas for transaction');
        gas = await estimateGas(
          this.publicClient,
          {
            from: this.account.address as `0x${string}`,
            to: transaction.to as `0x${string}`,
            data: transaction.data as `0x${string}` | undefined,
            value: transaction.value,
          },
          { logger: this.logger }
        );
      }

      const txHash = await this.walletClient.sendTransaction({
        account: this.account,
        chain: this.walletClient.chain,
        to: transaction.to as `0x${string}`,
        value: transaction.value,
        data: transaction.data as `0x${string}` | undefined,
        gas,
      });

      this.logger.info('Transaction sent successfully', { txHash });
      return txHash;
    } catch (error) {
      this.logger.error('Failed to send transaction', error);
      
      if ((error as any).code === 4001) {
        throw new TransactionRejectedError('Transaction rejected by user');
      }
      
      throw new RpcError(`Failed to send transaction: ${(error as Error).message}`);
    }
  }

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
  public async createUserOperation(transaction: TransactionRequest): Promise<Partial<UserOperation>> {
    this.logger.info('Creating user operation', { to: transaction.to, value: transaction.value });
    
    if (!this.account) {
      this.logger.error('Wallet not connected');
      throw new WalletError('Wallet not connected. Call connectWallet first.');
    }

    try {
      // Get the entry point address
      const entryPointAddress = SONEIUM_CONFIG.accountAbstraction.entryPointAddress as `0x${string}`;
      
      // Create a smart account client
      const { smartAccountClient, publicClient } = await createSoneiumAAClient(
        'dummy-key', // We don't need a real key here since we're just creating the user op
        this.networkType,
        false,
        undefined,
        { logger: this.logger }
      );
      
      // Estimate gas parameters
      const { callGasLimit, verificationGasLimit, preVerificationGas } = await estimateUserOperationGas(
        publicClient,
        entryPointAddress,
        {
          sender: this.account.address as `0x${string}`,
          callData: transaction.data as `0x${string}` || '0x',
          initCode: '0x',
        },
        { logger: this.logger }
      );
      
      // Get current gas prices
      const { maxFeePerGas, maxPriorityFeePerGas } = await getCurrentGasPrices(
        publicClient,
        { logger: this.logger }
      );
      
      // Create the user operation
      const userOp: Partial<UserOperation> = {
        sender: this.account.address,
        callData: transaction.data || '0x',
        nonce: 0n, // In a real implementation, this would be fetched from the contract
        initCode: '0x',
        callGasLimit,
        verificationGasLimit,
        preVerificationGas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        paymasterAndData: '0x',
        signature: '0x'
      };

      this.logger.debug('User operation created', userOp);
      return userOp;
    } catch (error) {
      this.logger.error('Failed to create user operation', error);
      
      if (error instanceof GasEstimationError ||
          error instanceof AccountAbstractionError) {
        throw error;
      }
      
      throw new AccountAbstractionError(`Failed to create user operation: ${(error as Error).message}`);
    }
  }

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
  public async getPaymasterSignature(
    userOp: Partial<UserOperation>,
    sponsorType: 'gasless' | 'token' = 'gasless',
    apiKey?: string
  ): Promise<PaymasterResponse> {
    this.logger.info('Getting paymaster signature', { sponsorType });
    
    if (!apiKey) {
      this.logger.error('API key is required for paymaster');
      throw new PaymasterError('API key is required for paymaster operations');
    }
    
    const request: PaymasterRequest = {
      userOp,
      sponsorType,
    };

    try {
      this.logger.debug('Sending paymaster request', { url: SONEIUM_CONFIG.accountAbstraction.paymasterUrl });
      
      const response = await axios.post(
        SONEIUM_CONFIG.accountAbstraction.paymasterUrl,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: this.timeout,
        }
      );

      this.logger.debug('Paymaster response received', { data: response.data });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get paymaster signature', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new RpcTimeoutError(
            SONEIUM_CONFIG.accountAbstraction.paymasterUrl,
            this.timeout
          );
        }
        
        if (error.response) {
          throw new PaymasterError(
            `Paymaster error: ${error.response.data?.message || error.message}`,
            error.response.data
          );
        }
      }
      
      throw new PaymasterError(`Failed to get paymaster signature: ${(error as Error).message}`);
    }
  }

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
  public async sendUserOperation(userOp: UserOperation, apiKey?: string): Promise<string> {
    this.logger.info('Sending user operation to bundler');
    
    try {
      this.logger.debug('Sending request to bundler', {
        url: SONEIUM_CONFIG.accountAbstraction.bundlerUrl,
        userOp
      });
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await axios.post(
        SONEIUM_CONFIG.accountAbstraction.bundlerUrl,
        {
          jsonrpc: '2.0',
          method: 'eth_sendUserOperation',
          params: [userOp, SONEIUM_CONFIG.accountAbstraction.entryPointAddress],
          id: 1,
        },
        {
          headers,
          timeout: this.timeout,
        }
      );

      if (response.data.error) {
        this.logger.error('Bundler returned an error', response.data.error);
        throw new BundlerError(
          `Bundler error: ${response.data.error.message || JSON.stringify(response.data.error)}`,
          response.data.error
        );
      }

      this.logger.info('User operation sent successfully', { hash: response.data.result });
      return response.data.result;
    } catch (error) {
      this.logger.error('Failed to send user operation', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new RpcTimeoutError(
            SONEIUM_CONFIG.accountAbstraction.bundlerUrl,
            this.timeout
          );
        }
        
        if (error.response) {
          throw new BundlerError(
            `Bundler error: ${error.response.data?.error?.message || error.message}`,
            error.response.data
          );
        }
      }
      
      if (error instanceof BundlerError) {
        throw error;
      }
      
      throw new BundlerError(`Failed to send user operation: ${(error as Error).message}`);
    }
  }

  /**
   * Get the current network type
   * @returns The current network type
   */
  /**
   * Get the current network type
   * @returns The current network type
   */
  public getNetworkType(): NetworkType {
    return this.networkType;
  }

  /**
   * Switch to a different network
   * @param networkType - The network type to switch to
   */
  /**
   * Switch to a different network
   * @param networkType - The network type to switch to
   */
  public switchNetwork(networkType: NetworkType): void {
    this.logger.info(`Switching network from ${this.networkType} to ${networkType}`);
    
    try {
      this.networkType = networkType;
      const chain = getSoneiumChain(networkType);

      // Recreate the public client with the new network
      this.publicClient = createPublicClient({
        chain,
        transport: http(chain.rpcUrls.default.http[0], {
          timeout: this.timeout,
        }),
      });

      // Recreate the wallet client if an account is connected
      if (this.account) {
        this.walletClient = createWalletClient({
          account: this.account,
          chain,
          transport: http(chain.rpcUrls.default.http[0], {
            timeout: this.timeout,
          }),
        });
      }
      
      this.logger.info('Network switched successfully');
    } catch (error) {
      this.logger.error('Failed to switch network', error);
      throw new RpcError(`Failed to switch network: ${(error as Error).message}`);
    }
  }

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
  public async sendAATransaction(
    transaction: TransactionRequest,
    privateKey?: string,
    options: {
      gasBufferPercentage?: number;
    } = {}
  ): Promise<string> {
    this.logger.info('Sending AA transaction', { to: transaction.to, value: transaction.value });
    
    // Check if we have a wallet connected or a private key provided
    if (!privateKey && !this.account) {
      this.logger.error('No wallet connected and no private key provided');
      throw new AccountAbstractionError('Wallet not connected. Call connectWallet first or provide a privateKey.');
    }
    
    // If privateKey is provided, use it; otherwise we need to throw an error
    // because we can't access the private key from the account object for security reasons
    if (!privateKey) {
      this.logger.error('Private key must be provided for AA transactions');
      throw new AccountAbstractionError('Private key must be provided for AA transactions when using a connected wallet.');
    }
    
    try {
      const pk = privateKey;
      
      // Create a smart account client
      const { smartAccountClient } = await createSoneiumAAClient(
        pk,
        this.networkType,
        false,
        undefined,
        {
          timeout: this.timeout,
          logger: this.logger,
          gasBufferPercentage: options.gasBufferPercentage,
        }
      );
      
      // Send the transaction
      const hash = await smartAccountClient.sendTransaction({
        to: transaction.to as `0x${string}`,
        value: transaction.value,
        data: transaction.data as `0x${string}` | undefined,
      });
      
      this.logger.info('AA transaction sent successfully', { hash });
      return hash;
    } catch (error) {
      this.logger.error('Failed to send AA transaction', error);
      
      if (error instanceof AccountAbstractionError ||
          error instanceof PaymasterError ||
          error instanceof BundlerError ||
          error instanceof RpcError) {
        throw error;
      }
      
      throw new AccountAbstractionError(`Failed to send AA transaction: ${(error as Error).message}`);
    }
  }

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
  public async sendSponsoredTransaction(
    transaction: TransactionRequest,
    apiKey: string,
    privateKey?: string,
    options: {
      gasBufferPercentage?: number;
    } = {}
  ): Promise<string> {
    this.logger.info('Sending sponsored transaction', { to: transaction.to, value: transaction.value });
    
    if (!apiKey) {
      this.logger.error('API key is required for sponsored transactions');
      throw new PaymasterError('API key is required for sponsored transactions');
    }
    
    // Check if we have a wallet connected or a private key provided
    if (!privateKey && !this.account) {
      this.logger.error('No wallet connected and no private key provided');
      throw new AccountAbstractionError('Wallet not connected. Call connectWallet first or provide a privateKey.');
    }
    
    // If privateKey is provided, use it; otherwise we need to throw an error
    // because we can't access the private key from the account object for security reasons
    if (!privateKey) {
      this.logger.error('Private key must be provided for sponsored transactions');
      throw new AccountAbstractionError('Private key must be provided for sponsored transactions when using a connected wallet.');
    }
    
    try {
      const pk = privateKey;
      
      // Create a smart account client with sponsorship
      const { smartAccountClient } = await createSoneiumAAClient(
        pk,
        this.networkType,
        true,
        apiKey,
        {
          timeout: this.timeout,
          logger: this.logger,
          gasBufferPercentage: options.gasBufferPercentage,
        }
      );
      
      // Send the transaction
      const hash = await smartAccountClient.sendTransaction({
        to: transaction.to as `0x${string}`,
        value: transaction.value,
        data: transaction.data as `0x${string}` | undefined,
      });
      
      this.logger.info('Sponsored transaction sent successfully', { hash });
      return hash;
    } catch (error) {
      this.logger.error('Failed to send sponsored transaction', error);
      
      if (error instanceof AccountAbstractionError ||
          error instanceof PaymasterError ||
          error instanceof BundlerError ||
          error instanceof RpcError) {
        throw error;
      }
      
      throw new AccountAbstractionError(`Failed to send sponsored transaction: ${(error as Error).message}`);
    }
  }

  /**
   * Estimate gas for a transaction
   * @param tx - The transaction to estimate gas for
   * @param options - Gas estimation options
   * @returns The estimated gas limit
   */
  public async estimateGas(
    tx: {
      to: string;
      data?: string;
      value?: bigint;
    },
    options: {
      bufferPercentage?: number;
      maxGasLimit?: bigint;
    } = {}
  ): Promise<bigint> {
    this.logger.debug('Estimating gas for transaction', tx);
    
    if (!this.account) {
      this.logger.error('Wallet not connected');
      throw new WalletError('Wallet not connected. Call connectWallet first.');
    }

    try {
      return await estimateGas(
        this.publicClient,
        {
          from: this.account.address as `0x${string}`,
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}` | undefined,
          value: tx.value,
        },
        {
          bufferPercentage: options.bufferPercentage,
          maxGasLimit: options.maxGasLimit,
          logger: this.logger,
        }
      );
    } catch (error) {
      this.logger.error('Failed to estimate gas', error);
      throw new GasEstimationError(`Failed to estimate gas: ${(error as Error).message}`);
    }
  }

  /**
   * Get current gas prices from the network
   * @param options - Gas estimation options
   * @returns The current gas prices (maxFeePerGas and maxPriorityFeePerGas)
   */
  public async getCurrentGasPrices(
    options: {
      bufferPercentage?: number;
    } = {}
  ): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }> {
    this.logger.debug('Getting current gas prices');
    
    try {
      return await getCurrentGasPrices(
        this.publicClient,
        {
          bufferPercentage: options.bufferPercentage,
          logger: this.logger,
        }
      );
    } catch (error) {
      this.logger.error('Failed to get current gas prices', error);
      throw new GasEstimationError(`Failed to get current gas prices: ${(error as Error).message}`);
    }
  }
  
  /**
   * Make a read-only call to a contract
   * @param callData - The call data containing to and data properties
   * @returns The result of the call
   */
  public async call(callData: {
    to: string;
    data: string;
  }): Promise<unknown> {
    this.logger.debug('Making read-only call to contract', callData);
    
    try {
      // Use the publicClient to make a read-only call
      const result = await this.publicClient.call({
        to: callData.to as `0x${string}`,
        data: callData.data as `0x${string}`
      });
      
      this.logger.debug('Call result received', { result });
      // Convert the result to a string to match the declared return type
      return result;
    } catch (error) {
      this.logger.error('Failed to make contract call', error);
      throw new RpcError(`Failed to make contract call: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get the logger instance
   * @returns The logger instance
   */
  public getLogger(): Logger {
    return this.logger;
  }
  
  /**
   * Set the log level
   * @param level - The log level to set
   */
  public setLogLevel(level: LogLevel): void {
    if (this.logger instanceof ConsoleLogger) {
      this.logger.setLevel(level);
    } else {
      this.logger = new ConsoleLogger(level);
    }
  }
}