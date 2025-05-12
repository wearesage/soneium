/**
 * Chain definitions for Soneium blockchain
 */
import { defineChain } from "viem";
import { SONEIUM_CONFIG } from "./config";

/**
 * Soneium mainnet chain definition
 */
export const soneiumMainnet = defineChain({
  id: SONEIUM_CONFIG.mainnet.chainId,
  name: SONEIUM_CONFIG.mainnet.name,
  nativeCurrency: {
    decimals: 18,
    name: 'Soneium',
    symbol: 'SON',
  },
  rpcUrls: {
    default: {
      http: [SONEIUM_CONFIG.mainnet.rpcUrl],
    },
    public: {
      http: [SONEIUM_CONFIG.mainnet.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Soneium Explorer',
      url: SONEIUM_CONFIG.mainnet.explorerUrl,
    },
  },
});

/**
 * Soneium testnet (Minato) chain definition
 */
export const soneiumTestnet = defineChain({
  id: SONEIUM_CONFIG.testnet.chainId,
  name: SONEIUM_CONFIG.testnet.name,
  nativeCurrency: {
    decimals: 18,
    name: 'Soneium',
    symbol: 'SON',
  },
  rpcUrls: {
    default: {
      http: [SONEIUM_CONFIG.testnet.rpcUrl],
    },
    public: {
      http: [SONEIUM_CONFIG.testnet.rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Soneium Explorer',
      url: SONEIUM_CONFIG.testnet.explorerUrl,
    },
  },
});

/**
 * Get the Soneium chain based on network type
 * @param networkType - The network type (mainnet or testnet)
 * @returns The Soneium chain
 */
export function getSoneiumChain(networkType: 'mainnet' | 'testnet') {
  return networkType === 'mainnet' ? soneiumMainnet : soneiumTestnet;
}