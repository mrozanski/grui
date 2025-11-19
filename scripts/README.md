# EAS Schema Registration Script

This directory contains scripts for managing EAS (Ethereum Attestation Service) schema registration.

## register-eas-schemas.ts

Registers the required EAS schemas on Base network (testnet or mainnet).

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Copy `env.example` to `.env.local` and configure:
   - `BASE_RPC_URL`: RPC endpoint for Base network
   - `ADMIN_PRIVATE_KEY`: Private key of wallet with ETH for gas fees
   - `NETWORK`: `sepolia` (testnet) or `mainnet` (default: `sepolia`)

3. **Fund your wallet:**
   - For Base Sepolia testnet: Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - For Base Mainnet: Ensure your wallet has sufficient ETH for gas fees

### Usage

**Register schemas on Base Sepolia (testnet):**
```bash
npm run register-eas-schemas -- --network=sepolia
```

**Register schemas on Base Mainnet:**
```bash
npm run register-eas-schemas -- --network=mainnet
```

**Or use the network from environment variable:**
```bash
# Set NETWORK=sepolia in .env.local, then:
npm run register-eas-schemas
```

### What It Does

The script registers three schemas in order:

1. **SchemaVersionMetadata_v1** (must be first)
   - Tracks schema version relationships
   - Used for schema versioning system

2. **GuitarModelAttestation_v1_0_0**
   - Schema for guitar model attestations
   - Includes manufacturer, product line, model name, year, etc.

3. **GuitarInstrumentAttestation_v1_0_0**
   - Schema for individual guitar instrument attestations
   - Links to model attestation via `model_attestation_uid`

### Output

After successful registration, the script outputs:

- Schema UIDs for each registered schema
- Transaction hashes
- Environment variable format ready to copy to `.env.local`

Example output:
```
📊 Registration Summary
=======================

✅ Successfully registered: 3/3

📋 Schema UIDs (add these to your .env.local):

# EAS Schema UIDs
# Network: Base Sepolia
# Generated: 2025-01-15T10:30:00.000Z

VERSION_METADATA_SCHEMA_UID=0xabc123...
MODEL_SCHEMA_UID=0xdef456...
MODEL_SCHEMA_VERSION=1.0.0
INSTRUMENT_SCHEMA_UID=0x789abc...
INSTRUMENT_SCHEMA_VERSION=1.0.0
EAS_CONTRACT_ADDRESS=0xC2679fBD37d54388Ce493F1DB75320D236e1815e
SCHEMA_REGISTRY_ADDRESS=0x0a7E2Ff54e76B8E6659aedC9103FB21c038050D0
CHAIN_ID=84532
```

### Network Configuration

The script automatically uses the correct contract addresses based on the network:

**Base Sepolia (Testnet):**
- Schema Registry: `0x0a7E2Ff54e76B8E6659aedC9103FB21c038050D0`
- EAS Contract: `0xC2679fBD37d54388Ce493F1DB75320D236e1815e`
- Chain ID: `84532`

**Base Mainnet:**
- Schema Registry: `0x4200000000000000000000000000000000000020`
- EAS Contract: `0x4200000000000000000000000000000000000021`
- Chain ID: `8453`

### Troubleshooting

**Error: "Missing BASE_RPC_URL environment variable"**
- Ensure `.env.local` exists and contains `BASE_RPC_URL`
- Use a reliable RPC provider (Alchemy, Infura, QuickNode)

**Error: "Missing ADMIN_PRIVATE_KEY environment variable"**
- Add your wallet's private key to `.env.local`
- ⚠️ **Never commit `.env.local` to git!**

**Error: "Wallet has no ETH"**
- Fund your wallet with testnet ETH (Sepolia) or mainnet ETH
- Check balance before running the script

**Error: "Transaction failed"**
- Check network connectivity
- Verify RPC URL is correct for the selected network
- Ensure wallet has sufficient ETH for gas fees

### Security Notes

- ⚠️ **Never commit `.env.local` to version control**
- ⚠️ **Keep your private key secure**
- ⚠️ **Use testnet for development and testing**
- ⚠️ **Double-check network before running on mainnet**

### Next Steps

After registering schemas:

1. Copy the schema UIDs from the script output to your `.env.local`
2. Verify schemas on [EASScan](https://base.easscan.org/) (or [Sepolia EASScan](https://base-sepolia.easscan.org/))
3. Proceed with implementing attestation creation in your application

### References

- [EAS Documentation](https://docs.attest.org/)
- [Base Network](https://base.org/)
- [EASScan - Base](https://base.easscan.org/)
- [EASScan - Base Sepolia](https://base-sepolia.easscan.org/)

