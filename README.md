# Soneium Blockchain Client

A TypeScript client for connecting to the Soneium blockchain, with support for Account Abstraction (ERC-4337).

## Features

- Connect to Soneium mainnet and testnet (Minato)
- Send transactions
- Check balances and block numbers
- Account Abstraction support (ERC-4337)
- Sponsored (gasless) transactions

## Setup

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Configure environment variables in `.env` file (already set up for testnet)

## Demo Scripts

### 1. Basic Testnet Connection

This script demonstrates a basic connection to the Soneium testnet, checking the current block number and an address balance:

```bash
node dist/testnet-demo.js
```

### 2. Sending a Transaction

This script demonstrates sending a transaction on the Soneium testnet:

1. Edit `src/send-transaction-demo.ts` and replace:
   - `YOUR_PRIVATE_KEY` with your private key
   - `RECIPIENT_ADDRESS` with the recipient's address (optional)
   - `AMOUNT_TO_SEND` with the amount to send (optional)

2. Build and run:

```bash
npm run build
node dist/send-transaction-demo.js
```

### 3. Account Abstraction (Gasless Transactions)

This script demonstrates using Account Abstraction to send a sponsored (gasless) transaction:

1. Edit `src/account-abstraction-demo.ts` and replace:
   - `YOUR_PRIVATE_KEY` with your private key
   - `YOUR_SCS_API_KEY` with your SCS API key (get one from Startale)
   - `RECIPIENT_ADDRESS` with the recipient's address (optional)
   - `AMOUNT_TO_SEND` with the amount to send (optional)

2. Build and run:

```bash
npm run build
node dist/account-abstraction-demo.js
```

## Getting Testnet Tokens

To get testnet SON tokens, you can use the Soneium faucet:

1. Visit the [Soneium Faucet](https://faucet.minato.soneium.org/)
2. Enter your wallet address
3. Complete the verification
4. Receive testnet SON tokens

## Soneium Testnet Information

- **Network Name**: Soneium Minato (Testnet)
- **Chain ID**: 999
- **RPC URL**: https://soneium-minato.rpc.scs.startale.com
- **Explorer**: https://explorer.minato.soneium.org
- **Currency Symbol**: SON
- **Currency Decimals**: 18

## Using the Client in Your Code

```typescript
import { SoneiumClient } from './dist';

// Create a client connected to the testnet
const client = new SoneiumClient('testnet');

// Connect a wallet (for sending transactions)
const address = client.connectWallet('0x...');

// Get the current block number
const blockNumber = await client.getBlockNumber();
console.log(`Current block number: ${blockNumber}`);

// Get the balance of an address
const balance = await client.getBalance('0x...');
console.log(`Balance: ${balance}`);

// Send a transaction
const txHash = await client.sendTransaction({
  to: '0x...',
  value: 1000000000000000000n, // 1 SON
});
console.log(`Transaction hash: ${txHash}`);
```

## Account Abstraction Example

```typescript
import { sendSponsoredTransaction } from './dist';

// Send a sponsored transaction
const txHash = await sendSponsoredTransaction(
  '0xYourPrivateKey',
  '0xRecipient',
  '0.01', // Amount in SON
  'your-scs-api-key',
  'testnet'
);
console.log(`Sponsored transaction hash: ${txHash}`);