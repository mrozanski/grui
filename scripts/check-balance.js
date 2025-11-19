#!/usr/bin/env node
/**
 * Sanity Check Script - Verify Wallet Balance
 * 
 * This script checks that your environment variables are correctly set
 * and displays your wallet address and balance.
 * 
 * Usage:
 *   node scripts/check-balance.js
 * 
 * Required Environment Variables:
 *   - BASE_RPC_URL: RPC endpoint for the network
 *   - ADMIN_PRIVATE_KEY: Private key of wallet to check
 * 
 * Optional Environment Variables:
 *   - NETWORK: Network name (eth-sepolia, base-sepolia, base-mainnet, eth-mainnet)
 *   - CHAIN_ID: Chain ID (fallback if NETWORK not set)
 */

require('dotenv').config({ path: require('path').join(process.cwd(), '.env.local') });
const { ethers } = require('ethers');

async function checkBalance() {
  console.log('🔍 Wallet Balance Check');
  console.log('=======================\n');

  // Get environment variables
  const rpcUrl = process.env.BASE_RPC_URL;
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  const networkEnv = process.env.NETWORK;
  const chainId = process.env.CHAIN_ID;

  // Validate environment variables
  if (!rpcUrl) {
    console.error('❌ Missing BASE_RPC_URL environment variable');
    console.error('   Add BASE_RPC_URL to your .env.local file');
    process.exit(1);
  }

  if (!privateKey) {
    console.error('❌ Missing ADMIN_PRIVATE_KEY environment variable');
    console.error('   Add ADMIN_PRIVATE_KEY to your .env.local file');
    console.error('   ⚠️  WARNING: Keep your private key secure!');
    process.exit(1);
  }

  try {
    // Create provider with timeout
    console.log('🔌 Connecting to RPC endpoint...');
    const maskedUrl = rpcUrl.replace(/\/v3\/[^/]+/, '/v3/***').replace(/\/v2\/[^/]+/, '/v2/***');
    console.log(`   RPC URL: ${maskedUrl}\n`);
    
    // Determine network chain ID from NETWORK env var first, then fall back to URL detection or CHAIN_ID
    let networkChainId = null;
    let networkName = null;
    
    // Use NETWORK env var if set
    if (networkEnv) {
      const networkLower = networkEnv.toLowerCase();
      if (networkLower === 'eth-sepolia' || networkLower === 'ethereum-sepolia') {
        networkChainId = 11155111;
        networkName = 'Ethereum Sepolia';
        console.log(`   Using NETWORK env var: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (networkLower === 'base-sepolia' || networkLower === 'sepolia') {
        networkChainId = 84532;
        networkName = 'Base Sepolia';
        console.log(`   Using NETWORK env var: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (networkLower === 'base-mainnet' || networkLower === 'mainnet') {
        networkChainId = 8453;
        networkName = 'Base Mainnet';
        console.log(`   Using NETWORK env var: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (networkLower === 'eth-mainnet' || networkLower === 'ethereum-mainnet') {
        networkChainId = 1;
        networkName = 'Ethereum Mainnet';
        console.log(`   Using NETWORK env var: ${networkName} (Chain ID: ${networkChainId})`);
      }
    }
    
    // Fall back to URL detection if NETWORK not set
    if (!networkChainId) {
      if (rpcUrl.includes('eth_sepolia') || (rpcUrl.includes('eth-sepolia') && !rpcUrl.includes('base'))) {
        networkChainId = 11155111;
        networkName = 'Ethereum Sepolia';
        console.log(`   Detected from URL: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (rpcUrl.includes('base-sepolia') || (rpcUrl.includes('sepolia') && rpcUrl.includes('base'))) {
        networkChainId = 84532;
        networkName = 'Base Sepolia';
        console.log(`   Detected from URL: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (rpcUrl.includes('base-mainnet') || (rpcUrl.includes('mainnet') && rpcUrl.includes('base'))) {
        networkChainId = 8453;
        networkName = 'Base Mainnet';
        console.log(`   Detected from URL: ${networkName} (Chain ID: ${networkChainId})`);
      } else if (rpcUrl.includes('eth-mainnet') || (rpcUrl.includes('mainnet') && !rpcUrl.includes('base'))) {
        networkChainId = 1;
        networkName = 'Ethereum Mainnet';
        console.log(`   Detected from URL: ${networkName} (Chain ID: ${networkChainId})`);
      }
    }
    
    // Fall back to CHAIN_ID if still not set
    if (!networkChainId && chainId) {
      networkChainId = parseInt(chainId, 10);
      networkName = 'Unknown';
      console.log(`   Using CHAIN_ID from env: ${networkChainId}`);
    }
    
    // Last resort: try auto-detection
    if (!networkChainId) {
      console.log('   Attempting auto-detection (may fail with some RPC endpoints)...');
    }
    
    console.log('');
    
    // Create provider with explicit chain ID if detected, otherwise let it auto-detect
    // In ethers v6, we can pass the chainId directly as a number
    const provider = networkChainId 
      ? new ethers.JsonRpcProvider(rpcUrl, networkChainId)
      : new ethers.JsonRpcProvider(rpcUrl);

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey, provider);
    const address = wallet.address;

    console.log('✅ Wallet loaded successfully');
    console.log(`   Address: ${address}\n`);

    // Get balance
    console.log('💰 Fetching balance...');
    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);

    console.log(`\n📊 Balance Information:`);
    console.log(`   Address: ${address}`);
    console.log(`   Balance: ${balanceEth} ETH`);
    console.log(`   Balance (Wei): ${balance.toString()}\n`);

    // Check if balance is sufficient
    if (balance === 0n) {
      console.warn('⚠️  WARNING: Wallet has zero balance!');
      console.warn('   You will need ETH to pay for gas fees.');
      console.warn('   Get testnet ETH from a faucet:\n');
      console.warn('   Base Sepolia: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet');
      console.warn('   Ethereum Sepolia: https://sepoliafaucet.com/\n');
    } else {
      console.log('✅ Wallet has sufficient balance for transactions\n');
    }

    // Test network connection
    try {
      const detectedNetwork = await provider.getNetwork();
      console.log('🌐 Network Information:');
      console.log(`   Chain ID: ${detectedNetwork.chainId}`);
      console.log(`   Network Name: ${detectedNetwork.name}`);
      
      // Verify chain ID matches if we specified one
      if (networkChainId && detectedNetwork.chainId !== BigInt(networkChainId)) {
        console.warn(`   ⚠️  Warning: Detected chain ID (${detectedNetwork.chainId}) doesn't match expected (${networkChainId})`);
      }
      console.log('');
    } catch (error) {
      console.warn('⚠️  Could not fetch network information');
      console.warn(`   Error: ${error.message}`);
      if (networkChainId) {
        console.warn(`   Using configured network: ${networkName || 'Unknown'} (Chain ID: ${networkChainId})`);
      }
      console.warn('');
    }

    console.log('✨ Sanity check complete!\n');

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('522') || error.message.includes('timeout') || error.message.includes('timed out')) {
      console.error('   ⚠️  RPC endpoint timeout or connection issue');
      console.error('   This usually means:');
      console.error('   - The RPC endpoint is overloaded or unreachable');
      console.error('   - The public RPC endpoint has rate limits');
      console.error('\n   💡 Try using a dedicated RPC provider:');
      console.error('   - Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY (free tier)');
      console.error('   - Infura: https://sepolia.infura.io/v3/YOUR_KEY (free tier)');
      console.error('   - QuickNode: https://your-endpoint.quiknode.pro/YOUR_KEY');
      console.error('   - Ankr: https://rpc.ankr.com/eth_sepolia/YOUR_API_KEY (requires free API key)');
      console.error('\n   For Base Sepolia:');
      console.error('   - Alchemy: https://base-sepolia.g.alchemy.com/v2/YOUR_KEY');
      console.error('   - Public: https://sepolia.base.org\n');
    } else if (error.message.includes('Unauthorized') || error.message.includes('API key') || error.message.includes('authenticate')) {
      console.error('   ⚠️  Authentication required');
      console.error('   This RPC endpoint requires an API key.\n');
      console.error('   💡 Solutions:');
      console.error('   1. Get a free API key and add it to your RPC URL:');
      console.error('      - Ankr: https://www.ankr.com/rpc/ (free API key)');
      console.error('        URL format: https://rpc.ankr.com/eth_sepolia/YOUR_API_KEY');
      console.error('      - Alchemy: https://www.alchemy.com/ (free tier)');
      console.error('        URL: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY');
      console.error('      - Infura: https://www.infura.io/ (free tier)');
      console.error('        URL: https://sepolia.infura.io/v3/YOUR_KEY');
      console.error('   2. Or use a different public RPC endpoint\n');
    } else if (error.message.includes('invalid response') || error.message.includes('SERVER_ERROR') || error.message.includes('BAD_DATA')) {
      console.error('   ⚠️  Server error or invalid response');
      console.error('   This usually means:');
      console.error('   - RPC URL is incorrect');
      console.error('   - Network is unreachable');
      console.error('   - API key is invalid or missing (if required)');
      console.error('   - The endpoint is rate-limited or down\n');
      console.error('   💡 Try a different RPC provider (see suggestions above)\n');
    } else if (error.message.includes('invalid private key')) {
      console.error('   This usually means:');
      console.error('   - ADMIN_PRIVATE_KEY is malformed');
      console.error('   - Private key should start with 0x\n');
    } else if (error.message.includes('failed to detect network')) {
      console.error('   ⚠️  Network detection failed');
      console.error('   This usually means:');
      console.error('   - RPC endpoint is not responding correctly');
      console.error('   - The endpoint cannot determine the chain ID');
      console.error('   - Connection timeout or rate limiting\n');
      console.error('   💡 Solutions:');
      console.error('   1. Set NETWORK in .env.local to explicitly specify the network:');
      console.error('      NETWORK=eth-sepolia   # for Ethereum Sepolia');
      console.error('      NETWORK=base-sepolia  # for Base Sepolia');
      console.error('      NETWORK=eth-mainnet   # for Ethereum Mainnet');
      console.error('      NETWORK=base-mainnet  # for Base Mainnet');
      console.error('   Or set CHAIN_ID as a fallback:');
      console.error('      CHAIN_ID=11155111  # for Ethereum Sepolia');
      console.error('      CHAIN_ID=84532     # for Base Sepolia');
      console.error('   2. Try a different RPC provider (Alchemy/Infura recommended)');
      console.error('   3. Check if the RPC endpoint is working:');
      console.error('      curl -X POST -H "Content-Type: application/json" \\');
      console.error('        --data \'{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}\' \\');
      console.error('        YOUR_RPC_URL\n');
    }
    
    process.exit(1);
  }
}

// Run the check
checkBalance().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

