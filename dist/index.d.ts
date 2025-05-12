/**
 * Soneium Blockchain Client
 *
 * A TypeScript client for connecting to the Soneium blockchain.
 * This client provides functionality for interacting with the Soneium blockchain,
 * including support for Account Abstraction (ERC-4337).
 */
export { SoneiumClient } from './client';
export { SONEIUM_CONFIG, NETWORKS, DEFAULT_NETWORK } from './config';
export * from './types';
export { soneiumMainnet, soneiumTestnet, getSoneiumChain } from './chains';
export { createSoneiumPublicClient, createSoneiumBundlerClient, createSoneiumSmartAccount, createSoneiumSponsorshipMiddleware, createSoneiumAAClient, sendTransaction, sendSponsoredTransaction } from './account-abstraction';
export { SoneiumError, RpcError, RpcTimeoutError, WalletError, AccountAbstractionError, PaymasterError, BundlerError, TransactionRejectedError, GasEstimationError } from './errors';
export { Logger, LogLevel, ConsoleLogger, NoopLogger, defaultLogger } from './logger';
export { estimateGas, estimateUserOperationGas, getCurrentGasPrices, createGasEstimationMiddleware } from './gas-estimation';
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
