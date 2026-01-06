# EAS Architecture: Separation of Responsibilities

**Purpose:** Define which EAS-related functionality belongs in the Python API vs Next.js app, based on separation of concerns and existing architecture patterns.

**Date:** 2025-11-18

---

## Current Architecture Overview

### Python API + PostgreSQL
- **Primary Role:** Data layer, schema management, data ingestion
- **Responsibilities:**
  - Database schema definition and migrations
  - Data validation and business logic
  - Data ingestion from external sources
  - Core registry data management

### Next.js App
- **Primary Role:** Presentation layer, user interactions
- **Responsibilities:**
  - UI/UX for String Authority
  - User-facing features and workflows
  - Server actions for UI-driven operations
  - API routes for abstraction between client side code and data models

---

## Recommended Separation of EAS Responsibilities

### ✅ **Python API Should Handle:**

#### 1. **EAS Schema Registration & Management**
**Rationale:** Schema registration is infrastructure-level, similar to database migrations. It's a rare, admin-only operation that should be coordinated with database schema changes.

**Responsibilities:**
- Register new EAS schemas on blockchain
- Register schema version updates
- Create version link attestations (using Version Metadata Schema)
- Store schema metadata in `schema_versions` table
- Manage schema lifecycle (deprecation, version chains)

**Implementation:**
```python
# Python API
# scripts/register_eas_schemas.py

def register_model_schema_v1():
    """Register initial Model Attestation schema on EAS"""
    # Use web3.py or similar Python library
    # Register schema on blockchain
    # Store schema_uid in database schema_versions table
    pass

def register_schema_version_update(schema_name, new_version, changelog):
    """Register new schema version and create version link attestation"""
    # Register new schema
    # Create version link attestation
    # Update schema_versions table with version chain
    pass
```

**Benefits:**
- Single source of truth for schema definitions
- Schema changes coordinated with database migrations
- Versioning logic centralized
- Admin operations isolated from user-facing app

---

#### 2. **Schema Version Registry Management**
**Rationale:** The `schema_versions` table is part of the database schema, so Python (which manages the database) should manage this data.

**Responsibilities:**
- CRUD operations on `schema_versions` table
- Query schema version chains
- Determine current active schema version
- Validate schema version compatibility

**Implementation:**
```python
# Python API
# lib/eas/schema_versions.py

def get_current_schema_version(schema_name: str) -> SchemaVersion:
    """Get current active schema version for a schema name"""
    pass

def get_schema_version_chain(schema_name: str) -> List[SchemaVersion]:
    """Get full version chain (v1.0.0 → v1.1.0 → v2.0.0)"""
    pass

def register_schema_version(schema_name, version, schema_uid, changelog):
    """Add new schema version to registry"""
    pass
```

**API Endpoint (Optional):**
```python
# Python API
# GET /api/v1/eas/schemas/{schema_name}/versions
# Returns: List of schema versions with metadata
```

---

#### 3. **Data Ingestion with Attestation Creation**
**Rationale:** If Python ingests data (e.g., from external sources), it should also create attestations for that data to maintain consistency.

**Responsibilities:**
- When Python creates/updates models via data ingestion, optionally create attestations
- Ensure data integrity between database records and attestations
- Batch attestation creation for bulk imports

**Implementation:**
```python
# Python API
# lib/eas/attestation_creation.py

def create_model_attestation_for_ingested_data(model_id: str):
    """Create attestation when model is ingested via Python API"""
    # Fetch model data
    # Encode attestation data
    # Create offchain attestation (or call Next.js API)
    # Store attestation record in database
    pass
```

**Note:** Python could either:
- **Option A:** Call Next.js API endpoint to create attestation (keeps EAS SDK in one place)
- **Option B:** Use Python EAS SDK (web3.py + EAS contract interactions) directly

**Recommendation:** Option A (call Next.js API) to avoid duplicating EAS SDK logic.

---

### ✅ **Next.js App Should Handle:**

#### 1. **Attestation Creation (User-Triggered)**
**Rationale:** Attestation creation is a user-facing workflow triggered from the UI. The Next.js app already handles user interactions and has the EAS SDK (JavaScript/TypeScript).

**Responsibilities:**
- Create attestations when users create models via UI
- Create attestations when users request attestation for existing models
- Handle attestation creation workflow (encode data, sign, pin to IPFS)
- Store attestation records in database

**Implementation:**
```typescript
// Next.js App
// src/lib/actions/attestations.ts

export async function createModelAttestationAction(modelId: string) {
  // 1. Fetch model data from database
  // 2. Encode attestation data using EAS SDK
  // 3. Create offchain attestation
  // 4. Pin to IPFS
  // 5. Store in database (attestations table + update models table)
  // 6. Return attestation UID
}
```

