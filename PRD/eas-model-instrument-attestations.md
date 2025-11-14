# EAS Model & Instrument Attestations - Product Requirements Document

**Version:** 1.0
**Date:** 2025-11-10
**Status:** Draft for Review
**Target:** Guitar Registry Web3 Integration - Phase 1

---

## Executive Summary

This PRD defines the implementation of Ethereum Attestation Service (EAS) based attestations for guitar models and individual instruments within the Guitar Registry. The goal is to create a decentralized, manufacturer-verified, industry-standard system for tracking guitar models and individual instruments using cryptographic attestations that serve as the foundation for a permanent chain of provenance.

### Key Objectives

1. Enable creation of **Model Attestations** - cryptographically signed records identifying specific guitar models
2. Enable creation of **Instrument Attestations** - cryptographically signed records identifying individual instruments by serial number
3. Create a **chain of provenance** where instruments reference models, and future attestations (reviews, sales, maintenance) can link to both
4. Establish a **hybrid trust model** where admins can create attestations and manufacturers can co-sign for official verification
5. Ensure **data permanence** through dual storage (IPFS + PostgreSQL) even if the web2 registry fails

---

## Architecture Overview

### Technology Stack

- **Blockchain:** Base (Ethereum L2) - low cost, EAS native support
- **Attestation Standard:** Ethereum Attestation Service (EAS)
- **Attestation Type:** Offchain signed messages (no gas fees)
- **Storage:** Dual approach
  - **IPFS:** Permanent decentralized storage of attestation objects
  - **PostgreSQL:** Fast queries, UI display, caching layer
- **Wallet Integration:** Dynamic.xyz (already in use for other attestations)
- **Frontend:** Next.js 15 with Server Components + Client Components
- **Backend:** Next.js API routes + Server Actions

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Guitar Registry UI (Next.js)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Model Form   │  │ Instrument   │  │ Manufacturer │      │
│  │ (Admin)      │  │ Form (Admin) │  │ Dashboard    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Routes / Server Actions             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  POST /api/attestations/models/create               │   │
│  │  POST /api/attestations/instruments/create          │   │
│  │  POST /api/attestations/cosign                      │   │
│  │  GET  /api/attestations/:uid                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────┬───────────────────────┘
          │                           │
          ▼                           ▼
┌──────────────────────┐    ┌────────────────────────┐
│   EAS SDK (Offchain) │    │   IPFS Client          │
│   - Schema Encoding  │    │   - Pin attestations   │
│   - Sign attestation │    │   - Retrieve by CID    │
│   - Verify signature │    │                        │
└──────────────────────┘    └────────────────────────┘
          │                           │
          ▼                           ▼
┌──────────────────────────────────────────────────┐
│         PostgreSQL Database (via Prisma)         │
│  ┌────────────┐  ┌──────────────┐               │
│  │  models    │  │ individual_  │               │
│  │  + attest  │  │ guitars      │               │
│  │  _uid      │  │ + attest_uid │               │
│  │  + ipfs_cid│  │ + ipfs_cid   │               │
│  └────────────┘  └──────────────┘               │
│  ┌────────────────────────────────────────────┐ │
│  │  attestations (new table)                  │ │
│  │  - uid, schema_uid, entity_type,           │ │
│  │    entity_id, attestation_data,            │ │
│  │    ipfs_cid, signer, cosigner, status      │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## Phase 1: Model Attestations

### Overview

Model attestations serve as the canonical identification for guitar models (e.g., "Fender Stratocaster 1954", "Gibson Les Paul Standard 1959"). Each model attestation creates a permanent, verifiable record that individual instruments can reference.

### EAS Schema Definition

**Schema Name:** `GuitarModelAttestation_v1`

**Schema String:**
```
string manufacturer_name,
string product_line_name,
string model_name,
uint16 year,
string db_reference_id,
string production_type,
string production_dates,
uint32 estimated_quantity,
string original_msrp,
string currency,
string description
```

**Field Descriptions:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `manufacturer_name` | string | Yes | Manufacturer name matching PSQL | "Fender" |
| `product_line_name` | string | Yes | Product line name matching PSQL | "American Vintage Series" |
| `model_name` | string | Yes | Model name matching PSQL | "Stratocaster" |
| `year` | uint16 | Yes | Production year | 1954 |
| `db_reference_id` | string | Yes | PSQL UUID for cross-reference | "f47ac10b-58cc-4372-..." |
| `production_type` | string | No | mass/custom/limited | "mass" |
| `production_dates` | string | No | ISO date range | "1954-01-01/1954-12-31" |
| `estimated_quantity` | uint32 | No | Units produced | 500 |
| `original_msrp` | string | No | Original price | "249.50" |
| `currency` | string | No | Currency code | "USD" |
| `description` | string | No | Model description/notes | "First year of production..." |

### Schema Versioning Strategy

**Overview:**

EAS schemas are **immutable by design** - once registered on-chain, they cannot be modified. This ensures data integrity but requires a thoughtful versioning strategy for schema evolution. The Guitar Registry implements a three-pronged approach to track schema versions and maintain backward compatibility.

#### Version Metadata Schema

A dedicated schema tracks the relationships between schema versions:

**Schema Name:** `SchemaVersionMetadata_v1`

**Schema String:**
```
bytes32 schema_uid,
string schema_name,
uint8 major_version,
uint8 minor_version,
bytes32 previous_version_uid,
bytes32 next_version_uid,
string changelog,
uint64 effective_date,
bool deprecated
```

**Field Descriptions:**

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `schema_uid` | bytes32 | UID of the schema this metadata describes | 0xabc123... |
| `schema_name` | string | Human-readable schema name | "GuitarModelAttestation" |
| `major_version` | uint8 | Major version number | 1 |
| `minor_version` | uint8 | Minor version number | 0 |
| `previous_version_uid` | bytes32 | UID of previous version (0x0 if v1) | 0x0000... |
| `next_version_uid` | bytes32 | UID of next version (0x0 if latest) | 0x0000... |
| `changelog` | string | Description of changes | "Added finish_options field" |
| `effective_date` | uint64 | Unix timestamp when version became active | 1699564800 |
| `deprecated` | bool | Whether this version is deprecated | false |

**Usage Example:**

```typescript
// When creating GuitarModelAttestation_v2
const versionMetadata = {
  schema_uid: MODEL_SCHEMA_V2_UID,
  schema_name: "GuitarModelAttestation",
  major_version: 2,
  minor_version: 0,
  previous_version_uid: MODEL_SCHEMA_V1_UID,
  next_version_uid: ZERO_BYTES32,
  changelog: "Added finish_options and pickup_variations fields",
  effective_date: 1699564800,
  deprecated: false
};
```

#### Semantic Versioning Convention

All schemas follow **semantic versioning** (major.minor.patch):

**Version Bumping Rules:**

