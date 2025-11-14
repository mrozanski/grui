# Atomic Lore - Sign Process Overview

## Front-End logic of the Sign Process

### **High-Level Flow**

1. **Modal Opens** (`signModal.tsx`)
   - User triggers signing from somewhere in the app
   - `SignModal` component renders with either `SignForm` or `CollectionAddComponent`

2. **Form Selection & Data Entry** (`signForm.tsx`)
   - User selects a template (Comment, Tweet, Media, Cast, Instagram, Proof of Exhibition, etc.)
   - Fills out required fields specific to that template
   - System validates required fields

3. **Pinning Phase** (Lines 871-953 in `signForm.tsx`)
   - When user clicks "Continue", the form data is "pinned" to IPFS/Arweave
   - `handlePin()` sends data to `/pinMetadataAPI`
   - Receives back `metadataIPFSCID` (the permanent storage ID)
   - Updates state to show preview of what will be signed

4. **🔑 Wallet Signing Phase** (Lines 975-1003 in `signForm.tsx`)
   - User clicks "Sign" button
   - `handlePrepareSign()` generates the signing message using `generateMessageToSign()` 
   - The message includes:
     - Template name
     - NFT/Collection info (contract address, token ID)
     - Metadata IPFS CID
     - All the form data as readable text
   
   **This is where Dynamic comes in:**
   ```typescript
   // Line 989
   signature = await primaryWallet.signMessage(signingMessage)
   ```
   - `primaryWallet` comes from `useDynamicContext()` hook (Line 130)
   - Dynamic's SDK handles the wallet connection and displays the signing prompt
   - User approves the signature in their wallet (MetaMask, WalletConnect, etc.)
   - Dynamic returns the cryptographic signature

5. **Attestation Creation** (Lines 1082-1118 in `signForm.tsx`)
   - Once signature is received, payload is created with:
     - All pinned metadata
     - The message that was signed
     - The signature from the wallet
   - Sends to `/signMetadataAPI` endpoint
   - Backend calls `signAttestation()` which stores in MariaDB
   - Returns `attestationIPFSCID` (the permanent attestation ID)

6. **Success State**
   - Shows success message
   - Offers "View Provenance" and "Share on Twitter" buttons
   - Updates UI to reflect new attestation

### **Key Dynamic Integration Points**

- **`useDynamicContext()`** (Line 129-135) provides:
  - `primaryWallet` - the active wallet for signing
  - `user` - authenticated user info
  - `showAuthFlow` - trigger wallet connection modal
  - `setShowDynamicUserProfile` - show wallet management UI

- **Wallet Validation** (Lines 256-263):
  ```typescript
  isUserAuthenticated() {
    return isAuthenticated && 
           primaryWallet != null && 
           primaryWallet.address && 
           user != null
  }
  ```

- **Wallet Switching** (Lines 223-229): Automatically switches to first wallet if none selected

### **Error Handling**

The sign flow includes error states for:
- User rejects signature → Error message shown
- Wallet address mismatch (for rollups) → Validation error
- Missing authentication → "Connect Wallet" button shown
- Backend errors → User-friendly error messages

The whole process is gasless (no blockchain transactions) - it's just cryptographic signatures that prove ownership of the wallet address.