**API Endpoint (for Python to call):**
```typescript
// Next.js App
// src/app/api/attestations/models/create/route.ts

export async function POST(req: Request) {
  // Accept model_id from Python API
  // Create attestation
  // Return attestation UID and IPFS CID
}
```

---

#### 2. **Attestation Display & UI**
**Rationale:** UI components and user-facing features belong in the Next.js app.

**Responsibilities:**
- Display attestation badges and status
- Show attestation UIDs, IPFS links
- Display provenance chains
- Manufacturer co-signing UI workflow
- Attestation verification UI

**Implementation:**
```typescript
// Next.js App
// src/components/attestations/AttestationBadge.tsx
// src/app/models/[id]/page.tsx (attestation section)
```

---

#### 3. **Co-Signing Workflow**
**Rationale:** Co-signing is a user-facing workflow where manufacturers interact with the UI.

**Responsibilities:**
- Manufacturer wallet connection/verification
- Co-signing API endpoint
- Co-signing UI (manufacturer dashboard)
- Signature verification

**Implementation:**
```typescript
// Next.js App
// src/app/api/attestations/cosign/route.ts
// src/app/dashboard/manufacturer/page.tsx
```

---

#### 4. **IPFS Pinning**
**Rationale:** IPFS pinning is part of the attestation creation workflow, which is user-triggered.

**Responsibilities:**
- Pin attestations to IPFS (Pinata)
- Handle IPFS pinning failures and retries
- Queue-based async pinning (if needed)

**Implementation:**
```typescript
// Next.js App
// src/lib/ipfs/pinning.ts
```

---

#### 5. **Attestation Verification & Querying**
**Rationale:** Verification and querying are needed for UI display and user interactions.

**Responsibilities:**
- Verify attestation signatures
- Query attestations by UID
- Query attestations by entity (model, instrument)
- Decode attestation data for display

**Implementation:**
```typescript
// Next.js App
// src/lib/eas/verification.ts
// src/lib/data/attestations.ts
```

---

### 🔄 **Shared Responsibilities:**

#### 1. **Attestation Storage in Database**
**Both systems write to the same tables, but for different purposes:**

- **Python API:** Writes attestation records when ingesting data
- **Next.js App:** Writes attestation records when users create attestations via UI

**Coordination:**
- Both use the same database schema (defined by Python)
- Both follow the same data structure conventions
- Consider using Next.js API endpoint from Python to ensure consistency

---

#### 2. **Schema Version Lookup**
**Both systems need to know which schema version to use:**

- **Python API:** Provides schema version registry (source of truth)
- **Next.js App:** Queries schema version to determine which encoder/decoder to use

**Coordination:**
- Next.js can query Python API for current schema version
- Or: Next.js reads from `schema_versions` table directly (if shared database)
- Or: Schema version stored in environment variable (simpler, but less flexible)

**Recommendation:** Next.js reads from `schema_versions` table directly (shared database access).

---

## Detailed Workflow Examples

### Workflow 1: Schema Registration (Admin Operation)

```
1. Admin decides to update Model schema (add new fields)
2. Python API: Register new schema v2.0.0 on blockchain
3. Python API: Create version link attestation
4. Python API: Update schema_versions table
5. Python API: Update environment variables (or config)
6. Next.js: Reads new schema version from database on next attestation creation
```

**Who does what:**
- **Python API:** Steps 2-5 (schema registration, versioning, database updates)
- **Next.js:** Step 6 (reads schema version when needed)

---

### Workflow 2: User Creates Model with Attestation (UI)

```
1. User fills out model creation form in Next.js UI
2. Next.js: Create model record in database
3. Next.js: Create attestation (encode data, sign, pin to IPFS)
4. Next.js: Store attestation in database (attestations table)
5. Next.js: Update model record with attestation_uid
6. Next.js: Display attestation badge on model page
```

**Who does what:**
- **Next.js:** All steps (user-facing workflow)

---

### Workflow 3: Data Ingestion with Attestation (Python API)

```
1. Python API: Ingests model data from external source
2. Python API: Creates model record in database
3. Python API: Calls Next.js API endpoint to create attestation
   POST /api/attestations/models/create
   { model_id: "..." }
4. Next.js: Creates attestation (same logic as Workflow 2)
5. Next.js: Returns attestation_uid to Python API
6. Python API: Updates model record with attestation_uid (optional, Next.js already did this)
```

**Who does what:**
- **Python API:** Steps 1-2, 3 (initiates), 6 (optional)
- **Next.js:** Steps 4-5 (attestation creation)

**Alternative:** Python could create attestations directly, but this duplicates EAS SDK logic.

---

### Workflow 4: Manufacturer Co-Signs Attestation

```
1. Manufacturer logs into Next.js dashboard
2. Next.js: Displays pending attestations for manufacturer
3. Manufacturer clicks "Co-Sign" button
4. Next.js: Prompts for wallet signature
5. Next.js: Verifies signature
6. Next.js: Updates attestation record (cosigner_wallet, cosigned_at, status='official')
7. Next.js: Updates model record (cosigner_wallet, cosigned_at, attestation_status='official')
```