- **Major version (1.0.0 → 2.0.0):** Breaking changes
  - Remove fields
  - Rename fields
  - Change field types incompatibly (e.g., string → uint16)
  - Requires new schema registration

- **Minor version (1.0.0 → 1.1.0):** Additive changes
  - Add new optional fields
  - Expand field types (uint8 → uint16)
  - Add new schemas without modifying existing
  - Requires new schema registration

- **Patch version (1.0.0 → 1.0.1):** Documentation only
  - Update schema description attestation
  - Fix typos in documentation
  - No schema re-registration needed

**Schema Naming Convention:**

```typescript
// Include semantic version in schema name
const SCHEMA_NAMES = {
  model_v1_0_0: "GuitarModelAttestation_v1_0_0",
  model_v2_0_0: "GuitarModelAttestation_v2_0_0", // Future
  instrument_v1_0_0: "GuitarInstrumentAttestation_v1_0_0"
};
```

#### Migration Policy

**Approach:** New attestations use new schema version; existing attestations remain unchanged.

When a new schema version is created:
1. Register new schema on-chain with incremented version
2. Create version link attestation using Version Metadata Schema
3. Update application to use new schema for **new attestations only**
4. **Do not** re-attest existing records (preserves historical integrity)
5. Application code handles multiple schema versions for reading/decoding

**Example Evolution:**

```typescript
// v1.0.0 (Initial release)
"string manufacturer_name,string model_name,uint16 year,..."

// v1.1.0 (Added optional fields - backward compatible)
"string manufacturer_name,string model_name,uint16 year,string finish_options,..."

// v2.0.0 (Renamed field - breaking change)
"string brand,string model_name,uint16 year,string finish_options,..." // 'manufacturer_name' → 'brand'
```

**Decoder Abstraction:**

```typescript
export function decodeModelAttestation(attestation: Attestation) {
  const schemaVersion = getSchemaVersion(attestation.schema_uid);

  if (schemaVersion.startsWith('1.')) {
    return decodeModelV1(attestation); // Original decoder
  } else if (schemaVersion.startsWith('2.')) {
    return decodeModelV2(attestation); // New decoder with renamed field
  }

  throw new Error(`Unsupported schema version: ${schemaVersion}`);
}
```

#### Database Version Registry

In addition to on-chain version tracking, the database maintains a version registry for fast queries:

```sql
-- Schema versions table (added below in Database Schema Changes section)
CREATE TABLE schema_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    schema_name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    schema_uid VARCHAR(66) NOT NULL,
    previous_version_id UUID REFERENCES schema_versions(id),
    next_version_id UUID REFERENCES schema_versions(id),
    changelog TEXT,
    effective_date TIMESTAMPTZ NOT NULL,
    deprecated_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(schema_name, version)
);
```

**Benefits:**
- Fast version queries without blockchain calls
- Track adoption metrics (% using each version)
- Generate migration reports
- Support complex analytics queries

#### Version Discovery Pattern

```typescript
// Query version chain from database
export async function getSchemaVersionChain(schemaName: string) {
  const currentVersion = await prisma.schema_versions.findFirst({
    where: {
      schema_name: schemaName,
      status: 'active'
    },
    orderBy: { effective_date: 'desc' }
  });

  // Walk the chain backward
  const versions = [];
  let version = currentVersion;
  while (version) {
    versions.push(version);
    version = version.previous_version_id
      ? await prisma.schema_versions.findUnique({
          where: { id: version.previous_version_id }
        })
      : null;
  }

  return versions.reverse(); // [v1.0.0, v1.1.0, v2.0.0]
}
```

#### Breaking Change Guidelines

**When to create a new major version:**
- Field removal (data loss)
- Field renaming (breaks queries)
- Type changes that reduce precision (uint32 → uint16)
- Semantic meaning changes

**When to create a new minor version:**
- Add optional fields
- Expand types (uint16 → uint32)
- Add new validation rules
- Extend enum values

**Documentation Requirements:**

For any schema version change:
- [ ] Document breaking vs. non-breaking changes
- [ ] Update API documentation with version notes
- [ ] Provide migration guide for developers
- [ ] Create version link attestation on-chain
- [ ] Update database version registry
- [ ] Test backward compatibility

### Database Schema Changes

```sql
-- Add attestation fields to models table
ALTER TABLE models
ADD COLUMN attestation_uid VARCHAR(66),
ADD COLUMN ipfs_cid VARCHAR(100),
ADD COLUMN attestation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN attested_by VARCHAR(100),
ADD COLUMN attested_at TIMESTAMPTZ,
ADD COLUMN cosigner_wallet VARCHAR(42),
ADD COLUMN cosigned_at TIMESTAMPTZ;

-- Create index for attestation lookups
CREATE INDEX idx_models_attestation_uid ON models(attestation_uid);
CREATE INDEX idx_models_attestation_status ON models(attestation_status);

-- Create attestations table for tracking all attestations
CREATE TABLE attestations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    uid VARCHAR(66) UNIQUE NOT NULL,
    schema_uid VARCHAR(66) NOT NULL,
    schema_type VARCHAR(50) NOT NULL, -- 'model', 'instrument', 'review', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'model', 'individual_guitar', etc.
    entity_id UUID NOT NULL, -- references models.id or individual_guitars.id

    -- Attestation data (decoded for search/display)
    attestation_data JSONB NOT NULL,

    -- Storage
    ipfs_cid VARCHAR(100),

    -- Schema versioning
    schema_version VARCHAR(20), -- '1.0.0', '2.0.0', etc.

    -- Signatures
    signer_wallet VARCHAR(42) NOT NULL,
    signer_role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'manufacturer', 'community'
    signed_at TIMESTAMPTZ NOT NULL,

    cosigner_wallet VARCHAR(42),
    cosigner_role VARCHAR(20), -- 'manufacturer'
    cosigned_at TIMESTAMPTZ,

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'official'
    verification_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attestations_entity ON attestations(entity_type, entity_id);
CREATE INDEX idx_attestations_schema ON attestations(schema_type);
CREATE INDEX idx_attestations_status ON attestations(status);
CREATE INDEX idx_attestations_signer ON attestations(signer_wallet);
CREATE INDEX idx_attestations_uid ON attestations(uid);
CREATE INDEX idx_attestations_schema_version ON attestations(schema_version);

-- Full text search on attestation data
CREATE INDEX idx_attestations_data ON attestations USING GIN (attestation_data);

-- Create schema versions registry table
CREATE TABLE schema_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    schema_name VARCHAR(100) NOT NULL, -- 'GuitarModelAttestation', 'GuitarInstrumentAttestation'
    version VARCHAR(20) NOT NULL, -- '1.0.0', '2.0.0'
    schema_uid VARCHAR(66) NOT NULL, -- EAS schema UID

    -- Version chain links
    previous_version_id UUID REFERENCES schema_versions(id),
    next_version_id UUID REFERENCES schema_versions(id),

    -- Metadata
    changelog TEXT,
    effective_date TIMESTAMPTZ NOT NULL,
    deprecated_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'deprecated', 'sunset'

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(schema_name, version)
);

-- Indexes for schema versions
CREATE INDEX idx_schema_versions_name ON schema_versions(schema_name);
CREATE INDEX idx_schema_versions_status ON schema_versions(status);
CREATE INDEX idx_schema_versions_uid ON schema_versions(schema_uid);
CREATE INDEX idx_schema_versions_effective_date ON schema_versions(effective_date);

-- Create manufacturer wallets registry table
CREATE TABLE manufacturer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'pending', 'active', 'revoked'
    registered_by VARCHAR(100),
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    notes TEXT
);

-- Indexes for manufacturer wallets
CREATE INDEX idx_manufacturer_wallets_manufacturer ON manufacturer_wallets(manufacturer_id);
CREATE INDEX idx_manufacturer_wallets_address ON manufacturer_wallets(wallet_address);
CREATE INDEX idx_manufacturer_wallets_status ON manufacturer_wallets(status);
```

