# Admin Wallet Registration Workflow - Planned vs Current

## Documented Plan (from `PRD/pending-admin.md`)

### Current Status
- **Current Implementation:** Admin must connect the manufacturer's wallet using MetaMask (requires private key access)
- **Status:** "This is a shortcut but needs to be replaced."

### Planned Workflow

#### Admin Side
1. **Admin routes need to be protected** - Only accessible to authenticated admins
2. **Admin manually enters wallet address** - Simple text input form (no wallet connection required)
3. **Admin gets a shareable link** - Generated link to send to manufacturer
4. **Only admins can add wallets** - Authorization check for MVP

#### Manufacturer Side
1. **Receives link** - From admin
2. **Connects their wallet** - Using MetaMask/browser extension
3. **Signs verification message** - Proves wallet ownership
4. **Completes registration** - Wallet is now registered and can co-sign attestations

---

## Current Implementation Gaps

### ❌ What's Missing

1. **Admin Authentication/Authorization**
   - No protection on `/admin/*` routes
   - No middleware checking admin status
   - API endpoints are publicly accessible

2. **Admin Form for Manual Entry**
   - Current form requires wallet connection (`window.ethereum`)
   - Should have simple text input for wallet address
   - No signature required from admin

3. **Shareable Link System**
   - No link generation mechanism
   - No token/verification system for links
   - No separate manufacturer-facing registration page

4. **Two-Step Registration Process**
   - Currently: Admin connects wallet → signs → registers (all in one step)
   - Should be: Admin enters address → generates link → Manufacturer completes registration

### ✅ What Exists

1. **Wallet Registration API** - `/api/manufacturers/wallets`
   - Supports signature verification
   - Creates wallet records in database
   - Validates manufacturer exists

2. **Wallet Verification System**
   - Message signing for ownership proof
   - Nonce generation for security
   - Signature validation using ethers.js

3. **Database Schema**
   - `manufacturer_wallets` table with all necessary fields
   - Status tracking (active/inactive)
   - Notes and registration metadata

---

## Required Implementation

### Phase 1: Admin Authentication
- [ ] Implement authentication middleware for `/admin/*` routes
- [ ] Add admin role check (likely using `users.user_type` field)
- [ ] Protect API endpoints with authorization checks

### Phase 2: Admin Form Redesign
- [ ] Replace wallet connection flow with simple text input
- [ ] Add wallet address validation (checksum, format)
- [ ] Create "pending" registration state in database
- [ ] Generate unique registration token/link

### Phase 3: Shareable Link System
- [ ] Create registration token/ID system
- [ ] Build manufacturer-facing registration page (e.g., `/register-wallet/[token]`)
- [ ] Link validation and expiration logic
- [ ] Display manufacturer info on registration page

### Phase 4: Manufacturer Completion Flow
- [ ] Manufacturer connects wallet on registration page
- [ ] Get verification message for their wallet address
- [ ] Sign message to prove ownership
- [ ] Complete registration (move from pending to active)

---

## Database Schema Considerations

### Current Schema
The `manufacturer_wallets` table has:
- `status` field (could be used for 'pending' state)
- `registered_by` field (tracks who initiated registration)
- `notes` field (could store registration token)

### Potential Additions
May need to add:
- `registration_token` - Unique token for shareable link
- `registration_expires_at` - Link expiration timestamp
- `pending_wallet_address` - Store address before verification (if different from final)

Or create separate `wallet_registration_requests` table:
- `id` (UUID)
- `manufacturer_id`
- `wallet_address` (pending)
- `registration_token` (unique)
- `created_by` (admin user ID)
- `expires_at`
- `status` ('pending', 'completed', 'expired')
- `completed_at`
- `completed_by_wallet` (final verified wallet address)

---

## API Changes Needed

### New Endpoints

1. **POST `/api/admin/manufacturers/[id]/wallets/initiate`**
   - Admin-only endpoint
   - Takes wallet address (text input)
   - Creates pending registration
   - Returns shareable link/token

2. **GET `/api/wallet-registration/[token]`**
   - Public endpoint (no auth required)
   - Returns manufacturer info and pending wallet address
   - Validates token and expiration

3. **POST `/api/wallet-registration/[token]/complete`**
   - Public endpoint
   - Takes signature from manufacturer
   - Completes registration
   - Moves from pending to active

### Modified Endpoints

1. **POST `/api/manufacturers/wallets`**
   - Add admin authorization check
   - Support both direct registration (admin) and token-based (manufacturer)

---

## Security Considerations

1. **Registration Token Security**
   - Use cryptographically secure random tokens
   - Set reasonable expiration (e.g., 7 days)
   - One-time use tokens (invalidate after completion)

2. **Admin Authorization**
   - Verify user is authenticated
   - Verify user has admin role (`user_type === 'admin'`)
   - Log all admin wallet registration actions

3. **Manufacturer Verification**
   - Signature must match the wallet address in the registration request
   - Prevent replay attacks (nonce system already in place)
   - Validate manufacturer_id matches token

---

## Related Files

- **PRD:** `PRD/pending-admin.md` - Main specification
- **Current Form:** `src/app/admin/manufacturers/[id]/wallets/wallet-registration-form.tsx`
- **API Route:** `src/app/api/manufacturers/wallets/route.ts`
- **Server Actions:** `src/lib/actions/manufacturer-wallets.ts`
- **Database Schema:** `prisma/schema.prisma` (see `manufacturer_wallets` model)

---

## Next Steps

1. Review this document and confirm the planned workflow
2. Create Linear tickets for each phase
3. Implement Phase 1 (Admin Authentication) first
4. Then implement Phase 2-4 (Admin Form + Shareable Links)
