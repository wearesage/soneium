/**
 * Soneium Testnet Transacion Demo
 * 
 * This script demonstrates sending a transaction on the Soneium testnet.
 * You'll need a private key with some testnet SON tokens to run this demo.
 */

import { SoneiumClient } from '../client';
import { ConsoleLogger, LogLevel } from '../logger';
import { parseEther } from 'viem';

// Create a logger with debug level to see detailed logs
const logger = new ConsoleLogger(LogLevel.DEBUG);

// Replace these with your own values
const PRIVATE_KEY = '0xc8e2c9b9189ae5bd5f69adb85c08201b318a61dfabe66a2a4674e956dce0c372'; // Replace with your private key
const RECIPIENT_ADDRESS = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'; // Example recipient
const AMOUNT_TO_SEND = '0.001'; // Amount in SON

async function main() {
  try {
    console.log('🚀 Connecting to Soneium Testnet (Minato)...');
    
    // Create a client connected to the testnet with debug logging
    const client = new SoneiumClient('testnet', { 
      logLevel: LogLevel.DEBUG,
      timeout: 30000 // 30 seconds timeout
    });
    
    // Connect wallet using private key
    console.log('🔑 Connecting wallet...');
    const address = client.connectWallet(PRIVATE_KEY);
    console.log(`✅ Wallet connected: ${address}`);
    
    // Get wallet balance
    console.log('💰 Checking wallet balance...');
    const balance = await client.getBalance(address);
    console.log(`✅ Wallet balance: ${balance} wei (${Number(balance) / 1e18} SON)`);
    
    if (balance === 0n) {
      console.error('❌ Wallet has no balance. Please fund your wallet with testnet SON tokens.');
      return;
    }
    
    // Send transaction
    console.log(`💸 Sending ${AMOUNT_TO_SEND} SON to ${RECIPIENT_ADDRESS}...`);
    const txHash = await client.sendTransaction({
      to: `${RECIPIENT_ADDRESS}`,
      value: parseEther(AMOUNT_TO_SEND),
    });
    
    console.log(`✅ Transaction sent! Hash: ${txHash}`);
    console.log(`🔍 View transaction: https://explorer.minato.soneium.org/tx/${txHash}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main().catch(console.error);
