# EAS Python SDK Review & Recommendations

**Date:** 2025-11-18  
**Purpose:** Evaluate Python options for EAS schema registration and attestation creation

---

## Current Finding: `eas-sdk` Python Package

### What You Found
- **Buf Schema Registry:** `buf.build/cyberstorm/eas` - Contains protobuf/gRPC schema definitions
- **PyPI Package:** `eas-sdk` - Python SDK for Ethereum Attestation Service
- **Repository:** Appears to be maintained by "cyberstorm" organization

### Package Details
- **Package Name:** `eas-sdk`
- **PyPI:** https://pypi.org/project/eas-sdk/
- **Latest Version:** 0.1.6 (as of search results)
- **Features:**
  - Multi-chain support (Ethereum, Base, Sepolia)
  - On-chain and off-chain attestations
  - Schema registration
  - Batch operations
  - GraphQL to protobuf conversion

### Concerns & Unknowns

1. **Maintenance Status:** 
   - Conflicting information about whether it's actively maintained
   - Latest version 0.1.6 may be from 2024 (some sources suggest it's not actively maintained)
   - Need to verify: GitHub repository activity, recent commits, issue resolution

2. **Official vs Community:**
   - Not the official EAS SDK (official is TypeScript/JavaScript)
   - Third-party Python implementation
   - May lag behind official SDK features

3. **Documentation Quality:**
   - Need to verify completeness and accuracy
   - May not have same level of support as official SDK

---

## Evaluation of Options

### Option 1: Use Python `eas-sdk` Package ⚠️

**Pros:**
- ✅ Native Python implementation
- ✅ No need to call external APIs
- ✅ Direct blockchain interaction
- ✅ Supports schema registration and attestation creation

**Cons:**
- ⚠️ Third-party package (not official)
- ⚠️ Maintenance status unclear
- ⚠️ May lag behind official SDK features
- ⚠️ Less community support than official SDK
- ⚠️ Potential security/audit concerns

**Recommendation:** 
- **Use with caution** - Verify maintenance status first
- Check GitHub repository for recent activity
- Test thoroughly before production use
- Consider as temporary solution while evaluating alternatives

**Action Items:**
1. Check GitHub repository: `https://github.com/cyberstorm/eas-sdk` (or similar)
2. Review recent commits and issue resolution
3. Test schema registration on testnet
4. Verify compatibility with Base network

---

### Option 2: Use EAS API (REST/GraphQL) ✅ **RECOMMENDED**

**Pros:**
- ✅ Language-agnostic (works from Python)
- ✅ Official EAS infrastructure
- ✅ Always up-to-date with latest features
- ✅ No SDK maintenance concerns
- ✅ Well-documented (if available)

**Cons:**
- ⚠️ Need to verify API availability and endpoints
- ⚠️ May require API keys/authentication
- ⚠️ Network dependency (API must be available)

**EAS API Endpoints to Investigate:**
- **GraphQL API:** EAS likely provides GraphQL endpoints for querying
- **REST API:** May have REST endpoints for schema registration
- **Documentation:** Check `attest.org` or `docs.attest.org` for API docs

**Implementation Approach:**
```python
# Python API
import requests

def register_schema_via_api(schema_definition: str):
    """Register schema using EAS API"""
    response = requests.post(
        'https://api.attest.org/v1/schemas/register',  # Verify endpoint
        json={
            'schema': schema_definition,
            'chain': 'base-sepolia'
        },
        headers={'Authorization': f'Bearer {API_KEY}'}
    )
    return response.json()['schema_uid']
```

**Action Items:**
1. Check official EAS documentation for API endpoints
2. Verify if schema registration is available via API
3. Test API availability and rate limits
4. Document authentication requirements

---

### Option 3: Manual Registration via EAS UI ⚠️

**Pros:**
- ✅ No code required
- ✅ Official EAS interface
- ✅ Good for initial setup/testing

**Cons:**
- ❌ Not suitable for automation
- ❌ Manual process (error-prone)
- ❌ Can't integrate into Python data ingestion workflow
- ❌ Not scalable

**Recommendation:**
- **Use only for:** Initial schema registration (one-time setup)
- **Not suitable for:** Automated schema versioning or production workflows

**When to Use:**
- Register initial schemas (v1.0.0) before Phase 1A
- Testing schema definitions
- One-off schema registrations

---

### Option 4: Use TypeScript SDK via Python Subprocess/API ✅ **RECOMMENDED**

**Pros:**
- ✅ Official EAS SDK (most reliable)
- ✅ Actively maintained by EAS team
- ✅ Full feature support
- ✅ Well-documented and tested
- ✅ Can be called from Python

**Cons:**
- ⚠️ Requires Node.js runtime
- ⚠️ Additional dependency
- ⚠️ Slight complexity in calling from Python

**Implementation Approaches:**

#### Approach A: Python calls Node.js script
```python
# Python API
import subprocess
import json

def register_schema_via_nodejs(schema_definition: str):
    """Call TypeScript SDK via Node.js script"""
    result = subprocess.run(
        ['node', 'scripts/register-schema.js', schema_definition],
        capture_output=True,
        text=True
    )
    return json.loads(result.stdout)['schema_uid']
```

```javascript
// scripts/register-schema.js (Node.js)
const { SchemaRegistry } = require('@ethereum-attestation-service/eas-sdk');
const { ethers } = require('ethers');

const schemaDefinition = process.argv[2];
// ... register schema using official SDK
console.log(JSON.stringify({ schema_uid: schemaUID }));
```

#### Approach B: Python calls Next.js API endpoint
```python
# Python API
import requests

def register_schema_via_nextjs_api(schema_definition: str):
    """Call Next.js API endpoint that uses TypeScript SDK"""
    response = requests.post(
        'http://nextjs-app:3000/api/eas/schemas/register',
        json={'schema': schema_definition},
        headers={'X-API-Key': API_KEY}
    )
    return response.json()['schema_uid']
```

```typescript
// Next.js App - src/app/api/eas/schemas/register/route.ts
import { SchemaRegistry } from '@ethereum-attestation-service/eas-sdk';

export async function POST(req: Request) {
  // Use official TypeScript SDK
  // Register schema
  // Return schema_uid
}
```

**Recommendation:**
- **Best approach:** Python calls Next.js API endpoint (Approach B)
- Aligns with architecture separation document
- Keeps EAS SDK logic in one place (Next.js)
- Python remains focused on data layer

---

## Recommended Solution: Hybrid Approach

### For Schema Registration (Infrequent, Admin Operation)

**Primary:** Use Next.js API endpoint with TypeScript SDK
- Python calls Next.js API when registering schemas
- Next.js uses official TypeScript SDK
- Single source of truth for EAS SDK logic

**Fallback:** Manual registration via EAS UI for initial setup
- Register v1.0.0 schemas manually
- Store schema UIDs in environment variables
- Use API for future schema versions

### For Attestation Creation (Frequent, User-Triggered)

**Primary:** Next.js handles all attestation creation
- User-created attestations: Direct from Next.js UI
- Data ingestion attestations: Python calls Next.js API
- All use official TypeScript SDK

---

## Decision Matrix

| Option | Maintenance | Official | Automation | Complexity | Recommendation |
|--------|------------|----------|------------|------------|----------------|
| Python `eas-sdk` | ⚠️ Unknown | ❌ No | ✅ Yes | ✅ Low | ⚠️ Verify first |
| EAS API | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Low | ✅ **Best if available** |
| Manual UI | N/A | ✅ Yes | ❌ No | ✅ None | ⚠️ One-time only |
| TypeScript SDK (via API) | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Medium | ✅ **Recommended** |

---

## Action Plan

### Immediate Steps

1. **Verify Python `eas-sdk` Status:**
   ```bash
   # Check GitHub repository
   # Review recent commits, issues, PRs
   # Test on Base Sepolia testnet
   ```

2. **Check EAS API Availability:**
   - Visit `docs.attest.org` or `attest.org/docs`
   - Look for API documentation
   - Check for schema registration endpoints
   - Verify authentication requirements

3. **Test TypeScript SDK Approach:**
   - Create Next.js API endpoint for schema registration
   - Test from Python (call API)
   - Verify it works end-to-end

### Decision Criteria

**Choose Python `eas-sdk` if:**
- ✅ Repository is actively maintained (commits in last 3 months)
- ✅ Issues are being resolved
- ✅ Works correctly on Base network
- ✅ Documentation is adequate

**Choose EAS API if:**
- ✅ Official API endpoints exist for schema registration
- ✅ API is well-documented
- ✅ No rate limiting concerns
- ✅ Authentication is straightforward

**Choose TypeScript SDK (via Next.js API) if:**
- ✅ Python `eas-sdk` is not maintained
- ✅ EAS API doesn't support schema registration
- ✅ You want to use official SDK
- ✅ You're comfortable with Python → Next.js API calls

---

## Recommended Next Steps

1. **Week 1: Research Phase**
   - [ ] Check `eas-sdk` GitHub repository status
   - [ ] Review EAS official documentation for API
   - [ ] Test Python `eas-sdk` on Base Sepolia (if available)
   - [ ] Create proof-of-concept with TypeScript SDK approach

2. **Week 2: Decision & Implementation**
   - [ ] Make decision based on research
   - [ ] Implement chosen approach
   - [ ] Register initial schemas (v1.0.0)
   - [ ] Document process

3. **Integration**
   - [ ] Integrate into Python data ingestion workflow
   - [ ] Test end-to-end schema registration
   - [ ] Update architecture documentation

---

## Questions to Answer

1. **Python `eas-sdk`:**
   - What is the GitHub repository URL?
   - When was the last commit?
   - Are issues being resolved?
   - Does it work on Base network?

2. **EAS API:**
   - Does EAS provide REST/GraphQL API for schema registration?
   - What are the endpoint URLs?
   - What authentication is required?
   - Are there rate limits?

3. **TypeScript SDK:**
   - Are we comfortable with Python calling Next.js API?
   - Should we create a dedicated microservice for EAS operations?
   - How do we handle API authentication between services?

---

**Document Version:** 1.0  
**Status:** Research & Evaluation Phase

