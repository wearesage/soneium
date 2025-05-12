"use strict";
/**
 * Soneium Testnet Demo
 *
 * This script demonstrates connecting to the Soneium testnet
 * and performing basic operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
const logger_1 = require("../logger");
// Create a logger with debug level to see detailed logs
const logger = new logger_1.ConsoleLogger(logger_1.LogLevel.DEBUG);
async function main() {
    try {
        console.log('🚀 Connecting to Soneium Testnet (Minato)...');
        // Create a client connected to the testnet with debug logging
        const client = new client_1.SoneiumClient('testnet', {
            logLevel: logger_1.LogLevel.DEBUG,
            timeout: 30000 // 30 seconds timeout
        });
        // Get the current block number
        console.log('📦 Fetching current block number...');
        const blockNumber = await client.getBlockNumber();
        console.log(`✅ Current block number: ${blockNumber}`);
        // Check the network configuration
        console.log('\n🔍 Network Information:');
        const networkType = client.getNetworkType();
        console.log(`Network: ${networkType}`);
        // Get the balance of a sample address (Soneium faucet address)
        const sampleAddress = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
        console.log(`\n💰 Checking balance of ${sampleAddress}...`);
        const balance = await client.getBalance(sampleAddress);
        console.log(`✅ Balance: ${balance} wei (${Number(balance) / 1e18} SON)`);
        console.log('\n🎉 Successfully connected to Soneium Testnet!');
    }
    catch (error) {
        console.error('❌ Error connecting to Soneium Testnet:', error);
    }
}
// Run the main function
main().catch(console.error);
//# sourceMappingURL=testnet-demo.js.map