### Workflow: Creating a Model Attestation

#### User Journey (Admin)

1. **Admin navigates to "Add Model" page**
   - Fills out model form (manufacturer, product line, name, year, specs)
   - Clicks "Save Model"

2. **System creates model record**
   - Saves to PostgreSQL `models` table
   - Returns model ID

3. **System automatically creates attestation**
   - Encodes model data using EAS Schema
   - Admin wallet (from session) signs the attestation
   - Attestation stored in IPFS
   - Attestation record created in `attestations` table
   - Model record updated with `attestation_uid` and `ipfs_cid`
   - Status set to `pending` (awaiting manufacturer co-signature)

4. **Admin sees success message**
   - "Model created successfully. Attestation UID: 0xabc123..."
   - Model appears in listings with "Pending Verification" badge

#### User Journey (Manufacturer)

1. **Manufacturer logs in with wallet**
   - Connects wallet via Dynamic.xyz
   - System verifies manufacturer wallet is registered

2. **Manufacturer views "My Models" dashboard**
   - Sees list of models awaiting co-signature
   - Filters by manufacturer name

3. **Manufacturer reviews model details**
   - Clicks on model to see full details
   - Reviews attestation data (manufacturer, name, year, specs)
   - Clicks "Verify & Co-Sign"

4. **System prompts for signature**
   - EAS SDK generates co-signature message
   - Manufacturer signs via wallet
   - System updates attestation with co-signature
   - Status changes to `official`

5. **Model now shows as "Manufacturer Verified"**
   - Badge updates in UI
   - Model appears in verified listings

#### Technical Flow

```typescript
// Simplified pseudocode

// Step 1: Admin creates model (Server Action)
async function createModelWithAttestation(formData: ModelFormData, adminWallet: Wallet) {

  // 1. Create model in database
  const model = await prisma.models.create({
    data: {
      manufacturer_id: formData.manufacturer_id,
      product_line_id: formData.product_line_id,
      name: formData.name,
      year: formData.year,
      // ... other fields
      attestation_status: 'pending'
    }
  });

  // 2. Get manufacturer and product line names
  const manufacturer = await prisma.manufacturers.findUnique({
    where: { id: formData.manufacturer_id }
  });
  const productLine = await prisma.product_lines.findUnique({
    where: { id: formData.product_line_id }
  });

  // 3. Encode attestation data using EAS Schema
  const schemaEncoder = new SchemaEncoder(MODEL_SCHEMA_STRING);
  const encodedData = schemaEncoder.encodeData([
    { name: "manufacturer_name", value: manufacturer.name, type: "string" },
    { name: "product_line_name", value: productLine.name, type: "string" },
    { name: "model_name", value: formData.name, type: "string" },
    { name: "year", value: formData.year, type: "uint16" },
    { name: "db_reference_id", value: model.id, type: "string" },
    { name: "production_type", value: formData.production_type || "", type: "string" },
    // ... other fields
  ]);

  // 4. Sign offchain attestation
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  const offchain = await eas.getOffchain();
  const signer = adminWallet.getSigner();

  const offchainAttestation = await offchain.signOffchainAttestation({
    schema: MODEL_SCHEMA_UID,
    recipient: "0x0000000000000000000000000000000000000000", // no specific recipient
    expirationTime: NO_EXPIRATION,
    revocable: true,
    data: encodedData
  }, signer);

  // 5. Store attestation in IPFS
  const ipfsCID = await ipfsClient.add(JSON.stringify(offchainAttestation));

  // 6. Store attestation in database
  await prisma.attestations.create({
    data: {
      uid: offchainAttestation.uid,
      schema_uid: MODEL_SCHEMA_UID,
      schema_type: 'model',
      entity_type: 'model',
      entity_id: model.id,
      attestation_data: {
        manufacturer_name: manufacturer.name,
        product_line_name: productLine.name,
        model_name: formData.name,
        year: formData.year,
        // ... decoded data for searching
      },
      ipfs_cid: ipfsCID,
      signer_wallet: adminWallet.address,
      signer_role: 'admin',
      signed_at: new Date(),
      status: 'pending'
    }
  });

  // 7. Update model with attestation references
  await prisma.models.update({
    where: { id: model.id },
    data: {
      attestation_uid: offchainAttestation.uid,
      ipfs_cid: ipfsCID,
      attested_by: adminWallet.address,
      attested_at: new Date()
    }
  });

  return { model, attestation: offchainAttestation };
}

// Step 2: Manufacturer co-signs (Server Action)
async function cosignModelAttestation(attestationUID: string, manufacturerWallet: Wallet) {

  // 1. Fetch original attestation from database
  const attestationRecord = await prisma.attestations.findUnique({
    where: { uid: attestationUID }
  });

  // 2. Fetch full attestation from IPFS
  const fullAttestation = await ipfsClient.get(attestationRecord.ipfs_cid);

  // 3. Create co-signature message
  const cosignMessage = {
    attestation_uid: attestationUID,
    original_signer: attestationRecord.signer_wallet,
    cosigner_role: 'manufacturer',
    timestamp: Date.now()
  };

  // 4. Manufacturer signs the message
  const cosignature = await manufacturerWallet.signMessage(JSON.stringify(cosignMessage));

  // 5. Create updated attestation object with co-signature
  const cosignedAttestation = {
    ...fullAttestation,
    cosignature: {
      message: cosignMessage,
      signature: cosignature,
      signer: manufacturerWallet.address
    }
  };

  // 6. Store updated attestation in IPFS
  const newIPFSCID = await ipfsClient.add(JSON.stringify(cosignedAttestation));

  // 7. Update database
  await prisma.attestations.update({
    where: { uid: attestationUID },
    data: {
      cosigner_wallet: manufacturerWallet.address,
      cosigner_role: 'manufacturer',
      cosigned_at: new Date(),
      status: 'official',
      ipfs_cid: newIPFSCID // updated IPFS reference with cosignature
    }
  });

  // 8. Update model record
  await prisma.models.update({
    where: { attestation_uid: attestationUID },
    data: {
      attestation_status: 'official',
      cosigner_wallet: manufacturerWallet.address,
      cosigned_at: new Date()
    }
  });

  return { success: true, ipfs_cid: newIPFSCID };
}
```

