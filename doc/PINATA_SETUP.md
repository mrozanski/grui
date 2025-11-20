# Pinata API Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Pinata Account
1. Go to [https://pinata.cloud](https://pinata.cloud)
2. Click **"Sign Up"** (or "Start Building")
3. Create account with email or GitHub

### Step 2: Generate API Keys
1. Once logged in, click on your profile icon (top right)
2. Navigate to **"API Keys"** in the dropdown menu
3. Click **"New Key"** button
4. Configure the API key:
   - **Key Name**: `guitar-registry-dev` (or your preferred name)
   - **Permissions**: Check these boxes:
     - ✅ `pinFileToIPFS`
     - ✅ `pinJSONToIPFS`
     - ✅ `unpin`
     - ✅ Gateway access (read)
   - Leave admin permissions unchecked for security
5. Click **"Generate Key"**
6. **IMPORTANT**: Copy both values immediately (they won't be shown again):
   - `API Key` (starts with a long alphanumeric string)
   - `API Secret` (another long string)

### Step 3: Add Keys to Environment

Add these lines to your `.env.local` file:

```bash
# IPFS/Pinata Configuration
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_api_secret_here
PINATA_JWT=optional_jwt_token # Modern alternative to API key/secret
IPFS_GATEWAY=https://gateway.pinata.cloud
```

**Note**: Modern Pinata accounts can also use JWT tokens instead of API Key/Secret. If you see a JWT option, you can use that instead:
```bash
PINATA_JWT=your_jwt_token_here
```

### Step 4: Verify Setup

The implementation will automatically test the connection when you first create an attestation. You can also run a quick test:

```bash
curl -X GET "https://api.pinata.cloud/data/testAuthentication" \
  -H "pinata_api_key: YOUR_API_KEY" \
  -H "pinata_secret_api_key: YOUR_SECRET_KEY"
```

Expected response:
```json
{
  "message": "Congratulations! You are communicating with the Pinata API!"
}
```

## Free Tier Limits

Pinata's free tier includes:
- ✅ **1 GB** of storage
- ✅ **100 GB** bandwidth per month
- ✅ Unlimited pins
- ✅ Access to IPFS gateway

This is more than sufficient for development and early production.

## Alternative: Using JWT (Recommended for Production)

For production, JWT tokens are more secure:

1. In Pinata dashboard, go to **"API Keys"**
2. Click **"New Key"** → Choose **"JWT"** option
3. Set permissions and generate
4. Copy the JWT token
5. Add to `.env.local`:
   ```bash
   PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Security Best Practices

⚠️ **Never commit API keys to git**
- Keys are in `.env.local` (gitignored by default)
- For production, use environment variable management (Vercel, AWS Secrets Manager, etc.)
- Rotate keys periodically
- Use least-privilege permissions (only what you need)

## Troubleshooting

**Problem**: "Authentication failed"
- **Solution**: Double-check API key and secret are copied correctly (no extra spaces)

**Problem**: "Insufficient permissions"
- **Solution**: Regenerate key with correct permissions checked

**Problem**: "Rate limit exceeded"
- **Solution**: Free tier has rate limits; implement retry logic (already built into our implementation)

## Useful Links

- Pinata Dashboard: [https://app.pinata.cloud](https://app.pinata.cloud)
- Pinata Docs: [https://docs.pinata.cloud](https://docs.pinata.cloud)
- API Reference: [https://docs.pinata.cloud/api-reference/introduction](https://docs.pinata.cloud/api-reference/introduction)
- Gateway Status: [https://status.pinata.cloud](https://status.pinata.cloud)

---

**Next Step**: Once you have your API keys configured, the implementation will handle IPFS pinning automatically when you create attestations.
