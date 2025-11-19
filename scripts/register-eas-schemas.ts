#!/usr/bin/env tsx
/**
 * EAS Schema Registration Script
 * 
 * This script registers the required EAS schemas on Base (testnet or mainnet).
 * 
 * Usage:
 *   tsx scripts/register-eas-schemas.ts [--network=base-sepolia|eth-sepolia|base-mainnet|eth-mainnet]
 *   
 *   Legacy options (still supported):
 *   --network=sepolia (maps to base-sepolia)
 *   --network=mainnet (maps to base-mainnet)
 * 
 * Required Environment Variables:
 *   - BASE_RPC_URL: RPC endpoint for the selected network (Base or Ethereum)
 *   - ADMIN_PRIVATE_KEY: Private key of wallet with ETH for gas fees
 *   - SCHEMA_REGISTRY_ADDRESS: EAS Schema Registry contract address (optional, auto-selected by network)
 * 
 * The script will register schemas in this order:
 *   1. SchemaVersionMetadata_v1 (must be first for version tracking)
 *   2. GuitarModelAttestation_v1_0_0
 *   3. GuitarInstrumentAttestation_v1_0_0
 */

import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Network configuration
const NETWORKS = {
  'base-sepolia': {
    name: 'Base Sepolia',
    chainId: 84532,
    schemaRegistry: '0x0a7E2Ff54e76B8E6659aedC9103FB21c038050D0',
    easContract: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
  },
  'eth-sepolia': {
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    schemaRegistry: '0x0a7E2Ff54e76B8E6659aedC9103FB21c038050D0',
    easContract: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
  },
  'base-mainnet': {
    name: 'Base Mainnet',
    chainId: 8453,
    schemaRegistry: '0x4200000000000000000000000000000000000020',
    easContract: '0x4200000000000000000000000000000000000021',
  },
  'eth-mainnet': {
    name: 'Ethereum Mainnet',
    chainId: 1,
    schemaRegistry: '0xA7b39296258348C78294F95B872b282326A97BDF',
    easContract: '0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587',
  },
} as const;

// Schema definitions
const SCHEMAS = {
  versionMetadata: {
    name: 'SchemaVersionMetadata_v1',
    definition: 'bytes32 schema_uid,string schema_name,uint8 major_version,uint8 minor_version,bytes32 previous_version_uid,bytes32 next_version_uid,string changelog,uint64 effective_date,bool deprecated',
    description: 'Version metadata schema for tracking schema version relationships',
  },
  model: {
    name: 'GuitarModelAttestation_v1_0_0',
    definition: 'string manufacturer_name,string product_line_name,string model_name,uint16 year,string db_reference_id,string production_type,string production_dates,uint32 estimated_quantity,string original_msrp,string currency,string description',
    description: 'Guitar model attestation schema',
  },
  instrument: {
    name: 'GuitarInstrumentAttestation_v1_0_0',
    definition: 'bytes32 model_attestation_uid,string serial_number,string db_reference_id,string production_date,uint32 production_number,string significance_level,string current_condition,string modifications,string provenance_summary',
    description: 'Guitar instrument attestation schema',
  },
} as const;

interface RegistrationResult {
  schemaName: string;
  schemaUID: string;
  txHash: string;
  success: boolean;
  error?: string;
}

/**
 * Register a single schema
 */
