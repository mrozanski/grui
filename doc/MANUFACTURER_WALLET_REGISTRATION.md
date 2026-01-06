# Manufacturer Wallet Registration Guide

This guide explains how to register a manufacturer's wallet address so it can co-sign attestations. There are three methods available:

1. **UI Method** (Recommended for normal use)
2. **API Method** (Using curl - useful for testing/automation)
3. **Direct Database Method** (Quick testing only - bypasses signature verification)

---

## ⚠️ SECURITY WARNING

**The wallet registration endpoints are currently UNPROTECTED and publicly accessible.**

- **Current Status:** The admin routes (`/admin/manufacturers/[id]/wallets`) and API endpoints (`/api/manufacturers/wallets`) have no authentication or authorization checks.
- **Risk:** Anyone who discovers these endpoints can register wallets for any manufacturer.
- **Planned Fix:** According to `PRD/pending-admin.md`, admin routes need to be protected and only accessible to admins. This is documented as a temporary shortcut that needs to be replaced.
- **For Production:** Do NOT deploy this to a public environment without implementing authentication/authorization first.

See `PRD/pending-admin.md` for the planned security implementation.

---

## Prerequisites

- A manufacturer must exist in the database
- You need the manufacturer's UUID (ID)
- For UI/API methods: You need access to the wallet's private key or MetaMask

---

## Method 1: UI Registration (Recommended)

### Step 1: Navigate to Admin Wallet Management

Visit the admin wallet management page for a specific manufacturer:

```
http://localhost:3000/admin/manufacturers/{manufacturer_id}/wallets
```

Replace `{manufacturer_id}` with the actual manufacturer UUID.

### Step 2: Connect Your Wallet

1. Click the **"Connect Wallet"** button
2. Approve the connection in MetaMask (or your Web3 wallet)
3. The wallet address will be automatically detected

### Step 3: Sign Verification Message

1. Review the verification message displayed
2. Click **"Sign & Register"**
3. Approve the signature request in MetaMask
4. The wallet will be registered automatically

### Step 4: Verify Registration

After registration, the wallet will appear in the "Registered Wallets" list below the form.

---

## Method 2: API Registration (Using curl)

This method requires two API calls:
1. Get a verification message to sign
2. Register the wallet with the signature

### Step 1: Get Manufacturer ID

First, you need the manufacturer's UUID. You can find it by:
- Checking the database directly
- Looking at the URL when viewing a manufacturer page: `/manufacturers/{id}`
- Querying the API: `GET /api/manufacturers` (if available)

### Step 2: Get Verification Message

Call the API to get a message that needs to be signed:

```bash
curl -X GET "http://localhost:3000/api/manufacturers/wallets?get_message=true&manufacturer_id={manufacturer_id}&wallet_address={wallet_address}"
```

**Example:**
```bash
curl -X GET "http://localhost:3000/api/manufacturers/wallets?get_message=true&manufacturer_id=123e4567-e89b-12d3-a456-426614174000&wallet_address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
```

**Response:**
```json
{
  "success": true,
  "message": "{\n  \"action\": \"register_manufacturer_wallet\",\n  \"wallet_address\": \"0x742d35cc6634c0532925a3b844bc9e7595f0beb\",\n  \"manufacturer_id\": \"123e4567-e89b-12d3-a456-426614174000\",\n  \"nonce\": \"1234567890-abc123\",\n  \"message\": \"I confirm that I am authorized to register this wallet for the manufacturer. This signature proves ownership of the wallet.\"\n}",
  "nonce": "1234567890-abc123"
}
```

**Important:** Save both the `message` and `nonce` from the response - you'll need them for the next step.

### Step 3: Sign the Message

You need to sign the message using the wallet's private key. The message format is a JSON string that needs to be signed as-is.

**Using ethers.js (Node.js):**
```javascript
const { ethers } = require('ethers');

const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY');
const message = '{"action":"register_manufacturer_wallet",...}'; // From step 2
const signature = await wallet.signMessage(message);
console.log(signature);
```

**Using MetaMask (Browser Console):**
```javascript
const message = '{"action":"register_manufacturer_wallet",...}'; // From step 2
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
const signature = await window.ethereum.request({
  method: 'personal_sign',
  params: [message, accounts[0]]
});
console.log(signature);
```

**Using cast (Foundry):**
```bash
cast wallet sign --private-key YOUR_PRIVATE_KEY "$(echo -n 'MESSAGE_FROM_STEP_2')"
```

