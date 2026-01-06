# EAS Schema Definitions for Manual Registration

**Purpose:** Quick reference for manually registering EAS schemas via EAS UI  
**Date:** 2025-11-18  
**Goal:** Get schemas registered quickly to start Phase 1A implementation

---

## Registration Order

**Register in this order:**
1. ✅ Version Metadata Schema (needed for schema versioning)
2. ✅ Model Schema (needed for Phase 1A)
3. ⏭️ Instrument Schema (needed for Phase 2A, but can register now)

---

## Schema 1: Version Metadata Schema

**Purpose:** Track schema version relationships and evolution

**Schema Definition:**
```
bytes32 schema_uid,string schema_name,uint8 major_version,uint8 minor_version,bytes32 previous_version_uid,bytes32 next_version_uid,string changelog,uint64 effective_date,bool deprecated
```

**Field Descriptions:**
- `schema_uid`: The EAS schema UID (bytes32)
- `schema_name`: Name like "GuitarModelAttestation" (string)
- `major_version`: Major version number, e.g., 1, 2 (uint8)
- `minor_version`: Minor version number, e.g., 0, 1 (uint8)
- `previous_version_uid`: Previous schema version UID (bytes32, 0x0...0 if first version)
- `next_version_uid`: Next schema version UID (bytes32, 0x0...0 if latest)
- `changelog`: Description of changes (string)
- `effective_date`: Unix timestamp when version became active (uint64)
- `deprecated`: Whether this version is deprecated (bool)

**After Registration:**
- Copy the schema UID (starts with `0x...`)
- Save to `.env.local`: `VERSION_METADATA_SCHEMA_UID=0x...`

---

## Schema 2: Model Attestation Schema (v1.0.0)

**Purpose:** Attest guitar model information

**Schema Definition:**
```
string manufacturer_name,string product_line_name,string model_name,uint16 year,string db_reference_id,string production_type,string production_dates,uint32 estimated_quantity,string original_msrp,string currency,string description
```

**Field Descriptions:**
- `manufacturer_name`: Manufacturer name, e.g., "Fender" (string)
- `product_line_name`: Product line name, e.g., "American Professional" (string)
- `model_name`: Model name, e.g., "Stratocaster" (string)
- `year`: Model year, e.g., 2024 (uint16)
- `db_reference_id`: UUID from your database (string)
- `production_type`: e.g., "mass", "limited", "custom" (string)
- `production_dates`: Date range, e.g., "2024-01-01 to 2024-12-31" (string)
- `estimated_quantity`: Estimated production quantity (uint32)
- `original_msrp`: Original MSRP, e.g., "1299.99" (string)
- `currency`: Currency code, e.g., "USD" (string)
- `description`: Model description (string)

**After Registration:**
- Copy the schema UID (starts with `0x...`)
- Save to `.env.local`: `MODEL_SCHEMA_UID=0x...`
- Save version: `MODEL_SCHEMA_VERSION=1.0.0`

---

## Schema 3: Instrument Attestation Schema (v1.0.0)

**Purpose:** Attest individual guitar instrument information (Phase 2A)

**Schema Definition:**
```
bytes32 model_attestation_uid,string serial_number,string db_reference_id,string production_date,uint32 production_number,string significance_level,string current_condition,string modifications,string provenance_summary
```

**Field Descriptions:**
- `model_attestation_uid`: UID of the model attestation this instrument belongs to (bytes32)
- `serial_number`: Guitar serial number (string)
- `db_reference_id`: UUID from your database (string)
- `production_date`: Production date, e.g., "2024-06-15" (string)
- `production_number`: Production sequence number (uint32)
- `significance_level`: e.g., "standard", "notable", "historic" (string)
- `current_condition`: e.g., "mint", "excellent", "good" (string)
- `modifications`: Description of any modifications (string)
- `provenance_summary`: Ownership/provenance history summary (string)

**After Registration:**
- Copy the schema UID (starts with `0x...`)
- Save to `.env.local`: `INSTRUMENT_SCHEMA_UID=0x...`
- Save version: `INSTRUMENT_SCHEMA_VERSION=1.0.0`

**Note:** You can register this now even though Phase 2A comes later. It won't hurt to have it ready.

---

## Quick Copy-Paste for EAS UI

### Version Metadata Schema
```
bytes32 schema_uid,string schema_name,uint8 major_version,uint8 minor_version,bytes32 previous_version_uid,bytes32 next_version_uid,string changelog,uint64 effective_date,bool deprecated
```

### Model Schema
```
string manufacturer_name,string product_line_name,string model_name,uint16 year,string db_reference_id,string production_type,string production_dates,uint32 estimated_quantity,string original_msrp,string currency,string description
```

### Instrument Schema
```
bytes32 model_attestation_uid,string serial_number,string db_reference_id,string production_date,uint32 production_number,string significance_level,string current_condition,string modifications,string provenance_summary
```

---

## Environment Variables to Set

After registering all schemas, update your `.env.local`:

```bash
# EAS Configuration
EAS_CONTRACT_ADDRESS=0x...  # Base Sepolia EAS contract address
BASE_RPC_URL=https://sepolia.base.org  # Or your RPC provider
CHAIN_ID=84532  # Base Sepolia (use 8453 for mainnet)

# Schema UIDs (from registration)
VERSION_METADATA_SCHEMA_UID=0x...
MODEL_SCHEMA_UID=0x...
MODEL_SCHEMA_VERSION=1.0.0
INSTRUMENT_SCHEMA_UID=0x...
INSTRUMENT_SCHEMA_VERSION=1.0.0

# IPFS (Pinata)
PINATA_API_KEY=...
PINATA_JWT=...  # Or use API key

# Admin Wallet (for signing attestations)
ADMIN_WALLET_PRIVATE_KEY=0x...  # Keep secure!
ADMIN_WALLET_ADDRESS=0x...
```

---

## EAS Contract Addresses

**Base Sepolia (Testnet):**
- EAS Contract: `0xC2679fBD37d54388Ce493F1DB75320D236e1815e`
- Schema Registry: `0x0a7E2Ff54e76B8E6659aedC9103FB21c038050D0`

**Base Mainnet:**
- EAS Contract: `0x4200000000000000000000000000000000000021`
- Schema Registry: `0x4200000000000000000000000000000000000020`

**Note:** Use Sepolia for Phase 1A development/testing.

---

## Registration Checklist

- [ ] Register Version Metadata Schema
  - [ ] Copy schema UID
  - [ ] Save to `.env.local`
- [ ] Register Model Schema
  - [ ] Copy schema UID
  - [ ] Save to `.env.local`
- [ ] Register Instrument Schema (optional for now)
  - [ ] Copy schema UID
  - [ ] Save to `.env.local`
- [ ] Verify all schema UIDs are saved
- [ ] Test schema lookup on EAS explorer

---

## Next Steps After Registration

1. ✅ Schemas registered
2. ✅ Schema UIDs saved to environment variables
3. ⏭️ Start Phase 1A implementation
4. ⏭️ Create attestation creation logic in Next.js
5. ⏭️ Test with first model attestation

---

**Document Version:** 1.0  
**Status:** Ready for Manual Registration

