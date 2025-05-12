"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSoneiumPublicClient = createSoneiumPublicClient;
exports.createSoneiumBundlerClient = createSoneiumBundlerClient;
exports.createSoneiumSmartAccount = createSoneiumSmartAccount;
exports.createSoneiumSponsorshipMiddleware = createSoneiumSponsorshipMiddleware;
exports.createSoneiumAAClient = createSoneiumAAClient;
exports.sendTransaction = sendTransaction;
exports.sendSponsoredTransaction = sendSponsoredTransaction;
/**
 * Account Abstraction functionality for Soneium blockchain
 * Using permissionless for account abstraction
 */
const { createSmartAccountClient, createBundlerClient, ENTRYPOINT_ADDRESS_V07, createPaymasterMiddleware, SmartAccount } = require('permissionless');
// Import the correct function from permissionless
const { toSimpleSmartAccount } = require('permissionless/accounts');
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const config_1 = require("./config");
const chains_1 = require("./chains");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const gas_estimation_1 = require("./gas-estimation");
// Use the factory address from the config
const SIMPLE_ACCOUNT_FACTORY_ADDRESS = config_1.SONEIUM_CONFIG.accountAbstraction.factoryAddress;
/**
 * Create a public client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The public client
 */
function createSoneiumPublicClient(networkType = 'testnet', options = {}) {
    const chain = (0, chains_1.getSoneiumChain)(networkType);
    const logger = options.logger || logger_1.defaultLogger;
    logger.debug(`Creating public client for ${networkType}`);
    try {
        return (0, viem_1.createPublicClient)({
            chain,
            transport: (0, viem_1.http)(chain.rpcUrls.default.http[0], {
                timeout: options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout,
            }),
        });
    }
    catch (error) {
        logger.error('Failed to create public client', error);
        throw new errors_1.AccountAbstractionError(`Failed to create public client: ${error.message}`);
    }
}
/**
 * Create a bundler client for the Soneium network
 * @param networkType - The network type (mainnet or testnet)
 * @returns The bundler client
 */
function createSoneiumBundlerClient(networkType = 'testnet', options = {}) {
    const chain = (0, chains_1.getSoneiumChain)(networkType);
    const logger = options.logger || logger_1.defaultLogger;
    logger.debug(`Creating bundler client for ${networkType}`);
    try {
        return createBundlerClient({
            chain,
            transport: (0, viem_1.http)(config_1.SONEIUM_CONFIG.accountAbstraction.bundlerUrl, {
                timeout: options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout,
            }),
            entryPoint: ENTRYPOINT_ADDRESS_V07,
        });
    }
    catch (error) {
        logger.error('Failed to create bundler client', error);
        throw new errors_1.AccountAbstractionError(`Failed to create bundler client: ${error.message}`);
    }
}
/**
 * Create a smart account for the Soneium network
 * @param publicClient - The public client
 * @param privateKey - The private key for the EOA
 * @returns The smart account
 */
async function createSoneiumSmartAccount(publicClient, privateKey, options = {}) {
    const logger = options.logger || logger_1.defaultLogger;
    logger.debug('Creating smart account');
    try {
        // Create an account from the private key
        const owner = (0, accounts_1.privateKeyToAccount)(privateKey);
        // Create a smart account using the correct function
        const account = await toSimpleSmartAccount(publicClient, {
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            signer: owner,
            factoryAddress: SIMPLE_ACCOUNT_FACTORY_ADDRESS,
        });
        logger.debug('Smart account created', { address: account.address });
        return account;
    }
    catch (error) {
        logger.error('Failed to create smart account', error);
        throw new errors_1.AccountAbstractionError(`Failed to create smart account: ${error.message}`);
    }
}
/**
 * Create middleware for sponsored transactions
 * @param apiKey - The API key for the paymaster (optional, uses config if not provided)
 * @returns The sponsorship middleware
 */