### Step 4: Register the Wallet

Now call the POST endpoint with the signature:

```bash
curl -X POST http://localhost:3000/api/manufacturers/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturer_id": "{manufacturer_id}",
    "wallet_address": "{wallet_address}",
    "signature": "{signature_from_step_3}",
    "nonce": "{nonce_from_step_2}",
    "registered_by": "{admin_address_or_name}",
    "notes": "Optional notes about this wallet"
  }'
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/manufacturers/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "manufacturer_id": "123e4567-e89b-12d3-a456-426614174000",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "signature": "0x1234567890abcdef...",
    "nonce": "1234567890-abc123",
    "registered_by": "admin",
    "notes": "Primary verification wallet"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "walletId": "uuid-of-registered-wallet"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Errors

- **"Manufacturer not found"**: Check that the manufacturer_id is correct
- **"Wallet already registered"**: This wallet is already registered for a manufacturer
- **"Invalid signature"**: The signature doesn't match the message/wallet address
- **"manufacturer_id, wallet_address, signature, and nonce are required"**: Missing required fields

---

## Method 3: Direct Database Registration (Testing Only)

⚠️ **Warning:** This method bypasses signature verification and should only be used for quick testing. In production, always use Method 1 or 2.

### Using Prisma Studio

1. Open Prisma Studio:
   ```bash
   npx prisma studio
   ```

2. Navigate to `manufacturer_wallets` table
3. Click "Add record"
4. Fill in the fields:
   - `manufacturer_id`: UUID of the manufacturer
   - `wallet_address`: Wallet address (will be lowercased automatically)
   - `status`: `"active"`
   - `registered_at`: Current timestamp
   - `registered_by`: Your name/identifier
   - `notes`: Optional notes

5. Click "Save 1 change"

### Using SQL

```sql
INSERT INTO manufacturer_wallets (
  manufacturer_id,
  wallet_address,
  status,
  registered_at,
  registered_by,
  notes
) VALUES (
  '123e4567-e89b-12d3-a456-426614174000',  -- manufacturer_id
  '0x742d35cc6634c0532925a3b844bc9e7595f0beb',  -- wallet_address (lowercase)
  'active',
  NOW(),
  'admin',
  'Test wallet'
);
```

**Note:** The `wallet_address` must be unique and lowercase. The database will enforce this.

---

## Verification

After registration (using any method), verify the wallet is registered:

### Check via API

```bash
curl "http://localhost:3000/api/manufacturers/wallets?manufacturer_id={manufacturer_id}"
```

### Check via UI

Visit the manufacturer dashboard:
```
http://localhost:3000/dashboard/manufacturer
```

Connect your registered wallet, and you should be able to see and co-sign pending attestations.

### Check via Database

```sql
SELECT * FROM manufacturer_wallets 
WHERE manufacturer_id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## Testing Workflow

For Phase 1B testing, follow this workflow:

1. **Register a wallet** using one of the methods above
2. **Create a pending attestation** (if you don't have one)
3. **Visit** `http://localhost:3000/dashboard/manufacturer`
4. **Connect** your registered wallet
5. **Verify** you can see pending attestations
6. **Co-sign** an attestation to test the full flow

---

## Troubleshooting

### Wallet not showing in dashboard

- Verify the wallet is registered: Check `manufacturer_wallets` table
- Verify the wallet address matches exactly (case-insensitive, but check for typos)
- Check the wallet status is `'active'`
- Ensure you're connecting the correct wallet in MetaMask

### Signature verification fails

- Ensure you're signing the exact message returned from the API (including all whitespace)
- Verify the wallet address matches the one you're signing with
- Check that the nonce matches between the GET and POST requests
- Ensure you're using `personal_sign` (not `eth_sign`)

### API returns 500 error

- Check server logs for detailed error messages
- Verify the database connection is working
- Ensure all required environment variables are set
- Check that the manufacturer exists in the database

---

## Related Files

- API Route: `src/app/api/manufacturers/wallets/route.ts`
- Server Actions: `src/lib/actions/manufacturer-wallets.ts`
- UI Component: `src/app/admin/manufacturers/[id]/wallets/wallet-registration-form.tsx`
- Admin Page: `src/app/admin/manufacturers/[id]/wallets/page.tsx`
- Database Schema: `prisma/schema.prisma` (see `manufacturer_wallets` model)