### API Endpoints

#### POST `/api/attestations/models/create`

**Purpose:** Create a new model attestation (admin only)

**Request Body:**
```json
{
  "model_id": "uuid",
  "wallet_address": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "attestation_uid": "0xabc123...",
  "ipfs_cid": "QmX123...",
  "status": "pending"
}
```

#### POST `/api/attestations/cosign`

**Purpose:** Manufacturer co-signs an attestation

**Request Body:**
```json
{
  "attestation_uid": "0xabc123...",
  "wallet_address": "0x...",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "status": "official",
  "ipfs_cid": "QmY456..." // updated CID with cosignature
}
```

#### GET `/api/attestations/:uid`

**Purpose:** Retrieve attestation details

**Response:**
```json
{
  "uid": "0xabc123...",
  "schema_type": "model",
  "entity_type": "model",
  "entity_id": "uuid",
  "data": {
    "manufacturer_name": "Fender",
    "model_name": "Stratocaster",
    "year": 1954,
    // ... full decoded data
  },
  "ipfs_cid": "QmX123...",
  "signer": "0x...",
  "cosigner": "0x...",
  "status": "official",
  "signed_at": "2025-11-10T12:00:00Z",
  "cosigned_at": "2025-11-11T14:30:00Z"
}
```

#### GET `/api/attestations?entity_type=model&status=pending`

**Purpose:** List attestations with filters

**Query Parameters:**
- `entity_type`: model | individual_guitar
- `status`: pending | official
- `signer_wallet`: 0x...
- `manufacturer_name`: Fender

**Response:**
```json
{
  "attestations": [
    {
      "uid": "0xabc123...",
      "schema_type": "model",
      "data": { /* ... */ },
      "status": "pending",
      // ... other fields
    }
  ],
  "count": 15,
  "page": 1
}
```

### UI Components

#### Model Form Component (`src/app/models/create/page.tsx`)

**Features:**
- Standard model creation form
- After successful save, shows attestation creation progress
- Displays attestation UID and IPFS CID
- Shows "Pending Manufacturer Verification" badge

**Flow:**
1. User fills form
2. Submits → creates model + attestation
3. Shows success with attestation details
4. Redirects to model detail page

#### Model Detail Page Updates (`src/app/models/[id]/page.tsx`)

**New Section:** Attestation Status

```tsx
<section className="border rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Attestation Status</h2>

  <AttestationBadge
    status={model.attestation_status}
    uid={model.attestation_uid}
  />

  <div className="mt-4 space-y-2 text-sm">
    <div>
      <span className="font-medium">Attestation UID:</span>
      <code className="ml-2 text-xs">{model.attestation_uid}</code>
      <CopyButton value={model.attestation_uid} />
    </div>

    <div>
      <span className="font-medium">IPFS CID:</span>
      <code className="ml-2 text-xs">{model.ipfs_cid}</code>
      <a href={`https://ipfs.io/ipfs/${model.ipfs_cid}`} target="_blank">
        View on IPFS
      </a>
    </div>

    <div>
      <span className="font-medium">Attested by:</span>
      <code className="ml-2 text-xs">{model.attested_by}</code>
    </div>

    {model.cosigner_wallet && (
      <div>
        <span className="font-medium">Verified by:</span>
        <code className="ml-2 text-xs">{model.cosigner_wallet}</code>
      </div>
    )}
  </div>

  {model.attestation_status === 'pending' && isManufacturer && (
    <button onClick={() => handleCosign(model.attestation_uid)}>
      Verify & Co-Sign This Model
    </button>
  )}
