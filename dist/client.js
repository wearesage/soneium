"use strict";
/**
 * Soneium blockchain client implementation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoneiumClient = void 0;
const viem_1 = require("viem");
const accounts_1 = require("viem/accounts");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
const chains_1 = require("./chains");
const gas_estimation_1 = require("./gas-estimation");
const account_abstraction_1 = require("./account-abstraction");
const errors_1 = require("./errors");
const logger_1 = require("./logger");
const gas_estimation_2 = require("./gas-estimation");
/**
 * SoneiumClient class for interacting with the Soneium blockchain
 */
class SoneiumClient {
    /**
     * Create a new SoneiumClient instance
     * @param networkType - The network type to connect to (mainnet or testnet)
     */
    /**
     * Create a new SoneiumClient instance
     * @param networkType - The network type to connect to (mainnet or testnet)
     * @param options - Client options
     */
    constructor(networkType = config_1.DEFAULT_NETWORK, options = {}) {
        this.walletClient = null;
        this.account = null;
        this.networkType = networkType;
        this.timeout = options.timeout || config_1.SONEIUM_CONFIG.defaultTimeout;
        // Set up logger
        if (options.logger) {
            this.logger = options.logger;
        }
        else if (options.logLevel !== undefined) {
            this.logger = new logger_1.ConsoleLogger(options.logLevel);
        }
        else if (options.enableLogging === false) {
            this.logger = new logger_1.NoopLogger();
        }
        else {
            this.logger = logger_1.defaultLogger;
        }
        this.logger.info(`Creating Soneium client for ${networkType}`);
        const chain = (0, chains_1.getSoneiumChain)(networkType);
        try {
            // Create a public client for reading from the blockchain
            this.publicClient = (0, viem_1.createPublicClient)({
                chain,
                transport: (0, viem_1.http)(chain.rpcUrls.default.http[0], {
                    timeout: this.timeout,
                }),
            });
            this.logger.debug('Public client created successfully');
        }
        catch (error) {
            this.logger.error('Failed to create public client', error);
            throw new errors_1.RpcError(`Failed to create public client: ${error.message}`);
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
    connectWallet(privateKey) {
        this.logger.info('Connecting wallet');
        try {
            const chain = (0, chains_1.getSoneiumChain)(this.networkType);
            // Create an account from the private key
            this.account = (0, accounts_1.privateKeyToAccount)(privateKey);
            // Create a wallet client for sending transactions
            this.walletClient = (0, viem_1.createWalletClient)({
                account: this.account,
                chain,
                transport: (0, viem_1.http)(chain.rpcUrls.default.http[0], {
                    timeout: this.timeout,
                }),
            });
            this.logger.info('Wallet connected successfully', { address: this.account.address });
            return this.account.address;
        }
        catch (error) {
            this.logger.error('Failed to connect wallet', error);
            throw new errors_1.WalletError(`Failed to connect wallet: ${error.message}`);
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
    async getBlockNumber() {
        this.logger.debug('Getting block number');
        try {
            const blockNumber = await this.publicClient.getBlockNumber();
            this.logger.debug('Block number retrieved', { blockNumber });
            return blockNumber;
        }
        catch (error) {
            this.logger.error('Failed to get block number', error);
            throw new errors_1.RpcError(`Failed to get block number: ${error.message}`);
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
    async getBalance(address) {
        this.logger.debug('Getting balance', { address });
        try {
            const balance = await this.publicClient.getBalance({ address: address });
            this.logger.debug('Balance retrieved', { address, balance });
            return balance;
        }
        catch (error) {
            this.logger.error('Failed to get balance', { address, error });
            throw new errors_1.RpcError(`Failed to get balance for ${address}: ${error.message}`);
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
    async sendTransaction(transaction) {
        this.logger.info('Sending transaction', { to: transaction.to, value: transaction.value });
        if (!this.walletClient || !this.account) {
            this.logger.error('Wallet not connected');
            throw new errors_1.WalletError('Wallet not connected. Call connectWallet first.');
        }
        try {
            // Estimate gas if not provided
            let gas = transaction.gasLimit;
            if (!gas) {
                this.logger.debug('Estimating gas for transaction');
                gas = await (0, gas_estimation_2.estimateGas)(this.publicClient, {
                    from: this.account.address,
                    to: transaction.to,
                    data: transaction.data,
                    value: transaction.value,
                }, { logger: this.logger });
            }
            const txHash = await this.walletClient.sendTransaction({
                account: this.account,
                chain: this.walletClient.chain,
                to: transaction.to,
                value: transaction.value,
                data: transaction.data,
                gas,
            });
            this.logger.info('Transaction sent successfully', { txHash });
            return txHash;
        }
        catch (error) {
            this.logger.error('Failed to send transaction', error);
            if (error.code === 4001) {
                throw new errors_1.TransactionRejectedError('Transaction rejected by user');
            }
            throw new errors_1.RpcError(`Failed to send transaction: ${error.message}`);
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
    async createUserOperation(transaction) {
        this.logger.info('Creating user operation', { to: transaction.to, value: transaction.value });
        if (!this.account) {
            this.logger.error('Wallet not connected');
            throw new errors_1.WalletError('Wallet not connected. Call connectWallet first.');
        }
        try {
            // Get the entry point address
            const entryPointAddress = config_1.SONEIUM_CONFIG.accountAbstraction.entryPointAddress;
            // Create a smart account client
            const { smartAccountClient, publicClient } = await (0, account_abstraction_1.createSoneiumAAClient)('dummy-key', // We don't need a real key here since we're just creating the user op
            this.networkType, false, undefined, { logger: this.logger });
            // Estimate gas parameters
            const { callGasLimit, verificationGasLimit, preVerificationGas } = await (0, gas_estimation_1.estimateUserOperationGas)(publicClient, entryPointAddress, {
                sender: this.account.address,
                callData: transaction.data || '0x',
                initCode: '0x',
            }, { logger: this.logger });
            // Get current gas prices
            const { maxFeePerGas, maxPriorityFeePerGas } = await (0, gas_estimation_2.getCurrentGasPrices)(publicClient, { logger: this.logger });
            // Create the user operation
            const userOp = {
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
        }
        catch (error) {
            this.logger.error('Failed to create user operation', error);
            if (error instanceof errors_1.GasEstimationError ||
                error instanceof errors_1.AccountAbstractionError) {
                throw error;
            }
            throw new errors_1.AccountAbstractionError(`Failed to create user operation: ${error.message}`);
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
    async getPaymasterSignature(userOp, sponsorType = 'gasless', apiKey) {
        this.logger.info('Getting paymaster signature', { sponsorType });
        if (!apiKey) {
            this.logger.error('API key is required for paymaster');
            throw new errors_1.PaymasterError('API key is required for paymaster operations');
        }
        const request = {
            userOp,
            sponsorType,
        };
        try {
            this.logger.debug('Sending paymaster request', { url: config_1.SONEIUM_CONFIG.accountAbstraction.paymasterUrl });
            const response = await axios_1.default.post(config_1.SONEIUM_CONFIG.accountAbstraction.paymasterUrl, request, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                timeout: this.timeout,
            });
            this.logger.debug('Paymaster response received', { data: response.data });
            return response.data;
        }
        catch (error) {
            this.logger.error('Failed to get paymaster signature', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    throw new errors_1.RpcTimeoutError(config_1.SONEIUM_CONFIG.accountAbstraction.paymasterUrl, this.timeout);
                }
                if (error.response) {
                    throw new errors_1.PaymasterError(`Paymaster error: ${error.response.data?.message || error.message}`, error.response.data);
                }
            }
            throw new errors_1.PaymasterError(`Failed to get paymaster signature: ${error.message}`);
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
    async sendUserOperation(userOp, apiKey) {
        this.logger.info('Sending user operation to bundler');
        try {
            this.logger.debug('Sending request to bundler', {
                url: config_1.SONEIUM_CONFIG.accountAbstraction.bundlerUrl,
                userOp
            });
            const headers = {
                'Content-Type': 'application/json',
            };
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }
            const response = await axios_1.default.post(config_1.SONEIUM_CONFIG.accountAbstraction.bundlerUrl, {
                jsonrpc: '2.0',
                method: 'eth_sendUserOperation',
                params: [userOp, config_1.SONEIUM_CONFIG.accountAbstraction.entryPointAddress],
                id: 1,
            }, {
                headers,
                timeout: this.timeout,
            });
            if (response.data.error) {
                this.logger.error('Bundler returned an error', response.data.error);
                throw new errors_1.BundlerError(`Bundler error: ${response.data.error.message || JSON.stringify(response.data.error)}`, response.data.error);
            }
            this.logger.info('User operation sent successfully', { hash: response.data.result });
            return response.data.result;
        }
        catch (error) {
            this.logger.error('Failed to send user operation', error);
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    throw new errors_1.RpcTimeoutError(config_1.SONEIUM_CONFIG.accountAbstraction.bundlerUrl, this.timeout);
                }
                if (error.response) {
                    throw new errors_1.BundlerError(`Bundler error: ${error.response.data?.error?.message || error.message}`, error.response.data);
                }
            }
            if (error instanceof errors_1.BundlerError) {
                throw error;
            }
            throw new errors_1.BundlerError(`Failed to send user operation: ${error.message}`);
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
    getNetworkType() {
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
    switchNetwork(networkType) {
        this.logger.info(`Switching network from ${this.networkType} to ${networkType}`);
        try {
            this.networkType = networkType;
            const chain = (0, chains_1.getSoneiumChain)(networkType);
            // Recreate the public client with the new network
            this.publicClient = (0, viem_1.createPublicClient)({
                chain,
                transport: (0, viem_1.http)(chain.rpcUrls.default.http[0], {
                    timeout: this.timeout,
                }),
            });
            // Recreate the wallet client if an account is connected
            if (this.account) {
                this.walletClient = (0, viem_1.createWalletClient)({
                    account: this.account,
                    chain,
                    transport: (0, viem_1.http)(chain.rpcUrls.default.http[0], {
                        timeout: this.timeout,
                    }),
                });
            }
            this.logger.info('Network switched successfully');
        }
        catch (error) {
            this.logger.error('Failed to switch network', error);
            throw new errors_1.RpcError(`Failed to switch network: ${error.message}`);
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
    async sendAATransaction(transaction, privateKey, options = {}) {
        this.logger.info('Sending AA transaction', { to: transaction.to, value: transaction.value });
        // Check if we have a wallet connected or a private key provided
        if (!privateKey && !this.account) {
            this.logger.error('No wallet connected and no private key provided');
            throw new errors_1.AccountAbstractionError('Wallet not connected. Call connectWallet first or provide a privateKey.');
        }
        // If privateKey is provided, use it; otherwise we need to throw an error
        // because we can't access the private key from the account object for security reasons
        if (!privateKey) {
            this.logger.error('Private key must be provided for AA transactions');
            throw new errors_1.AccountAbstractionError('Private key must be provided for AA transactions when using a connected wallet.');
        }
        try {
            const pk = privateKey;
            // Create a smart account client
            const { smartAccountClient } = await (0, account_abstraction_1.createSoneiumAAClient)(pk, this.networkType, false, undefined, {
                timeout: this.timeout,
                logger: this.logger,
                gasBufferPercentage: options.gasBufferPercentage,
            });
            // Send the transaction
            const hash = await smartAccountClient.sendTransaction({
                to: transaction.to,
                value: transaction.value,
                data: transaction.data,
            });
            this.logger.info('AA transaction sent successfully', { hash });
            return hash;
        }
        catch (error) {
            this.logger.error('Failed to send AA transaction', error);
            if (error instanceof errors_1.AccountAbstractionError ||
                error instanceof errors_1.PaymasterError ||
                error instanceof errors_1.BundlerError ||
                error instanceof errors_1.RpcError) {
                throw error;
            }
            throw new errors_1.AccountAbstractionError(`Failed to send AA transaction: ${error.message}`);
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
    async sendSponsoredTransaction(transaction, apiKey, privateKey, options = {}) {
        this.logger.info('Sending sponsored transaction', { to: transaction.to, value: transaction.value });
        if (!apiKey) {
            this.logger.error('API key is required for sponsored transactions');
            throw new errors_1.PaymasterError('API key is required for sponsored transactions');
        }
        // Check if we have a wallet connected or a private key provided
        if (!privateKey && !this.account) {
            this.logger.error('No wallet connected and no private key provided');
            throw new errors_1.AccountAbstractionError('Wallet not connected. Call connectWallet first or provide a privateKey.');
        }
        // If privateKey is provided, use it; otherwise we need to throw an error
        // because we can't access the private key from the account object for security reasons
        if (!privateKey) {
            this.logger.error('Private key must be provided for sponsored transactions');
            throw new errors_1.AccountAbstractionError('Private key must be provided for sponsored transactions when using a connected wallet.');
        }
        try {
            const pk = privateKey;
            // Create a smart account client with sponsorship
            const { smartAccountClient } = await (0, account_abstraction_1.createSoneiumAAClient)(pk, this.networkType, true, apiKey, {
                timeout: this.timeout,
                logger: this.logger,
                gasBufferPercentage: options.gasBufferPercentage,
            });
            // Send the transaction
            const hash = await smartAccountClient.sendTransaction({
                to: transaction.to,
                value: transaction.value,
                data: transaction.data,
            });
            this.logger.info('Sponsored transaction sent successfully', { hash });
            return hash;
        }
        catch (error) {
            this.logger.error('Failed to send sponsored transaction', error);
            if (error instanceof errors_1.AccountAbstractionError ||
                error instanceof errors_1.PaymasterError ||
                error instanceof errors_1.BundlerError ||
                error instanceof errors_1.RpcError) {
                throw error;
            }
            throw new errors_1.AccountAbstractionError(`Failed to send sponsored transaction: ${error.message}`);
        }
    }
    /**
     * Estimate gas for a transaction
     * @param tx - The transaction to estimate gas for
     * @param options - Gas estimation options
     * @returns The estimated gas limit
     */
    async estimateGas(tx, options = {}) {
        this.logger.debug('Estimating gas for transaction', tx);
        if (!this.account) {
            this.logger.error('Wallet not connected');
            throw new errors_1.WalletError('Wallet not connected. Call connectWallet first.');
        }
        try {
            return await (0, gas_estimation_2.estimateGas)(this.publicClient, {
                from: this.account.address,
                to: tx.to,
                data: tx.data,
                value: tx.value,
            }, {
                bufferPercentage: options.bufferPercentage,
                maxGasLimit: options.maxGasLimit,
                logger: this.logger,
            });
        }
        catch (error) {
            this.logger.error('Failed to estimate gas', error);
            throw new errors_1.GasEstimationError(`Failed to estimate gas: ${error.message}`);
        }
    }
    /**
     * Get current gas prices from the network
     * @param options - Gas estimation options
     * @returns The current gas prices (maxFeePerGas and maxPriorityFeePerGas)
     */
    async getCurrentGasPrices(options = {}) {
        this.logger.debug('Getting current gas prices');
        try {
            return await (0, gas_estimation_2.getCurrentGasPrices)(this.publicClient, {
                bufferPercentage: options.bufferPercentage,
                logger: this.logger,
            });
        }
        catch (error) {
            this.logger.error('Failed to get current gas prices', error);
            throw new errors_1.GasEstimationError(`Failed to get current gas prices: ${error.message}`);
        }
    }
    /**
     * Make a read-only call to a contract
     * @param callData - The call data containing to and data properties
     * @returns The result of the call
     */
    async call(callData) {
        this.logger.debug('Making read-only call to contract', callData);
        try {
            // Use the publicClient to make a read-only call
            const result = await this.publicClient.call({
                to: callData.to,
                data: callData.data
            });
            this.logger.debug('Call result received', { result });
            // Convert the result to a string to match the declared return type
            return result;
        }
        catch (error) {
            this.logger.error('Failed to make contract call', error);
            throw new errors_1.RpcError(`Failed to make contract call: ${error.message}`);
        }
    }
    /**
     * Get the logger instance
     * @returns The logger instance
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Set the log level
     * @param level - The log level to set
     */
    setLogLevel(level) {
        if (this.logger instanceof logger_1.ConsoleLogger) {
            this.logger.setLevel(level);
        }
        else {
            this.logger = new logger_1.ConsoleLogger(level);
        }
    }
}
exports.SoneiumClient = SoneiumClient;
//# sourceMappingURL=client.js.map