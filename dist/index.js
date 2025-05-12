"use strict";
/**
 * Soneium Blockchain Client
 *
 * A TypeScript client for connecting to the Soneium blockchain.
 * This client provides functionality for interacting with the Soneium blockchain,
 * including support for Account Abstraction (ERC-4337).
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGasEstimationMiddleware = exports.getCurrentGasPrices = exports.estimateUserOperationGas = exports.estimateGas = exports.defaultLogger = exports.NoopLogger = exports.ConsoleLogger = exports.LogLevel = exports.GasEstimationError = exports.TransactionRejectedError = exports.BundlerError = exports.PaymasterError = exports.AccountAbstractionError = exports.WalletError = exports.RpcTimeoutError = exports.RpcError = exports.SoneiumError = exports.sendSponsoredTransaction = exports.sendTransaction = exports.createSoneiumAAClient = exports.createSoneiumSponsorshipMiddleware = exports.createSoneiumSmartAccount = exports.createSoneiumBundlerClient = exports.createSoneiumPublicClient = exports.getSoneiumChain = exports.soneiumTestnet = exports.soneiumMainnet = exports.DEFAULT_NETWORK = exports.NETWORKS = exports.SONEIUM_CONFIG = exports.SoneiumClient = void 0;
// Export the SoneiumClient class
var client_1 = require("./client");
Object.defineProperty(exports, "SoneiumClient", { enumerable: true, get: function () { return client_1.SoneiumClient; } });
// Export configuration
var config_1 = require("./config");
Object.defineProperty(exports, "SONEIUM_CONFIG", { enumerable: true, get: function () { return config_1.SONEIUM_CONFIG; } });
Object.defineProperty(exports, "NETWORKS", { enumerable: true, get: function () { return config_1.NETWORKS; } });
Object.defineProperty(exports, "DEFAULT_NETWORK", { enumerable: true, get: function () { return config_1.DEFAULT_NETWORK; } });
// Export types
__exportStar(require("./types"), exports);
// Export chain definitions
var chains_1 = require("./chains");
Object.defineProperty(exports, "soneiumMainnet", { enumerable: true, get: function () { return chains_1.soneiumMainnet; } });
Object.defineProperty(exports, "soneiumTestnet", { enumerable: true, get: function () { return chains_1.soneiumTestnet; } });
Object.defineProperty(exports, "getSoneiumChain", { enumerable: true, get: function () { return chains_1.getSoneiumChain; } });
// Export account abstraction functionality
var account_abstraction_1 = require("./account-abstraction");
Object.defineProperty(exports, "createSoneiumPublicClient", { enumerable: true, get: function () { return account_abstraction_1.createSoneiumPublicClient; } });
Object.defineProperty(exports, "createSoneiumBundlerClient", { enumerable: true, get: function () { return account_abstraction_1.createSoneiumBundlerClient; } });
Object.defineProperty(exports, "createSoneiumSmartAccount", { enumerable: true, get: function () { return account_abstraction_1.createSoneiumSmartAccount; } });
Object.defineProperty(exports, "createSoneiumSponsorshipMiddleware", { enumerable: true, get: function () { return account_abstraction_1.createSoneiumSponsorshipMiddleware; } });
Object.defineProperty(exports, "createSoneiumAAClient", { enumerable: true, get: function () { return account_abstraction_1.createSoneiumAAClient; } });
Object.defineProperty(exports, "sendTransaction", { enumerable: true, get: function () { return account_abstraction_1.sendTransaction; } });
Object.defineProperty(exports, "sendSponsoredTransaction", { enumerable: true, get: function () { return account_abstraction_1.sendSponsoredTransaction; } });
// Export error types
var errors_1 = require("./errors");
Object.defineProperty(exports, "SoneiumError", { enumerable: true, get: function () { return errors_1.SoneiumError; } });
Object.defineProperty(exports, "RpcError", { enumerable: true, get: function () { return errors_1.RpcError; } });
Object.defineProperty(exports, "RpcTimeoutError", { enumerable: true, get: function () { return errors_1.RpcTimeoutError; } });
Object.defineProperty(exports, "WalletError", { enumerable: true, get: function () { return errors_1.WalletError; } });
Object.defineProperty(exports, "AccountAbstractionError", { enumerable: true, get: function () { return errors_1.AccountAbstractionError; } });
Object.defineProperty(exports, "PaymasterError", { enumerable: true, get: function () { return errors_1.PaymasterError; } });
Object.defineProperty(exports, "BundlerError", { enumerable: true, get: function () { return errors_1.BundlerError; } });
Object.defineProperty(exports, "TransactionRejectedError", { enumerable: true, get: function () { return errors_1.TransactionRejectedError; } });
Object.defineProperty(exports, "GasEstimationError", { enumerable: true, get: function () { return errors_1.GasEstimationError; } });
// Export logger
var logger_1 = require("./logger");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_1.LogLevel; } });
Object.defineProperty(exports, "ConsoleLogger", { enumerable: true, get: function () { return logger_1.ConsoleLogger; } });
Object.defineProperty(exports, "NoopLogger", { enumerable: true, get: function () { return logger_1.NoopLogger; } });
Object.defineProperty(exports, "defaultLogger", { enumerable: true, get: function () { return logger_1.defaultLogger; } });
// Export gas estimation utilities
var gas_estimation_1 = require("./gas-estimation");
Object.defineProperty(exports, "estimateGas", { enumerable: true, get: function () { return gas_estimation_1.estimateGas; } });
Object.defineProperty(exports, "estimateUserOperationGas", { enumerable: true, get: function () { return gas_estimation_1.estimateUserOperationGas; } });
Object.defineProperty(exports, "getCurrentGasPrices", { enumerable: true, get: function () { return gas_estimation_1.getCurrentGasPrices; } });
Object.defineProperty(exports, "createGasEstimationMiddleware", { enumerable: true, get: function () { return gas_estimation_1.createGasEstimationMiddleware; } });
/**
 * Example usage:
 *
 * ```typescript
 * import { SoneiumClient, sendSponsoredTransaction } from 'soneium-client';
 *
 * // Create a client connected to the testnet
 * const client = new SoneiumClient('testnet');
 *
 * // Connect a wallet (for sending transactions)
 * const address = client.connectWallet('0x...');
 *
 * // Get the current block number
 * const blockNumber = await client.getBlockNumber();
 * console.log(`Current block number: ${blockNumber}`);
 *
 * // Get the balance of an address
 * const balance = await client.getBalance('0x...');
 * console.log(`Balance: ${balance}`);
 *
 * // Send a regular transaction
 * const txHash = await client.sendTransaction({
 *   to: '0x...',
 *   value: 1000000000000000000n, // 1 SON
 * });
 * console.log(`Transaction hash: ${txHash}`);
 *
 * // Using Account Abstraction (via client)
 * const aaTxHash = await client.sendAATransaction({
 *   to: '0x...',
 *   value: 1000000000000000000n, // 1 SON
 * });
 * console.log(`AA Transaction hash: ${aaTxHash}`);
 *
 * // Using Account Abstraction with sponsorship (gasless)
 * const sponsoredTxHash = await client.sendSponsoredTransaction(
 *   {
 *     to: '0x...',
 *     value: 1000000000000000000n, // 1 SON
 *   },
 *   'your-scs-api-key'
 * );
 * console.log(`Sponsored transaction hash: ${sponsoredTxHash}`);
 *
 * // Using standalone functions
 * import { sendSponsoredTransaction } from 'soneium-client';
 *
 * const directSponsoredTxHash = await sendSponsoredTransaction(
 *   '0xYourPrivateKey',
 *   '0xRecipient',
 *   '0.01', // Amount in ETH
 *   'your-scs-api-key',
 *   'testnet'
 * );
 * console.log(`Direct sponsored transaction hash: ${directSponsoredTxHash}`);
 * ```
 */ 
//# sourceMappingURL=index.js.map