function createSoneiumSponsorshipMiddleware(apiKey, options = {}) {
    const logger = options.logger || logger_1.defaultLogger;
    // Use the provided API key or the one from the config
    const paymasterApiKey = apiKey || config_1.SONEIUM_CONFIG.accountAbstraction.paymasterApiKey;
    if (!paymasterApiKey) {
        logger.error('Paymaster API key is missing');
        throw new errors_1.PaymasterError('Paymaster API key is required. Provide it as a parameter or set SONEIUM_PAYMASTER_API_KEY in .env');
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
                const timeoutId = setTimeout(() => controller.abort(), options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout);
                const response = await fetch(config_1.SONEIUM_CONFIG.accountAbstraction.paymasterUrl, {
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
                    throw new errors_1.PaymasterError(`Paymaster request failed: ${data.message || JSON.stringify(data)}`, data);
                }
                logger.debug('Received paymaster data', { paymasterAndData: data.paymasterAndData });
                return data.paymasterAndData;
            }
            catch (error) {
                if (error instanceof errors_1.PaymasterError) {
                    throw error;
                }
                if (error.name === 'AbortError') {
                    logger.error('Paymaster request timed out');
                    throw new errors_1.RpcTimeoutError(config_1.SONEIUM_CONFIG.accountAbstraction.paymasterUrl, options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout);
                }
                logger.error('Paymaster request failed', error);
                throw new errors_1.PaymasterError(`Paymaster request failed: ${error.message}`);
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
async function createSoneiumAAClient(privateKey, networkType = 'testnet', withSponsorship = false, apiKey, options = {}) {
    const chain = (0, chains_1.getSoneiumChain)(networkType);
    const logger = options.logger || logger_1.defaultLogger;
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
        const middleware = {};
        // Add gas estimation middleware
        middleware.gasEstimator = (0, gas_estimation_1.createGasEstimationMiddleware)(publicClient, ENTRYPOINT_ADDRESS_V07, {
            bufferPercentage: options.gasBufferPercentage || 20,
            logger,
        }).gasEstimator;
        // Add sponsorship middleware if requested
        if (withSponsorship) {
            if (!apiKey) {
                logger.error('API key is required for sponsorship');
                throw new errors_1.PaymasterError('API key is required for sponsored transactions');
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
            bundlerTransport: (0, viem_1.http)(config_1.SONEIUM_CONFIG.accountAbstraction.bundlerUrl, {
                timeout: options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout,
            }),
            middleware,
        });
        return {
            smartAccountClient,
            publicClient,
            address: account.address
        };
    }
    catch (error) {
        logger.error('Failed to create AA client', error);
        if (error instanceof errors_1.AccountAbstractionError ||
            error instanceof errors_1.PaymasterError ||
            error instanceof errors_1.RpcError) {
            throw error;
        }
        throw new errors_1.AccountAbstractionError(`Failed to create AA client: ${error.message}`);
    }
}
/**
 * Send a transaction through a smart account
 * @param client - The smart account client
 * @param to - The recipient address
 * @param amount - The amount to send in ETH
 * @returns The transaction hash
 */
async function sendTransaction(client, to, amount, options = {}) {
    const logger = options.logger || logger_1.defaultLogger;
    logger.info(`Sending transaction to ${to} with amount ${amount}`);
    try {
        const hash = await client.sendTransaction({
            to: to,
            value: (0, viem_1.parseEther)(amount),
        });
        logger.info(`Transaction sent successfully`, { hash });
        return hash;
    }
    catch (error) {
        logger.error('Failed to send transaction', error);
        if (error instanceof errors_1.AccountAbstractionError ||
            error instanceof errors_1.PaymasterError ||
            error instanceof errors_1.BundlerError ||
            error instanceof errors_1.RpcError) {
            throw error;
        }
        throw new errors_1.AccountAbstractionError(`Failed to send transaction: ${error.message}`);
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
async function sendSponsoredTransaction(privateKey, to, amount, apiKey, networkType = 'testnet', options = {}) {
    const logger = options.logger || logger_1.defaultLogger;
    logger.info(`Sending sponsored transaction to ${to} with amount ${amount} on ${networkType}`);
    try {
        if (!apiKey) {
            logger.error('API key is required for sponsorship');
            throw new errors_1.PaymasterError('API key is required for sponsored transactions');
        }
        const { smartAccountClient } = await createSoneiumAAClient(privateKey, networkType, true, apiKey, options);
        const hash = await smartAccountClient.sendTransaction({
            to: to,
            value: (0, viem_1.parseEther)(amount),
        });
        logger.info(`Sponsored transaction sent successfully`, { hash });
        return hash;
    }
    catch (error) {
        logger.error('Failed to send sponsored transaction', error);
        if (error instanceof errors_1.AccountAbstractionError ||
            error instanceof errors_1.PaymasterError ||
            error instanceof errors_1.BundlerError ||
            error instanceof errors_1.RpcError) {
            throw error;
        }
        throw new errors_1.AccountAbstractionError(`Failed to send sponsored transaction: ${error.message}`);
    }
}
//# sourceMappingURL=account-abstraction.js.map