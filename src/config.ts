/**
 * Configuration for the Soneium blockchain client
 */
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const SONEIUM_CONFIG = {
  // Mainnet configuration
  mainnet: {
    name: 'Soneium Mainnet',
    chainId: 2852, // Soneium mainnet chain ID
    rpcUrl: process.env.SONEIUM_MAIN_HTTPS || 'https://soneium.rpc.scs.startale.com',
    explorerUrl: 'https://explorer.soneium.org',
  },
  
  // Testnet configuration (Minato)
  testnet: {
    name: 'Soneium Minato',
    chainId: 1946, // Soneium testnet chain ID
    rpcUrl: process.env.SONEIUM_TEST_HTTPS || 'https://soneium-minato.rpc.scs.startale.com',
    explorerUrl: 'https://explorer.minato.soneium.org',
  },
  
  // Default timeout for RPC requests in milliseconds
  defaultTimeout: 30000,
  
  // Account Abstraction configuration
  accountAbstraction: {
    bundlerUrl: process.env.SONEIUM_BUNDLER_URL || 'https://bundler.scs.startale.com/rpc',
    paymasterUrl: process.env.SONEIUM_PAYMASTER_URL || 'https://paymaster.scs.startale.com/api/sponsor',
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // Standard ERC-4337 EntryPoint
    factoryAddress: process.env.SONEIUM_SIMPLE_ACCOUNT_FACTORY || '0x9406Cc6185a346906296840746125a0E44976454',
    paymasterApiKey: process.env.SONEIUM_PAYMASTER_API_KEY || '',
  }
};

// Default to testnet for development
export const DEFAULT_NETWORK = 'testnet';

// Export network configurations for easy access
export const NETWORKS = {
  mainnet: SONEIUM_CONFIG.mainnet,
  testnet: SONEIUM_CONFIG.testnet,
};