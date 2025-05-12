"use strict";
/**
 * Gas estimation utilities for the Soneium blockchain client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateGas = estimateGas;
exports.estimateUserOperationGas = estimateUserOperationGas;
exports.getCurrentGasPrices = getCurrentGasPrices;
exports.createGasEstimationMiddleware = createGasEstimationMiddleware;
const errors_1 = require("./errors");
const logger_1 = require("./logger");
/**
 * Default gas estimation options
 */
const DEFAULT_GAS_ESTIMATION_OPTIONS = {
    bufferPercentage: 20,
    maxGasLimit: 10000000n,
    logger: logger_1.defaultLogger,
};
/**
 * Estimate gas for a transaction
 * @param client - The public client
 * @param tx - The transaction to estimate gas for
 * @param options - Gas estimation options
 * @returns The estimated gas limit
 */
async function estimateGas(client, tx, options = {}) {
    const opts = { ...DEFAULT_GAS_ESTIMATION_OPTIONS, ...options };
    const { logger } = opts;
    try {
        logger.debug('Estimating gas for transaction', tx);
        const gasEstimate = await client.estimateGas({
            account: tx.from,
            to: tx.to,
            value: tx.value,
            data: tx.data,
        });
        logger.debug('Raw gas estimate', gasEstimate);
        // Add buffer
        const buffer = (gasEstimate * BigInt(opts.bufferPercentage)) / 100n;
        let gasLimit = gasEstimate + buffer;
        // Cap at max gas limit
        if (gasLimit > opts.maxGasLimit) {
            logger.warn(`Gas estimate ${gasLimit} exceeds max gas limit ${opts.maxGasLimit}, capping`);
            gasLimit = opts.maxGasLimit;
        }
        logger.debug('Final gas limit with buffer', gasLimit);
        return gasLimit;
    }
    catch (error) {
        logger.error('Gas estimation failed', error);
        throw new errors_1.GasEstimationError(`Failed to estimate gas: ${error.message}`);
    }
}
/**
 * Estimate gas for an AA transaction
 * @param client - The public client
 * @param entryPointAddress - The entry point address
 * @param userOp - The user operation
 * @param options - Gas estimation options
 * @returns The estimated gas parameters
 */
async function estimateUserOperationGas(client, entryPointAddress, userOp, options = {}) {
    const opts = { ...DEFAULT_GAS_ESTIMATION_OPTIONS, ...options };
    const { logger } = opts;
    try {
        logger.debug('Estimating gas for user operation', userOp);
        // Estimate callGasLimit
        const callGasLimit = await estimateGas(client, {
            from: userOp.sender,
            to: userOp.sender,
            data: userOp.callData,
        }, options);
        // For verification gas, we need to simulate the verification process
        // This is a simplified approach - in production, you might want to call the
        // entry point's simulateValidation method
        // Start with a base verification gas
        let verificationGasLimit = 100000n;
        // Add more gas if initCode is present (account creation)
        if (userOp.initCode && userOp.initCode !== '0x') {
            verificationGasLimit += 100000n;
        }
        // Add buffer
        verificationGasLimit = verificationGasLimit +
            (verificationGasLimit * BigInt(opts.bufferPercentage)) / 100n;
        // Pre-verification gas is for the bundler's overhead
        // This is typically a fixed amount plus some calculation based on calldata size
        const callDataLength = (userOp.callData.length - 2) / 2; // -2 for '0x', /2 for hex encoding
        const initCodeLength = userOp.initCode ? (userOp.initCode.length - 2) / 2 : 0;
        // Base cost + cost per byte
        const preVerificationGas = 21000n +
            BigInt(callDataLength * 16) +
            BigInt(initCodeLength * 16);
        // Add buffer
        const finalPreVerificationGas = preVerificationGas +
            (preVerificationGas * BigInt(opts.bufferPercentage)) / 100n;
        logger.debug('Estimated gas parameters', {
            callGasLimit,
            verificationGasLimit,
            preVerificationGas: finalPreVerificationGas,
        });
        return {
            callGasLimit,
            verificationGasLimit,
            preVerificationGas: finalPreVerificationGas,
        };
    }
    catch (error) {
        logger.error('User operation gas estimation failed', error);
        throw new errors_1.GasEstimationError(`Failed to estimate user operation gas: ${error.message}`);
    }
}
/**
 * Get current gas prices from the network
 * @param client - The public client
 * @param options - Gas estimation options
 * @returns The current gas prices
 */
async function getCurrentGasPrices(client, options = {}) {
    const opts = { ...DEFAULT_GAS_ESTIMATION_OPTIONS, ...options };
    const { logger } = opts;
    try {
        logger.debug('Getting current gas prices');
        // Get the latest block to calculate gas prices
        const block = await client.getBlock();
        // Get the base fee per gas from the latest block
        const baseFeePerGas = block.baseFeePerGas || 1000000000n; // Default to 1 gwei if not available
        // Calculate max fee per gas (base fee + priority fee)
        // Add a buffer to account for base fee increases
        const bufferMultiplier = 100n + BigInt(opts.bufferPercentage);
        const maxFeePerGas = (baseFeePerGas * bufferMultiplier) / 100n;
        // Set a reasonable priority fee
        const maxPriorityFeePerGas = 1500000000n; // 1.5 gwei
        logger.debug('Current gas prices', {
            baseFeePerGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
        });
        return {
            maxFeePerGas,
            maxPriorityFeePerGas,
        };
    }
    catch (error) {
        logger.error('Failed to get current gas prices', error);
        throw new errors_1.GasEstimationError(`Failed to get current gas prices: ${error.message}`);
    }
}
/**
 * Create a gas estimation middleware for AA transactions
 * @param client - The public client
 * @param entryPointAddress - The entry point address
 * @param options - Gas estimation options
 * @returns The gas estimation middleware
 */
function createGasEstimationMiddleware(client, entryPointAddress, options = {}) {
    const opts = { ...DEFAULT_GAS_ESTIMATION_OPTIONS, ...options };
    const { logger } = opts;
    return {
        gasEstimator: async (userOp) => {
            logger.debug('Gas estimation middleware called', userOp);
            try {
                // Estimate gas parameters
                const gasParams = await estimateUserOperationGas(client, entryPointAddress, {
                    sender: userOp.sender,
                    callData: userOp.callData,
                    initCode: userOp.initCode,
                }, options);
                // Get current gas prices
                const gasPrices = await getCurrentGasPrices(client, options);
                // Return the estimated gas parameters
                return {
                    ...userOp,
                    callGasLimit: gasParams.callGasLimit,
                    verificationGasLimit: gasParams.verificationGasLimit,
                    preVerificationGas: gasParams.preVerificationGas,
                    maxFeePerGas: gasPrices.maxFeePerGas,
                    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
                };
            }
            catch (error) {
                logger.error('Gas estimation middleware failed', error);
                throw new errors_1.GasEstimationError(`Gas estimation middleware failed: ${error.message}`);
            }
        },
    };
}
//# sourceMappingURL=gas-estimation.js.map