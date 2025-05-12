declare module '@sage/soneium' {
  export interface NetworkConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    explorerUrl: string;
  }

  export interface AccountAbstractionConfig {
    bundlerUrl: string;
    paymasterUrl: string;
    entryPointAddress: string;
    factoryAddress: string;
    paymasterApiKey: string;
  }

  export interface SoneiumConfig {
    mainnet: NetworkConfig;
    testnet: NetworkConfig;
    defaultTimeout: number;
    accountAbstraction: AccountAbstractionConfig;
  }

  export const SONEIUM_CONFIG: SoneiumConfig;
  
  export const DEFAULT_NETWORK: 'mainnet' | 'testnet';
  
  export const NETWORKS: {
    mainnet: NetworkConfig;
    testnet: NetworkConfig;
  };

  export class SoneiumClient {
    constructor(networkType?: 'mainnet' | 'testnet', options?: any);
    connectWallet(privateKey: string): string;
    getBlockNumber(): Promise<bigint>;
    getBalance(address: string): Promise<bigint>;
    sendTransaction(transaction: any): Promise<string>;
    call(callData: { to: string; data: string }): Promise<string>;
    createUserOperation(transaction: any): Promise<any>;
    getPaymasterSignature(userOp: any, sponsorType?: 'gasless' | 'token', apiKey?: string): Promise<any>;
    sendUserOperation(userOp: any, apiKey?: string): Promise<string>;
    getNetworkType(): 'mainnet' | 'testnet';
    switchNetwork(networkType: 'mainnet' | 'testnet'): void;
    sendAATransaction(transaction: any): Promise<string>;
    sendSponsoredTransaction(transaction: any, apiKey: string): Promise<string>;
    estimateGas(tx: { to: string; data?: string; value?: bigint }, options?: { bufferPercentage?: number; maxGasLimit?: bigint }): Promise<bigint>;
    getCurrentGasPrices(options?: { bufferPercentage?: number }): Promise<{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }>;
  }

  export interface Chain {
    id: number;
    name: string;
    nativeCurrency: {
      decimals: number;
      name: string;
      symbol: string;
    };
    rpcUrls: {
      default: {
        http: string[];
      };
      public: {
        http: string[];
      };
    };
    blockExplorers: {
      default: {
        name: string;
        url: string;
      };
    };
  }

  export const soneiumMainnet: Chain;
  export const soneiumTestnet: Chain;
  export function getSoneiumChain(networkType: 'mainnet' | 'testnet'): Chain;
  
  export function createSoneiumPublicClient(networkType?: 'mainnet' | 'testnet', options?: any): any;
  export function createSoneiumBundlerClient(networkType?: 'mainnet' | 'testnet', options?: any): any;
  export function createSoneiumSmartAccount(publicClient: any, privateKey: string, options?: any): Promise<any>;
  export function createSoneiumSponsorshipMiddleware(apiKey?: string, options?: any): any;
  export function createSoneiumAAClient(privateKey: string, networkType?: 'mainnet' | 'testnet', withSponsorship?: boolean, apiKey?: string, options?: any): Promise<{
    smartAccountClient: any;
    publicClient: any;
    address: string;
  }>;
  export function sendTransaction(client: any, to: string, amount: string, options?: any): Promise<string>;
  export function sendSponsoredTransaction(privateKey: string, to: string, amount: string, apiKey: string, networkType?: 'mainnet' | 'testnet', options?: any): Promise<string>;

  // Gas estimation utilities
  export interface GasEstimationOptions {
    bufferPercentage?: number;
    maxGasLimit?: bigint;
    logger?: any;
  }

  export function estimateGas(
    client: any,
    tx: {
      from: string;
      to: string;
      data?: string;
      value?: bigint;
    },
    options?: GasEstimationOptions
  ): Promise<bigint>;

  export function estimateUserOperationGas(
    client: any,
    entryPointAddress: string,
    userOp: {
      sender: string;
      callData: string;
      initCode?: string;
    },
    options?: GasEstimationOptions
  ): Promise<{
    callGasLimit: bigint;
    verificationGasLimit: bigint;
    preVerificationGas: bigint;
  }>;

  export function getCurrentGasPrices(
    client: any,
    options?: GasEstimationOptions
  ): Promise<{
    maxFeePerGas: bigint;
    maxPriorityFeePerGas: bigint;
  }>;

  export function createGasEstimationMiddleware(
    client: any,
    entryPointAddress: string,
    options?: GasEstimationOptions
  ): {
    gasEstimator: (userOp: any) => Promise<any>;
  };
}