</section>
```

#### Manufacturer Dashboard (`src/app/dashboard/manufacturer/page.tsx`)

**New Page:** Dashboard for manufacturers to see pending attestations

**Features:**
- List of models awaiting verification
- Filter by manufacturer
- Batch co-signing capability
- Attestation history

```tsx
export default async function ManufacturerDashboard() {
  const { primaryWallet } = useDynamicContext();

  // Fetch manufacturer from wallet address
  const manufacturer = await getManufacturerByWallet(primaryWallet.address);

  // Fetch pending attestations for this manufacturer
  const pendingAttestations = await getPendingModelAttestations(manufacturer.id);

  return (
    <div>
      <h1>Manufacturer Dashboard - {manufacturer.name}</h1>

      <section>
        <h2>Pending Verifications ({pendingAttestations.length})</h2>

        <div className="grid gap-4">
          {pendingAttestations.map(attestation => (
            <ModelAttestationCard
              key={attestation.uid}
              attestation={attestation}
              onCosign={handleCosign}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Phase 2: Instrument Attestations

### Overview

Instrument attestations identify individual guitars by serial number and reference their parent model attestation. This creates a hierarchical chain: Manufacturer → Model → Instrument → Events/Reviews/Sales.

### EAS Schema Definition

**Schema Name:** `GuitarInstrumentAttestation_v1`

**Schema String:**
```
bytes32 model_attestation_uid,
string serial_number,
string db_reference_id,
string production_date,
uint32 production_number,
string significance_level,
string current_condition,
string modifications,
string provenance_summary
```

**Field Descriptions:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `model_attestation_uid` | bytes32 | Yes | Reference to model attestation | 0xabc123... |
| `serial_number` | string | Yes | Unique instrument serial | "001234" |
| `db_reference_id` | string | Yes | PSQL UUID for cross-reference | "f47ac10b-..." |
| `production_date` | string | No | ISO date of manufacture | "1959-03-15" |
| `production_number` | uint32 | No | Production sequence number | 42 |
| `significance_level` | string | No | notable/legendary/historic | "legendary" |
| `current_condition` | string | No | Condition rating | "excellent" |
| `modifications` | string | No | List of modifications | "Replaced tuners 1975" |
| `provenance_summary` | string | No | Ownership history | "Owned by Eric Clapton..." |

### Database Schema Changes

```sql
-- Add attestation fields to individual_guitars table
ALTER TABLE individual_guitars
ADD COLUMN attestation_uid VARCHAR(66),
ADD COLUMN ipfs_cid VARCHAR(100),
ADD COLUMN attestation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN attested_by VARCHAR(100),
ADD COLUMN attested_at TIMESTAMPTZ,
ADD COLUMN cosigner_wallet VARCHAR(42),
ADD COLUMN cosigned_at TIMESTAMPTZ;

-- Create index
CREATE INDEX idx_individual_guitars_attestation_uid ON individual_guitars(attestation_uid);
CREATE INDEX idx_individual_guitars_attestation_status ON individual_guitars(attestation_status);
```

### Workflow: Creating an Instrument Attestation

Similar to model attestations, but with additional requirement:

**Prerequisites:**
- Model must already have an attestation (pending or official status)
- Serial number must be unique

**Key Difference:**
- Instrument attestation includes `model_attestation_uid` field
- Creates verifiable link: Instrument → Model → Manufacturer

### API Endpoints

#### POST `/api/attestations/instruments/create`

**Request Body:**
```json
{
  "guitar_id": "uuid",
  "wallet_address": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "attestation_uid": "0xdef456...",
  "ipfs_cid": "QmZ789...",
  "model_attestation_uid": "0xabc123...",
  "status": "pending"
}
```

### UI Updates

**Individual Guitar Detail Page:**
- Show model attestation link
- Display instrument attestation UID
- Verification status badge
- Manufacturer co-sign option

**Chain of Provenance Visualization:**
```
Manufacturer Attestation (future)
    ↓
Model Attestation: 0xabc123...
    ↓
Instrument Attestation: 0xdef456...
    ↓
Review Attestations: [0x111..., 0x222...]
Sale Attestations: [0x333...]
Maintenance Attestations: [0x444...]
```

---

## Security & Validation

### Wallet Registration

**Manufacturer Wallet Registry:**
```sql
CREATE TABLE manufacturer_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    manufacturer_id UUID NOT NULL REFERENCES manufacturers(id),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'revoked'
    registered_by VARCHAR(100),
    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMPTZ,
    notes TEXT
);

CREATE INDEX idx_manufacturer_wallets_manufacturer ON manufacturer_wallets(manufacturer_id);
CREATE INDEX idx_manufacturer_wallets_address ON manufacturer_wallets(wallet_address);
```

**Verification Process:**
1. Manufacturer requests wallet registration (email proof, company docs)
2. Admin reviews and approves
3. Wallet status set to `active`
4. Manufacturer can now co-sign attestations

### Attestation Validation

**Server-side validation before creating attestation:**

```typescript
async function validateModelAttestation(modelData: ModelFormData) {
  // 1. Check model doesn't already have attestation
  const existing = await prisma.models.findUnique({
    where: { id: modelData.model_id },
    select: { attestation_uid: true }
  });

  if (existing?.attestation_uid) {
    throw new Error("Model already has an attestation");
  }

  // 2. Verify manufacturer exists
  const manufacturer = await prisma.manufacturers.findUnique({
    where: { id: modelData.manufacturer_id }
  });

  if (!manufacturer) {
    throw new Error("Invalid manufacturer");
  }

  // 3. Check for duplicates (same manufacturer + name + year)
  const duplicate = await prisma.attestations.findFirst({
    where: {
      schema_type: 'model',
      attestation_data: {
        path: ['manufacturer_name'],
        equals: manufacturer.name
      },
      // ... check other fields
    }
  });

  if (duplicate) {
    throw new Error("Similar model attestation already exists");
  }

  return true;
}
```

### Signature Verification

**Verify offchain attestation signature:**

```typescript
import { EAS } from '@ethereum-attestation-service/eas-sdk';

async function verifyAttestationSignature(attestationUID: string) {
  // 1. Fetch attestation from database
  const record = await prisma.attestations.findUnique({
    where: { uid: attestationUID }
  });

  // 2. Fetch full attestation from IPFS
  const fullAttestation = await ipfsClient.get(record.ipfs_cid);

  // 3. Verify signature using EAS SDK
  const eas = new EAS(EAS_CONTRACT_ADDRESS);
  const offchain = await eas.getOffchain();

  const isValid = await offchain.verifyOffchainAttestationSignature(
    fullAttestation.uid,
    fullAttestation.sig
  );

  // 4. Verify signer matches database record
  const recoveredSigner = await offchain.getOffchainUID(fullAttestation);

  if (recoveredSigner !== record.signer_wallet) {
    throw new Error("Signer mismatch");
  }

  return isValid;
}
```

---

## Error Handling & Edge Cases

### Edge Cases

1. **Model attestation exists but manufacturer no longer exists**
   - Solution: Attestation remains valid, shows "Manufacturer Unknown" in UI

2. **Manufacturer wallet gets compromised**
   - Solution: Admin can revoke wallet, add new wallet
   - Attestations signed with old wallet remain valid but flagged

3. **IPFS CID becomes unavailable**
   - Solution: Database has full attestation_data as backup
   - Re-pin to IPFS from database data

4. **Two admins create attestation for same model simultaneously**
   - Solution: Database unique constraint on (schema_type + manufacturer + model + year)
   - Second request fails, user notified

5. **Manufacturer refuses to co-sign**
   - Solution: Attestation remains in 'pending' status
   - Community can still see data, but not marked as "official"

### Error Messages

**User-Friendly Error Messages:**

| Error Scenario | User Message |
|---------------|--------------|
| Model already has attestation | "This model already has an attestation. View attestation details [here]." |
| Wallet not authorized | "Your wallet is not authorized to co-sign attestations for this manufacturer. Contact support to register." |
| IPFS pinning failed | "Attestation created successfully but IPFS storage is temporarily unavailable. Data is safe in our database." |
| Signature verification failed | "Signature verification failed. Please check your wallet connection and try again." |
| Network error | "Unable to connect to Base network. Please check your connection and try again." |

---

## Testing Strategy

### Unit Tests

**Test Coverage:**
1. Schema encoding/decoding
2. Signature creation and verification
3. Database CRUD operations
4. IPFS pinning/retrieval

**Example Test:**
```typescript
describe('Model Attestation Creation', () => {
  it('should create valid attestation with correct schema encoding', async () => {
    const modelData = {
      manufacturer_name: "Fender",
      model_name: "Stratocaster",
      year: 1954,
      // ...
    };

    const encoded = encodeModelAttestation(modelData);
    const decoded = decodeModelAttestation(encoded);

    expect(decoded).toEqual(modelData);
  });

  it('should reject duplicate model attestations', async () => {
    await createModelAttestation(modelData, adminWallet);

    await expect(
      createModelAttestation(modelData, adminWallet)
    ).rejects.toThrow('Model already has an attestation');
  });
});
```

### Integration Tests

1. **End-to-end attestation flow**
   - Admin creates model → attestation created → stored in IPFS → database updated
   - Manufacturer co-signs → attestation updated → status changes

2. **API endpoint testing**
   - Test all endpoints with valid/invalid data
   - Authentication and authorization checks

3. **Wallet integration testing**
   - Test Dynamic.xyz wallet connection
   - Test signature generation and verification

### Manual Testing Checklist

- [ ] Create model with attestation (happy path)
- [ ] Attempt to create duplicate attestation (should fail)
- [ ] Manufacturer co-signs attestation
- [ ] View attestation details on model page
- [ ] Verify IPFS link works
- [ ] Test with multiple wallets (admin, manufacturer)
- [ ] Test error scenarios (network failure, wallet disconnect)
- [ ] Test attestation badge rendering
- [ ] Test manufacturer dashboard
- [ ] Verify attestation data integrity after retrieval from IPFS

---

## Performance Considerations

### IPFS Pinning Strategy

**Options:**

1. **Synchronous pinning (blocking)**
   - Pin to IPFS during attestation creation
   - User waits for IPFS confirmation
   - Pro: Guaranteed permanence immediately
   - Con: Slower user experience (2-5 seconds)

2. **Asynchronous pinning (non-blocking)** ⭐ Recommended
   - Create attestation, save to database immediately
   - Background job pins to IPFS
   - Update record with IPFS CID when complete
   - Pro: Fast user experience
   - Con: Brief window where data not on IPFS

**Implementation:**
```typescript
// Queue-based IPFS pinning
import { Queue } from 'bull';

const ipfsPinQueue = new Queue('ipfs-pinning');

// After creating attestation
await ipfsPinQueue.add({
  attestation_uid: attestation.uid,
  data: attestationData
});

// Worker process
ipfsPinQueue.process(async (job) => {
  const { attestation_uid, data } = job.data;

  const ipfsCID = await ipfsClient.add(JSON.stringify(data));

  await prisma.attestations.update({
    where: { uid: attestation_uid },
    data: { ipfs_cid: ipfsCID }
  });
});
```

### Database Query Optimization

**Indexes for common queries:**
```sql
-- Fast lookup by entity
CREATE INDEX idx_attestations_entity ON attestations(entity_type, entity_id);

-- Fast manufacturer dashboard queries
CREATE INDEX idx_attestations_pending_manufacturer ON attestations(status, attestation_data)
WHERE status = 'pending' AND schema_type = 'model';

-- Fast JSONB searches
CREATE INDEX idx_attestations_data_gin ON attestations USING GIN (attestation_data);
```

### Caching Strategy

**Cache attestation data for frequently accessed models:**

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getAttestationWithCache(uid: string) {
  // Try cache first
  const cached = await redis.get(`attestation:${uid}`);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const attestation = await prisma.attestations.findUnique({
    where: { uid }
  });

  // Cache for 1 hour
  await redis.setex(
    `attestation:${uid}`,
    3600,
    JSON.stringify(attestation)
  );

  return attestation;
}
```

---

## Migration Plan for Existing Data

**Scope:** Only NEW models/instruments get attestations (clean start approach)

### Strategy

1. **Add database columns** to `models` and `individual_guitars` tables
2. **Existing records** have NULL attestation fields
3. **New records** automatically get attestations on creation
4. **Future feature:** "Request Attestation" button for existing records

### Database Migration Script

```sql
-- Run this migration
BEGIN;

-- Add columns with NULL default (non-breaking change)
ALTER TABLE models
ADD COLUMN IF NOT EXISTS attestation_uid VARCHAR(66),
ADD COLUMN IF NOT EXISTS ipfs_cid VARCHAR(100),
ADD COLUMN IF NOT EXISTS attestation_status VARCHAR(20);

ALTER TABLE individual_guitars
ADD COLUMN IF NOT EXISTS attestation_uid VARCHAR(66),
ADD COLUMN IF NOT EXISTS ipfs_cid VARCHAR(100),
ADD COLUMN IF NOT EXISTS attestation_status VARCHAR(20);

-- Create attestations table
CREATE TABLE IF NOT EXISTS attestations (
  -- ... (schema from earlier)
);

COMMIT;

-- After migration, update Prisma schema
-- Run: npx prisma db pull && npx prisma generate
```

### Backfill Feature (Future Phase)

**UI Feature:** "Create Attestation" button on existing models

**Workflow:**
1. Admin views existing model without attestation
2. Clicks "Create Attestation for This Model"
3. System creates attestation using current data
4. Manufacturer can co-sign as usual

---

## Monitoring & Analytics

### Metrics to Track

1. **Attestation Creation**
   - Total attestations created (by type)
   - Attestations per day/week
   - Admin vs community created

2. **Manufacturer Engagement**
   - Co-signature rate (% of attestations co-signed)
   - Average time to co-sign
   - Active manufacturer wallets

3. **IPFS Performance**
   - Pin success rate
   - Average pin time
   - IPFS retrieval success rate

4. **System Health**
   - Signature verification success rate
   - Database query performance
   - API error rates

### Logging

**Log important events:**

```typescript
// Example logging structure
logger.info('Attestation created', {
  uid: attestation.uid,
  schema_type: 'model',
  entity_id: model.id,
  signer: adminWallet.address,
  ipfs_cid: ipfsCID,
  duration_ms: Date.now() - startTime
});

logger.info('Manufacturer co-signed attestation', {
  uid: attestation.uid,
  manufacturer_wallet: manufacturerWallet.address,
  time_to_cosign_hours: (Date.now() - attestation.created_at) / 3600000
});

logger.error('IPFS pinning failed', {
  uid: attestation.uid,
  error: error.message,
  retry_count: 3
});
```

---

## Development Phases & Milestones

### Phase 1A: Model Attestations (Week 1-2)

**Deliverables:**
- [ ] Database schema updates (models table + attestations table)
- [ ] EAS schema registration on Base testnet (Sepolia)
- [ ] Server actions for model attestation creation
- [ ] IPFS integration (pinning service setup)
- [ ] Basic API endpoints (`/api/attestations/models/create`)
- [ ] Update model creation form to trigger attestation
- [ ] Display attestation UID on model detail page

**Testing:**
- [ ] Create 5 test models with attestations
- [ ] Verify IPFS pinning works
- [ ] Verify attestation data integrity

### Phase 1B: Manufacturer Co-Signing (Week 3)

**Deliverables:**
- [ ] Manufacturer wallet registration system
- [ ] Co-signing API endpoint (`/api/attestations/cosign`)
- [ ] Manufacturer dashboard page
- [ ] Co-signing UI workflow
- [ ] AttestationBadge component updates (show co-sign status)
- [ ] Email notifications for pending attestations

**Testing:**
- [ ] Register test manufacturer wallet
- [ ] Co-sign test attestations
- [ ] Verify signature validation
- [ ] Test unauthorized co-sign attempts (should fail)

### Phase 1C: UI Polish & Documentation (Week 4)

**Deliverables:**
- [ ] Attestation status indicators throughout UI
- [ ] Model detail page attestation section
- [ ] Manufacturer verification badges
- [ ] Help documentation for manufacturers
- [ ] Admin documentation
- [ ] API documentation (OpenAPI spec)

**Testing:**
- [ ] Full end-to-end user testing
- [ ] Manufacturer workflow testing
- [ ] Error scenario testing

### Phase 2A: Instrument Attestations (Week 5-6)

**Deliverables:**
- [ ] Database schema updates for individual_guitars
- [ ] EAS schema registration for instruments
- [ ] Server actions for instrument attestation creation
- [ ] API endpoints for instrument attestations
- [ ] Update guitar creation form
- [ ] Display instrument attestation with model linkage

**Testing:**
- [ ] Create instruments linked to model attestations
- [ ] Verify model → instrument chain
- [ ] Test with instruments without model attestation (should fail or warn)

### Phase 2B: Chain of Provenance Visualization (Week 7)

**Deliverables:**
- [ ] Provenance timeline component
- [ ] Visual graph showing attestation links
- [ ] "View on IPFS" and "Verify Signature" tools
- [ ] Export attestation data feature

**Testing:**
- [ ] Verify full chain visualization
- [ ] Test with complex chains (model → multiple instruments)

### Phase 3: Production Deployment (Week 8)

**Deliverables:**
- [ ] Deploy EAS schemas on Base mainnet
- [ ] Production IPFS pinning service (Pinata/Web3.Storage)
- [ ] Production database migration
- [ ] Manufacturer onboarding process
- [ ] Launch announcement and documentation

**Go-Live Checklist:**
- [ ] All tests passing
- [ ] Security audit complete
- [ ] Documentation complete
- [ ] Manufacturer wallets registered
- [ ] Monitoring/logging in place
- [ ] Backup/recovery procedures documented

---

## Dependencies & Prerequisites

### Technical Dependencies

**NPM Packages:**
```json
{
  "@ethereum-attestation-service/eas-sdk": "^2.5.0",
  "@dynamic-labs/sdk-react-core": "^2.0.0",
  "ethers": "^6.0.0",
  "ipfs-http-client": "^60.0.0",
  "pinata-sdk": "^2.1.0" // or web3.storage
}
```

### External Services

1. **IPFS Pinning Service**
   - Options: Pinata, Web3.Storage, Filebase
   - Recommended: Pinata (reliable, good API)
   - Setup: Create account, get API keys
   - Cost: ~$20/month for 1GB pinned data

2. **Base RPC Provider**
   - Options: Alchemy, Infura, QuickNode
   - Needed for: EAS contract interaction (schema registration)
   - Setup: Create account, get Base RPC URL
   - Cost: Free tier sufficient for MVP

3. **Dynamic.xyz**
   - Already in use for wallet connection
   - No additional setup needed

### EAS Schema Registration

**Prerequisite:** Register schemas on Base before deployment

**Important:** Register the Version Metadata Schema FIRST, as it will be used to track all future schema versions.

**Steps:**
1. Connect wallet with Base ETH for gas
2. Use EAS Schema Registry: https://base.easscan.org/
3. **Register `SchemaVersionMetadata_v1` schema** (FIRST - for version tracking)
4. Register `GuitarModelAttestation_v1_0_0` schema
5. Register `GuitarInstrumentAttestation_v1_0_0` schema
6. Save all schema UIDs in environment variables
7. Create version link attestations for Model and Instrument schemas

**Script to register Version Metadata Schema:**
```typescript
import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const SCHEMA_REGISTRY_ADDRESS = "0x4200000000000000000000000000000000000020"; // Base Schema Registry

async function registerVersionMetadataSchema() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const schema = "bytes32 schema_uid,string schema_name,uint8 major_version,uint8 minor_version,bytes32 previous_version_uid,bytes32 next_version_uid,string changelog,uint64 effective_date,bool deprecated";

  const tx = await schemaRegistry.register({
    schema,
    resolverAddress: "0x0000000000000000000000000000000000000000",
    revocable: true
  });

  await tx.wait();
  console.log("Version Metadata Schema registered with UID:", tx.uid);

  // Save to .env: VERSION_METADATA_SCHEMA_UID=0x...
  return tx.uid;
}
```

**Script to register Model Schema:**
```typescript
import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';

const SCHEMA_REGISTRY_ADDRESS = "0x..."; // Base schema registry

async function registerModelSchema() {
  const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
  const signer = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

  const schemaRegistry = new SchemaRegistry(SCHEMA_REGISTRY_ADDRESS);
  schemaRegistry.connect(signer);

  const schema = "string manufacturer_name,string product_line_name,string model_name,uint16 year,string db_reference_id,string production_type,string production_dates,uint32 estimated_quantity,string original_msrp,string currency,string description";

  const tx = await schemaRegistry.register({
    schema,
    resolverAddress: "0x0000000000000000000000000000000000000000", // no resolver
    revocable: true
  });

  await tx.wait();
  console.log("Schema registered with UID:", tx.uid);

  // Save to .env: MODEL_SCHEMA_UID=0x...
}
```

---

## Environment Variables

**Add to `.env.local`:**

```bash
# EAS Configuration
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021 # Base mainnet
MODEL_SCHEMA_UID=0x... # from schema registration
INSTRUMENT_SCHEMA_UID=0x... # from schema registration

# Schema Versioning
VERSION_METADATA_SCHEMA_UID=0x... # from version metadata schema registration
MODEL_SCHEMA_VERSION=1.0.0 # Current model schema version
INSTRUMENT_SCHEMA_VERSION=1.0.0 # Current instrument schema version

# Base Network
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
CHAIN_ID=8453 # Base mainnet

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret
IPFS_GATEWAY=https://gateway.pinata.cloud

# Admin Wallet (for attestation signing)
ADMIN_WALLET_ADDRESS=0x...
# Note: Private key should be in secure vault, not .env in production

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379
```

---

## Success Metrics

### MVP Success Criteria (3 Months Post-Launch)

1. **Adoption**
   - ✅ 50+ models with attestations
   - ✅ 10+ instruments with attestations
   - ✅ 5+ manufacturers with registered wallets
   - ✅ 2+ manufacturers actively co-signing

2. **System Performance**
   - ✅ 99% uptime
   - ✅ <2 second attestation creation time
   - ✅ 100% IPFS pin success rate
   - ✅ 0 signature verification failures

3. **User Engagement**
   - ✅ 80%+ manufacturer co-sign rate
   - ✅ <48 hours average time to co-sign
   - ✅ 100+ attestation detail page views

4. **Technical Quality**
   - ✅ Zero security incidents
   - ✅ All tests passing
   - ✅ <5% API error rate

### Long-term Vision (6-12 Months)

1. **Ecosystem Growth**
   - 500+ models with official attestations
   - 1000+ individual instruments tracked
   - 20+ active manufacturers
   - Integration with guitar marketplaces (link attestations in listings)

2. **Chain of Provenance**
   - Link reviews to model/instrument attestations
   - Add sale/transfer attestations
   - Add maintenance record attestations
   - Build complete instrument provenance graphs

3. **Interoperability**
   - Other apps read Guitar Registry attestations
   - Guitar Registry reads attestations from other systems
   - Become standard for guitar provenance tracking

---

## Risks & Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| IPFS pinning service downtime | High | Low | Dual storage (IPFS + PSQL), queue-based retry |
| EAS SDK breaking changes | Medium | Medium | Pin SDK version, test upgrades thoroughly |
| Wallet compromise | High | Low | Multi-sig for admin, manufacturer wallet revocation system |
| Gas price spikes (if onchain) | Low | N/A | Using offchain attestations for MVP |
| Database corruption | High | Very Low | Regular backups, IPFS as source of truth |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Manufacturers don't adopt | High | Medium | Start with friendly manufacturers, show clear value |
| Users don't understand web3 | Medium | High | Clear UI, hide complexity, "View on IPFS" is optional |
| Competing attestation standard emerges | Medium | Low | EAS is established standard, easy to migrate if needed |
| Regulatory changes around NFTs/attestations | Low | Low | Attestations are verifiable claims, not financial assets |

---

## Open Questions & Future Considerations

### Open Questions

1. **Should we allow community members to create attestations?**
   - Pro: Faster database growth
   - Con: Quality control, spam
   - Decision: Admin-only for MVP, revisit in Phase 3

2. **How to handle model variations (e.g., 1959 Les Paul Standard with different finishes)?**
   - Option A: Separate attestation for each finish
   - Option B: Single attestation with "variations" field
   - Decision: TBD based on user feedback

3. **Should attestation schema be upgradeable?**
   - Pro: Can add fields later
   - Con: Versioning complexity
   - Decision: Use version suffix in schema name (v1, v2), create new schemas for major changes

### Future Features

1. **Attestation Marketplace**
   - Allow buying/selling of instruments with attestation-verified provenance
   - Premium for manufacturer-verified instruments

2. **Certificate of Authenticity Generation**
   - PDF/physical certificate linked to attestation
   - QR code scans to verify on-chain

3. **Manufacturer Reputation Score**
   - Based on co-sign rate and speed
   - Displayed on manufacturer pages

4. **Cross-Platform Attestation Sharing**
   - Export attestations to Reverb, eBay, etc.
   - Read attestations from other guitar registries

5. **Model Attestations with Community Voting**
   - Community can propose models
   - Voting system for approval
   - Manufacturer verification adds "official" status

6. **On-Chain Attestations for High-Value Instruments**
   - Hybrid: Model attestations off-chain, legendary instruments on-chain
   - Gas cost justified for $100k+ guitars

---

## Appendix

### Glossary

- **Attestation:** A cryptographically signed claim about an entity (model, instrument, review)
- **EAS:** Ethereum Attestation Service, a protocol for creating verifiable attestations
- **Schema:** The structure/format of attestation data (defined via EAS Schema Registry)
- **UID:** Unique Identifier for an attestation (Keccak256 hash)
- **Offchain Attestation:** Signed message stored off blockchain (IPFS, database)
- **Onchain Attestation:** Attestation stored in EAS smart contract on blockchain
- **IPFS CID:** Content Identifier on InterPlanetary File System (e.g., QmX123...)
- **Co-signing:** Manufacturer adds signature to admin-created attestation for verification
- **Chain of Provenance:** Linked attestations showing history of an instrument

### References

- EAS Documentation: https://docs.attest.org/
- Base Network: https://base.org/
- IPFS: https://ipfs.io/
- Dynamic.xyz: https://www.dynamic.xyz/
- Prisma ORM: https://www.prisma.io/

### Schema Examples

**Example Model Attestation (JSON):**
```json
{
  "uid": "0xabc123...",
  "schema": "0xschema123...",
  "refUID": "0x0000000000000000000000000000000000000000000000000000000000000000",
  "time": 1699564800,
  "expirationTime": 0,
  "revocationTime": 0,
  "recipient": "0x0000000000000000000000000000000000000000",
  "attester": "0xadmin123...",
  "revocable": true,
  "data": "0x...", // encoded data
  "sig": {
    "domain": { /* EIP-712 domain */ },
    "message": { /* attestation message */ },
    "signature": "0x..."
  }
}
```

**Decoded Model Attestation Data:**
```json
{
  "manufacturer_name": "Fender",
  "product_line_name": "American Vintage Series",
  "model_name": "Stratocaster",
  "year": 1954,
  "db_reference_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "production_type": "mass",
  "production_dates": "1954-01-01/1954-12-31",
  "estimated_quantity": 500,
  "original_msrp": "249.50",
  "currency": "USD",
  "description": "First year of Stratocaster production. Revolutionary design with contoured body, three single-coil pickups, and synchronized tremolo."
}
```

**Example Instrument Attestation (JSON):**
```json
{
  "model_attestation_uid": "0xabc123...",
  "serial_number": "001234",
  "db_reference_id": "a1b2c3d4-...",
  "production_date": "1959-03-15",
  "production_number": 42,
  "significance_level": "legendary",
  "current_condition": "excellent",
  "modifications": "None - all original",
  "provenance_summary": "Owned by Eric Clapton 1967-1975. Used on 'Layla' recording."
}
```

---

## Next Steps & Action Items

### Immediate Actions (This Week)

1. **Review & Approve PRD**
   - [ ] Stakeholder review of this PRD
   - [ ] Technical team review
   - [ ] Finalize scope and timeline

2. **Setup Development Environment**
   - [ ] Create Base testnet account (Sepolia)
   - [ ] Get testnet ETH from faucet
   - [ ] Setup Pinata account for IPFS
   - [ ] Install EAS SDK in project

3. **Schema Registration**
   - [ ] Register model attestation schema on Base Sepolia
   - [ ] Register instrument attestation schema on Base Sepolia
   - [ ] Document schema UIDs

### Week 1 Kickoff Tasks

1. **Database Migration**
   - [ ] Write SQL migration script
   - [ ] Test on local database
   - [ ] Run Prisma db pull and generate
   - [ ] Update Prisma schema with new tables

2. **EAS Integration POC**
   - [ ] Create sample attestation in test script
   - [ ] Verify signature validation works
   - [ ] Test IPFS pinning
   - [ ] Document integration patterns

3. **Project Setup**
   - [ ] Create feature branch `feature/eas-model-attestations`
   - [ ] Setup environment variables
   - [ ] Create API route structure
   - [ ] Setup server actions files

### Questions for Discussion

1. Which manufacturer(s) should we partner with for MVP testing?
2. What's the priority for co-signing: speed or security review depth?
3. Should we build the manufacturer dashboard first or focus on admin workflow?
4. Do we need legal review of attestation content/language?
5. Timeline: Can we commit to 8-week delivery or adjust scope?

---

**Document Status:** Ready for Review
**Next Review Date:** 2025-11-17
**Owner:** [Product Owner Name]
**Contributors:** [Engineering Lead], [Technical Architect]

---

*This PRD is a living document and will be updated as requirements evolve and implementation progresses.*