**Who does what:**
- **Next.js:** All steps (user-facing workflow)

---

## API Contract Between Systems

### Next.js API Endpoints (for Python to call)

```typescript
// POST /api/attestations/models/create
// Called by Python API when ingesting data
Request: {
  model_id: string;
  // Optional: schema_version (defaults to current active version)
}
Response: {
  success: boolean;
  attestation_uid: string;
  ipfs_cid: string;
  schema_version: string;
}

// GET /api/attestations/models/{model_id}
// Query attestation for a model
Response: {
  attestation_uid: string;
  status: 'pending' | 'official' | 'revoked';
  schema_version: string;
  // ... other attestation data
}
```

### Python API Endpoints (for Next.js to query)

```python
# GET /api/v1/eas/schemas/{schema_name}/current
# Get current active schema version
Response: {
  schema_name: "GuitarModelAttestation",
  version: "1.0.0",
  schema_uid: "0x...",
  definition: "string manufacturer_name,..."
}

# GET /api/v1/eas/schemas/{schema_name}/versions
# Get all versions of a schema
Response: {
  versions: [
    {
      version: "1.0.0",
      schema_uid: "0x...",
      status: "active",
      effective_date: "2025-01-01T00:00:00Z"
    },
    {
      version: "2.0.0",
      schema_uid: "0x...",
      status: "active",
      effective_date: "2025-06-01T00:00:00Z"
    }
  ]
}
```

**Alternative:** Next.js reads directly from `schema_versions` table (simpler, no API needed).

---

## Decision Matrix

| Functionality | Python API | Next.js App | Rationale |
|--------------|------------|-------------|-----------|
| **Schema Registration** | ✅ | ❌ | Infrastructure-level, rare operation |
| **Schema Version Registry** | ✅ | ❌ | Database management responsibility |
| **Schema Version Lookup** | ✅ (source) | ✅ (consumer) | Python provides, Next.js consumes |
| **Attestation Creation (UI)** | ❌ | ✅ | User-facing workflow |
| **Attestation Creation (Ingestion)** | ✅ (initiates) | ✅ (executes) | Python calls Next.js API |
| **Attestation Storage** | ✅ (via API) | ✅ (direct) | Both write, Next.js is source of truth for creation |
| **IPFS Pinning** | ❌ | ✅ | Part of attestation creation workflow |
| **Co-Signing** | ❌ | ✅ | User-facing workflow |
| **Attestation Display** | ❌ | ✅ | UI responsibility |
| **Attestation Verification** | ❌ | ✅ | Needed for UI display |

---

## Recommended Implementation Order

### Phase 1: Foundation (Python API)
1. ✅ Create database migration (already done)
2. ✅ Python: Schema registration scripts
3. ✅ Python: Schema version registry management
4. ✅ Python: Register initial schemas (v1.0.0)

### Phase 2: Attestation Creation (Next.js)
1. ✅ Next.js: Install EAS SDK
2. ✅ Next.js: Attestation creation logic
3. ✅ Next.js: IPFS pinning
4. ✅ Next.js: API endpoint for Python to call
5. ✅ Next.js: UI for user-created attestations

### Phase 3: Integration
1. ✅ Python: Call Next.js API when ingesting data
2. ✅ Next.js: Query schema versions from database
3. ✅ Test end-to-end workflows

### Phase 4: Co-Signing (Next.js)
1. ✅ Next.js: Manufacturer wallet registration
2. ✅ Next.js: Co-signing API and UI
3. ✅ Next.js: Manufacturer dashboard

---

## Key Benefits of This Separation

1. **Single Source of Truth:** Python manages schemas (like database schemas), Next.js consumes them
2. **No Duplication:** EAS SDK logic lives in one place (Next.js)
3. **Clear Boundaries:** Infrastructure (Python) vs User Experience (Next.js)
4. **Flexibility:** Python can create attestations via API, or Next.js can create them directly
5. **Maintainability:** Schema changes coordinated with database migrations

---

## Open Questions

1. **EAS SDK in Python?** Should Python have its own EAS SDK implementation, or always call Next.js API?
   - **Recommendation:** Call Next.js API to avoid duplication

2. **Schema Version Storage:** Environment variables vs Database?
   - **Recommendation:** Database (more flexible, supports version chains)

3. **Error Handling:** What if Next.js API is down when Python tries to create attestation?
   - **Recommendation:** Queue retry mechanism in Python, or make attestation creation optional for ingestion

4. **Authentication:** How does Python authenticate to Next.js API?
   - **Recommendation:** API key or service-to-service authentication

---

**Document Version:** 1.0  
**Status:** Recommendation for Review