async function registerSchema(
  schemaRegistry: SchemaRegistry,
  schemaName: string,
  schemaDefinition: string,
  description: string
): Promise<RegistrationResult> {
  try {
    console.log(`\n📝 Registering schema: ${schemaName}`);
    console.log(`   Description: ${description}`);
    console.log(`   Definition: ${schemaDefinition.substring(0, 80)}...`);

    // Compute the schema UID to check if it's already registered
    const resolverAddress = '0x0000000000000000000000000000000000000000'; // No resolver
    const revocable = true;
    const computedUID = SchemaRegistry.getSchemaUID(schemaDefinition, resolverAddress, revocable);
    
    console.log(`   🔍 Checking if schema already exists...`);
    console.log(`   📋 Computed Schema UID: ${computedUID}`);
    
    // Check if schema is already registered
    try {
      const existingSchema = await schemaRegistry.getSchema({ uid: computedUID });
      if (existingSchema && existingSchema.uid) {
        console.log(`   ✅ Schema already registered!`);
        console.log(`   📋 Schema UID: ${existingSchema.uid}`);
        console.log(`   ⏭️  Skipping registration...`);
        
        return {
          schemaName,
          schemaUID: existingSchema.uid,
          txHash: 'already-registered',
          success: true,
        };
      }
    } catch {
      // Schema doesn't exist, proceed with registration
      console.log(`   ℹ️  Schema not found, proceeding with registration...`);
    }

    const tx = await schemaRegistry.register({
      schema: schemaDefinition,
      resolverAddress,
      revocable,
    });

    // Transaction hash - in ethers v6, ContractTransaction extends TransactionResponse which has hash
    // Type assertion needed because TypeScript types may not fully reflect runtime structure
    const txHash = (tx.data as unknown as { hash?: string }).hash || 'pending';
    console.log(`   ⏳ Transaction submitted: ${txHash}`);
    console.log(`   Waiting for confirmation...`);

    // Wait for transaction confirmation - wait() returns the schema UID
    const schemaUID = await tx.wait();

    if (!schemaUID) {
      throw new Error('Schema UID not found in transaction. Transaction may have failed.');
    }

    // Get the actual transaction hash from the receipt if it wasn't available before
    const finalTxHash = tx.receipt?.hash || txHash;

    console.log(`   ✅ Schema registered successfully!`);
    console.log(`   📋 Schema UID: ${schemaUID}`);
    console.log(`   🔗 Transaction: ${finalTxHash}`);

    return {
      schemaName,
      schemaUID,
      txHash: finalTxHash,
      success: true,
    };
  } catch (error: unknown) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide more helpful error messages for common issues
      if (errorMessage.includes('execution reverted')) {
        if (errorMessage.includes('0x23369fa6')) {
          errorMessage += '\n   💡 This error often means the schema may already be registered, or there\'s an issue with the contract address.';
          errorMessage += '\n   💡 Verify the Schema Registry address is correct for the selected network.';
        } else {
          errorMessage += '\n   💡 The contract rejected the transaction. This could mean:';
          errorMessage += '\n      - The schema is already registered';
          errorMessage += '\n      - The contract address is incorrect for this network';
          errorMessage += '\n      - There\'s an issue with the schema format';
        }
      }
    }
    console.error(`   ❌ Failed to register schema: ${errorMessage}`);
    
    return {
      schemaName,
      schemaUID: '',
      txHash: '',
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Main registration function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='));
  const networkName = networkArg?.split('=')[1] || process.env.NETWORK || 'base-sepolia';

  // Support legacy 'sepolia' and 'mainnet' for backward compatibility
  const normalizedNetworkName = 
    networkName === 'sepolia' ? 'base-sepolia' :
    networkName === 'mainnet' ? 'base-mainnet' :
    networkName;

  if (!(normalizedNetworkName in NETWORKS)) {
    console.error('❌ Invalid network. Use one of:');
    Object.keys(NETWORKS).forEach(key => {
      console.error(`   --network=${key}`);
    });
    process.exit(1);
  }

  const network = NETWORKS[normalizedNetworkName as keyof typeof NETWORKS];

  console.log('🚀 EAS Schema Registration Script');
  console.log('==================================');
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`🔗 Schema Registry: ${network.schemaRegistry}`);

  // Validate environment variables
  const rpcUrl = process.env.BASE_RPC_URL;
  const privateKey = process.env.ADMIN_PRIVATE_KEY;

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

  // Allow override of schema registry address via env var
  const schemaRegistryAddressRaw = process.env.SCHEMA_REGISTRY_ADDRESS || network.schemaRegistry;
  
  // Ensure address is properly checksummed (EIP-55)
  // Convert to lowercase first to avoid checksum validation errors, then compute correct checksum
  const schemaRegistryAddress = ethers.getAddress(schemaRegistryAddressRaw.toLowerCase());

  try {
    // Setup provider and signer
    console.log(`\n🔌 Connecting to ${network.name}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    // Verify wallet has balance
    const balance = await provider.getBalance(signer.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`   Wallet: ${signer.address}`);
    console.log(`   Balance: ${balanceEth} ETH`);

    if (balance === BigInt(0)) {
      console.error('❌ Wallet has no ETH. Please fund your wallet before proceeding.');
      process.exit(1);
    }

    // Verify contract exists at the address
    const contractCode = await provider.getCode(schemaRegistryAddress);
    if (contractCode === '0x' || contractCode === '0x0') {
      console.error(`\n❌ No contract found at address: ${schemaRegistryAddress}`);
      console.error(`   This address may be incorrect for ${network.name}.`);
      console.error(`   Please verify the Schema Registry address for this network.`);
      process.exit(1);
    }

    // Initialize Schema Registry
    const schemaRegistry = new SchemaRegistry(schemaRegistryAddress);
    schemaRegistry.connect(signer);

    console.log(`\n✅ Connected to Schema Registry`);

    // Register schemas in order
    const results: RegistrationResult[] = [];

    // 1. Version Metadata Schema (MUST be first)
    const versionMetadataResult = await registerSchema(
      schemaRegistry,
      SCHEMAS.versionMetadata.name,
      SCHEMAS.versionMetadata.definition,
      SCHEMAS.versionMetadata.description
    );
    results.push(versionMetadataResult);

    if (!versionMetadataResult.success) {
      console.error('\n❌ Failed to register Version Metadata Schema. Cannot continue.');
      process.exit(1);
    }

    // 2. Model Schema
    const modelResult = await registerSchema(
      schemaRegistry,
      SCHEMAS.model.name,
      SCHEMAS.model.definition,
      SCHEMAS.model.description
    );
    results.push(modelResult);

    // 3. Instrument Schema
    const instrumentResult = await registerSchema(
      schemaRegistry,
      SCHEMAS.instrument.name,
      SCHEMAS.instrument.definition,
      SCHEMAS.instrument.description
    );
    results.push(instrumentResult);

    // Print summary
    console.log('\n\n📊 Registration Summary');
    console.log('=======================');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successfully registered: ${successful.length}/${results.length}`);

    if (successful.length > 0) {
      console.log('\n📋 Schema UIDs (add these to your .env.local):');
      console.log('\n# EAS Schema UIDs');
      console.log(`# Network: ${network.name}`);
      console.log(`# Generated: ${new Date().toISOString()}\n`);

      successful.forEach(result => {
        // Special handling for version metadata
        if (result.schemaName === 'SchemaVersionMetadata_v1') {
          console.log(`VERSION_METADATA_SCHEMA_UID=${result.schemaUID}`);
        } else if (result.schemaName === 'GuitarModelAttestation_v1_0_0') {
          console.log(`MODEL_SCHEMA_UID=${result.schemaUID}`);
          console.log(`MODEL_SCHEMA_VERSION=1.0.0`);
        } else if (result.schemaName === 'GuitarInstrumentAttestation_v1_0_0') {
          console.log(`INSTRUMENT_SCHEMA_UID=${result.schemaUID}`);
          console.log(`INSTRUMENT_SCHEMA_VERSION=1.0.0`);
        }
      });

      console.log(`\nEAS_CONTRACT_ADDRESS=${network.easContract}`);
      console.log(`SCHEMA_REGISTRY_ADDRESS=${schemaRegistryAddress}`);
      console.log(`CHAIN_ID=${network.chainId}`);
    }

    if (failed.length > 0) {
      console.log(`\n❌ Failed to register: ${failed.length}/${results.length}`);
      failed.forEach(result => {
        console.log(`   - ${result.schemaName}: ${result.error}`);
      });
    }

    console.log('\n✨ Registration complete!\n');

    // Exit with error code if any registrations failed
    if (failed.length > 0) {
      process.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('\n❌ Fatal error:', errorMessage);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

