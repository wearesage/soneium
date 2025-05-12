"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.soneiumTestnet = exports.soneiumMainnet = void 0;
exports.getSoneiumChain = getSoneiumChain;
/**
 * Chain definitions for Soneium blockchain
 */
const viem_1 = require("viem");
const config_1 = require("./config");
/**
 * Soneium mainnet chain definition
 */
exports.soneiumMainnet = (0, viem_1.defineChain)({
    id: config_1.SONEIUM_CONFIG.mainnet.chainId,
    name: config_1.SONEIUM_CONFIG.mainnet.name,
    nativeCurrency: {
        decimals: 18,
        name: 'Soneium',
        symbol: 'SON',
    },
    rpcUrls: {
        default: {
            http: [config_1.SONEIUM_CONFIG.mainnet.rpcUrl],
        },
        public: {
            http: [config_1.SONEIUM_CONFIG.mainnet.rpcUrl],
        },
    },
    blockExplorers: {
        default: {
            name: 'Soneium Explorer',
            url: config_1.SONEIUM_CONFIG.mainnet.explorerUrl,
        },
    },
});
/**
 * Soneium testnet (Minato) chain definition
 */
exports.soneiumTestnet = (0, viem_1.defineChain)({
    id: config_1.SONEIUM_CONFIG.testnet.chainId,
    name: config_1.SONEIUM_CONFIG.testnet.name,
    nativeCurrency: {
        decimals: 18,
        name: 'Soneium',
        symbol: 'SON',
    },
    rpcUrls: {
        default: {
            http: [config_1.SONEIUM_CONFIG.testnet.rpcUrl],
        },
        public: {
            http: [config_1.SONEIUM_CONFIG.testnet.rpcUrl],
        },
    },
    blockExplorers: {
        default: {
            name: 'Soneium Explorer',
            url: config_1.SONEIUM_CONFIG.testnet.explorerUrl,
        },
    },
});
/**
 * Get the Soneium chain based on network type
 * @param networkType - The network type (mainnet or testnet)
 * @returns The Soneium chain
 */
function getSoneiumChain(networkType) {
    return networkType === 'mainnet' ? exports.soneiumMainnet : exports.soneiumTestnet;
}
//# sourceMappingURL=chains.js.map