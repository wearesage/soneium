/**
 * Account Abstraction functionality for Soneium blockchain
 * Using permissionless for account abstraction
 */
const {
  createSmartAccountClient,
  createBundlerClient,
  ENTRYPOINT_ADDRESS_V07,
  createPaymasterMiddleware,
  SmartAccount
} = require('permissionless');

// Import the correct function from permissionless
const { toSimpleSmartAccount } = require('permissionless/accounts');

import {
  createPublicClient,
  http,
  parseEther,
  Address,
  type PublicClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SONEIUM_CONFIG } from './config';
import { NetworkType } from './types';
import { getSoneiumChain } from './chains';
import {
  AccountAbstractionError,
  PaymasterError,
  BundlerError,
  RpcError,
  RpcTimeoutError
} from './errors';
import { Logger, defaultLogger } from './logger';
import {
  createGasEstimationMiddleware,
} from './gas-estimation';

// Use the factory address from the config
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = SONEIUM_CONFIG.accountAbstraction.factoryAddress;

/**
 * Create a public client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The public client
 */
export function createSoneiumPublicClient(
  networkType: NetworkType = 'testnet',
  options: { timeout?: number; logger?: Logger } = {}
): any {
  const chain = getSoneiumChain(networkType);
  const logger = options.logger || defaultLogger;
  
  logger.debug(`Creating public client for ${networkType}`);
  
  try {
    return createPublicClient({
      chain,
      transport: http(chain.rpcUrls.default.http[0], {
        timeout: options.timeout || SONEIUM_CONFIG.defaultTimeout,
      }),
    });
  } catch (error) {
    logger.error('Failed to create public client', error);
    throw new AccountAbstractionError(`Failed to create public client: ${(error as Error).message}`);
  }
}

/**
 * Create a bundler client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The bundler client
 */
export function createSoneiumBundlerClient(
  networkType: NetworkType = 'testnet',
  options: { timeout?: number; logger?: Logger } = {}
) {
  const chain = getSoneiumChain(networkType);
  const logger = options.logger || defaultLogger;
  
  logger.debug(`Creating bundler client for ${networkType}`);
  
  try {
    return createBundlerClient({
      chain,
      transport: http(SONEIUM_CONFIG.accountAbstraction.bundlerUrl, {
        timeout: options.timeout || SONEIUM_CONFIG.defaultTimeout,
      }),
      entryPoint: ENTRYPOINT_ADDRESS_V07,
    });
  } catch (error) {
    logger.error('Failed to create bundler client', error);
    throw new AccountAbstractionError(`Failed to create bundler client: ${(error as Error).message}`);
  }
}

/**
 * Create a smart account for the Soneium network
 * @param publicClient - The public client
 * @param privateKey - The private key for the EOA
 * @returns The smart account
 */
export async function createSoneiumSmartAccount(
  publicClient: PublicClient,
  privateKey: string,
  options: { logger?: Logger } = {}
): Promise<typeof SmartAccount> {
  const logger = options.logger || defaultLogger;
  
  logger.debug('Creating smart account');
  
  try {
    // Create an account from the private key
    const owner = privateKeyToAccount(privateKey as `0x${string}`);
    
    // Create a smart account using the correct function
    const account = await toSimpleSmartAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      signer: owner,
      factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
    });
    
    logger.debug('Smart account created', { address: account.address });
    
    return account;
  } catch (error) {
    logger.error('Failed to create smart account', error);
    throw new AccountAbstractionError(`Failed to create smart account: ${(error as Error).message}`);
  }
}

/**
 * Create middleware for sponsored transactions
 * @param apiKey - The API key for the paymaster (optional, uses config if not provided)
 * @returns The sponsorship middleware
 */
