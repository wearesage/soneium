/**
 * Soneium Account Abstraction Demo
 * 
 * This script demonstrates using Account Abstraction (ERC-4337) on the Soneium testnet
 * to send a sponsored (gasless) transaction.
 */

import { sendSponsoredTransaction } from '../account-abstraction';
import { ConsoleLogger, LogLevel } from '../logger';

// Create a logger with debug level to see detailed logs
const logger = new ConsoleLogger(LogLevel.DEBUG);

// Replace these with your own values
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'; // Replace with your private key
const RECIPIENT_ADDRESS = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'; // Example recipient
const AMOUNT_TO_SEND = '0.001'; // Amount in SON
const PAYMASTER_API_KEY = 'YOUR_SCS_API_KEY'; // Replace with your SCS API key

async function main() {
  try {
    console.log('🚀 Demonstrating Account Abstraction on Soneium Testnet...');
    
    // Check if required values are set
    if (PRIVATE_KEY === 'YOUR_PRIVATE_KEY' || PAYMASTER_API_KEY === 'YOUR_SCS_API_KEY') {
      console.log('⚠️ Please set your private key and SCS API key in the script before running it.');
      return;
    }
    
    console.log(`💸 Sending ${AMOUNT_TO_SEND} SON to ${RECIPIENT_ADDRESS} using Account Abstraction...`);
    console.log('🔄 This transaction will be sponsored (gasless)');
    
    // Send a sponsored transaction using Account Abstraction
    const txHash = await sendSponsoredTransaction(
      PRIVATE_KEY,
      RECIPIENT_ADDRESS,
      AMOUNT_TO_SEND,
      PAYMASTER_API_KEY,
      'testnet',
      {
        logger,
        timeout: 60000, // 60 seconds timeout (AA transactions can take longer)
        gasBufferPercentage: 20 // Add 20% buffer to gas estimation
      }
    );
    
    console.log(`✅ Sponsored transaction sent! Hash: ${txHash}`);
    console.log(`🔍 View transaction: https://explorer.minato.soneium.org/tx/${txHash}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the main function
main().catch(console.error);