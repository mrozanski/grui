/**
 * EAS (Ethereum Attestation Service) Configuration
 *
 * This file contains all EAS-related configuration including:
 * - Contract addresses
 * - Schema definitions and UIDs
 * - Network configuration
 *
 * Network: Ethereum Sepolia (testnet)
 * Chain ID: 11155111
 */

export const EAS_CONFIG = {
  // Network Configuration
  network: process.env.NETWORK || 'eth-sepolia',
  chainId: parseInt(process.env.CHAIN_ID || '11155111', 10),
  rpcUrl: process.env.BASE_RPC_URL!,

  // EAS Contract Addresses
  easContractAddress: process.env.EAS_CONTRACT_ADDRESS!,
  schemaRegistryAddress: process.env.SCHEMA_REGISTRY_ADDRESS!,

  // Schema Definitions
  schemas: {
    // Version Metadata Schema (for tracking schema versions)
    versionMetadata: {
      uid: process.env.VERSION_METADATA_SCHEMA_UID!,
      name: 'SchemaVersionMetadata_v1',
      version: '1.0.0',
      definition: 'bytes32 schema_uid,string schema_name,uint8 major_version,uint8 minor_version,bytes32 previous_version_uid,bytes32 next_version_uid,string changelog,uint64 effective_date,bool deprecated',
      description: 'Version metadata schema for tracking schema version relationships',
    },

    // Guitar Model Attestation Schema
    model: {
      uid: process.env.MODEL_SCHEMA_UID!,
      name: 'GuitarModelAttestation_v1_0_0',
      version: process.env.MODEL_SCHEMA_VERSION || '1.0.0',
      definition: 'string manufacturer_name,string product_line_name,string model_name,uint16 year,string db_reference_id,string production_type,string production_dates,uint32 estimated_quantity,string original_msrp,string currency,string description',
      description: 'Guitar model attestation schema v1.0.0',
    },

    // Guitar Instrument Attestation Schema
    instrument: {
      uid: process.env.INSTRUMENT_SCHEMA_UID!,
      name: 'GuitarInstrumentAttestation_v1_0_0',
      version: process.env.INSTRUMENT_SCHEMA_VERSION || '1.0.0',
      definition: 'bytes32 model_attestation_uid,string serial_number,string db_reference_id,string production_date,uint32 production_number,string significance_level,string current_condition,string modifications,string provenance_summary',
      description: 'Guitar instrument attestation schema v1.0.0',
    },
  },

  // Attestation Configuration
  attestation: {
    // No specific recipient for model/instrument attestations
    defaultRecipient: '0x0000000000000000000000000000000000000000',
    // No expiration for attestations
    noExpiration: 0,
    // Attestations are revocable
    revocable: true,
    // No resolver contract
    noResolver: '0x0000000000000000000000000000000000000000',
  },
} as const;

/**
 * Validates that all required environment variables are set
 */
export function validateEASConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!process.env.BASE_RPC_URL) {
    errors.push('BASE_RPC_URL is not set in environment variables');
  }

  if (!process.env.EAS_CONTRACT_ADDRESS) {
    errors.push('EAS_CONTRACT_ADDRESS is not set in environment variables');
  }

  if (!process.env.SCHEMA_REGISTRY_ADDRESS) {
    errors.push('SCHEMA_REGISTRY_ADDRESS is not set in environment variables');
  }

  if (!process.env.VERSION_METADATA_SCHEMA_UID) {
    errors.push('VERSION_METADATA_SCHEMA_UID is not set in environment variables');
  }

  if (!process.env.MODEL_SCHEMA_UID) {
    errors.push('MODEL_SCHEMA_UID is not set in environment variables');
  }

  if (!process.env.INSTRUMENT_SCHEMA_UID) {
    errors.push('INSTRUMENT_SCHEMA_UID is not set in environment variables');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get schema configuration by name
 */
export function getSchemaConfig(schemaName: 'model' | 'instrument' | 'versionMetadata') {
  return EAS_CONFIG.schemas[schemaName];
}

/**
 * Network information for display
 */
export function getNetworkInfo() {
  return {
    name: EAS_CONFIG.network === 'eth-sepolia' ? 'Ethereum Sepolia' : 'Unknown',
    chainId: EAS_CONFIG.chainId,
    explorerUrl: EAS_CONFIG.network === 'eth-sepolia'
      ? 'https://sepolia.etherscan.io'
      : 'https://etherscan.io',
    easScanUrl: EAS_CONFIG.network === 'eth-sepolia'
      ? 'https://sepolia.easscan.org'
      : 'https://easscan.org',
  };
}