export function createSoneiumSponsorshipMiddleware(
  apiKey?: string,
  options: { timeout?: number; logger?: Logger } = {}
) {
  const logger = options.logger || defaultLogger;
  
  // Use the provided API key or the one from the config
  const paymasterApiKey = apiKey || SONEIUM_CONFIG.accountAbstraction.paymasterApiKey;
  
  if (!paymasterApiKey) {
    logger.error('Paymaster API key is missing');
    throw new PaymasterError('Paymaster API key is required. Provide it as a parameter or set SONEIUM_PAYMASTER_API_KEY in .env');
  }
  
  logger.debug('Creating sponsorship middleware');
  
  return createPaymasterMiddleware({
    dummyPaymasterDataMiddleware: async (userOperation) => {
      // Structure expected by SCS Paymaster
      logger.debug('Generating dummy paymaster data', { userOperation });
      return "0x";
    },
    paymasterDataMiddleware: async (userOperation) => {
      logger.debug('Requesting paymaster data', { userOperation });
      
      try {
        // Call the SCS Paymaster API for sponsorship
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || SONEIUM_CONFIG.defaultTimeout);
        
        const response = await fetch(SONEIUM_CONFIG.accountAbstraction.paymasterUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${paymasterApiKey}`,
          },
          body: JSON.stringify({ userOperation }),
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
        
        const data = await response.json();
        
        if (!response.ok) {
          logger.error('Paymaster request failed', { status: response.status, data });
          throw new PaymasterError(`Paymaster request failed: ${data.message || JSON.stringify(data)}`, data);
        }
        
        logger.debug('Received paymaster data', { paymasterAndData: data.paymasterAndData });
        return data.paymasterAndData;
      } catch (error) {
        if (error instanceof PaymasterError) {
          throw error;
        }
        
        if ((error as Error).name === 'AbortError') {
          logger.error('Paymaster request timed out');
          throw new RpcTimeoutError(SONEIUM_CONFIG.accountAbstraction.paymasterUrl, options.timeout || SONEIUM_CONFIG.defaultTimeout);
        }
        
        logger.error('Paymaster request failed', error);
        throw new PaymasterError(`Paymaster request failed: ${(error as Error).message}`);
      }
    },
  });
}

/**
 * Helper function to create a smart account client for Soneium
 * @param privateKey - The private key for the EOA
 * @param networkType - The network type
 * @param withSponsorship - Whether to use sponsorship for gas
 * @param apiKey - The API key for the paymaster (required if withSponsorship is true)
 * @returns The smart account client and account address
 */
export async function createSoneiumAAClient(
  privateKey: string,
  networkType: NetworkType = 'testnet',
  withSponsorship: boolean = false,
  apiKey?: string,
  options: {
    timeout?: number;
    logger?: Logger;
    gasBufferPercentage?: number;
  } = {}
): Promise<any> {
  const chain = getSoneiumChain(networkType);
  const logger = options.logger || defaultLogger;
  
  logger.info(`Creating AA client for ${networkType}${withSponsorship ? ' with sponsorship' : ''}`);
  
  try {
    // Create public client
    const publicClient = createSoneiumPublicClient(networkType, {
      timeout: options.timeout,
      logger
    });
    
    // Create smart account
    const account = await createSoneiumSmartAccount(publicClient, privateKey, { logger });
    
    // Create middleware
    const middleware: any = {};
    
    // Add gas estimation middleware
    middleware.gasEstimator = createGasEstimationMiddleware(
      publicClient,
      ENTRYPOINT_ADDRESS_V07 as Address,
      {
        bufferPercentage: options.gasBufferPercentage || 20,
        logger,
      }
    ).gasEstimator;
    
    // Add sponsorship middleware if requested
    if (withSponsorship) {
      if (!apiKey) {
        logger.error('API key is required for sponsorship');
        throw new PaymasterError('API key is required for sponsored transactions');
      }
      
      middleware.sponsorship = createSoneiumSponsorshipMiddleware(apiKey, {
        timeout: options.timeout,
        logger,
      });
    }
    
    logger.debug('Creating smart account client', {
      address: account.address,
      withSponsorship,
      middleware: Object.keys(middleware)
    });
    
    // Create smart account client
    const smartAccountClient = createSmartAccountClient({
      account,
      chain,
      bundlerTransport: http(SONEIUM_CONFIG.accountAbstraction.bundlerUrl, {
        timeout: options.timeout || SONEIUM_CONFIG.defaultTimeout,
      }),
      middleware,
    });
    
    return {
      smartAccountClient,
      publicClient,
      address: account.address as Address
    };
  } catch (error) {
    logger.error('Failed to create AA client', error);
    
    if (error instanceof AccountAbstractionError ||
        error instanceof PaymasterError ||
        error instanceof RpcError) {
      throw error;
    }
    
    throw new AccountAbstractionError(`Failed to create AA client: ${(error as Error).message}`);
  }
}

/**
 * Send a transaction through a smart account
 * @param client - The smart account client
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @returns The transaction hash
 */
export async function sendTransaction(
  client: ReturnType<typeof createSmartAccountClient>,
  to: string,
  amount: string,
  options: { logger?: Logger } = {}
) {
  const logger = options.logger || defaultLogger;
  
  logger.info(`Sending transaction to ${to} with amount ${amount}`);
  
  try {
    const hash = await client.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
    
    logger.info(`Transaction sent successfully`, { hash });
    return hash;
  } catch (error) {
    logger.error('Failed to send transaction', error);
    
    if (error instanceof AccountAbstractionError ||
        error instanceof PaymasterError ||
        error instanceof BundlerError ||
        error instanceof RpcError) {
      throw error;
    }
    
    throw new AccountAbstractionError(`Failed to send transaction: ${(error as Error).message}`);
  }
}

/**
 * Send a sponsored transaction through a smart account
 * @param privateKey - The private key for the EOA
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @param apiKey - The API key for the paymaster
 * @param networkType - The network type
 * @returns The transaction hash
 */
export async function sendSponsoredTransaction(
  privateKey: string,
  to: string,
  amount: string,
  apiKey: string,
  networkType: NetworkType = 'testnet',
  options: {
    timeout?: number;
    logger?: Logger;
    gasBufferPercentage?: number;
  } = {}
) {
  const logger = options.logger || defaultLogger;
  
  logger.info(`Sending sponsored transaction to ${to} with amount ${amount} on ${networkType}`);
  
  try {
    if (!apiKey) {
      logger.error('API key is required for sponsorship');
      throw new PaymasterError('API key is required for sponsored transactions');
    }
    
    const { smartAccountClient } = await createSoneiumAAClient(
      privateKey,
      networkType,
      true,
      apiKey,
      options
    );
    
    const hash = await smartAccountClient.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amount),
    });
    
    logger.info(`Sponsored transaction sent successfully`, { hash });
    return hash;
  } catch (error) {
    logger.error('Failed to send sponsored transaction', error);
    
    if (error instanceof AccountAbstractionError ||
        error instanceof PaymasterError ||
        error instanceof BundlerError ||
        error instanceof RpcError) {
      throw error;
    }
    
    throw new AccountAbstractionError(`Failed to send sponsored transaction: ${(error as Error).message}`);
  }
}