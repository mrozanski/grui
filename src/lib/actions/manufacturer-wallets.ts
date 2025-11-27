/**
 * Server Actions for Manufacturer Wallet Management
 *
 * Handles wallet registration and verification.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

/**
 * Result type for wallet operations
 */
export interface WalletOperationResult {
  success: boolean;
  walletId?: string;
  error?: string;
}

/**
 * Creates a verification message for wallet ownership
 *
 * @param walletAddress - The wallet address to verify
 * @param manufacturerId - The manufacturer ID
 * @param nonce - A unique nonce for this verification
 * @returns Message to be signed
 */
export async function createVerificationMessage(
  walletAddress: string,
  manufacturerId: string,
  nonce: string
): Promise<string> {
  const message = {
    action: 'register_manufacturer_wallet',
    wallet_address: walletAddress.toLowerCase(),
    manufacturer_id: manufacturerId,
    nonce,
    message:
      'I confirm that I am authorized to register this wallet for the manufacturer. This signature proves ownership of the wallet.',
  };

  return JSON.stringify(message, null, 2);
}

/**
 * Verifies wallet ownership signature
 *
 * @param message - The message that was signed
 * @param signature - The signature
 * @param expectedAddress - The expected signer address
 * @returns True if signature is valid
 */
export async function verifyWalletOwnership(
  message: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying wallet ownership:', error);
    return false;
  }
}

/**
 * Registers a manufacturer wallet after signature verification
 *
 * @param manufacturerId - Manufacturer ID
 * @param walletAddress - Wallet address to register
 * @param signature - Signature proving ownership
 * @param nonce - Nonce used in the message
 * @param registeredBy - Who registered this wallet (admin address or name)
 * @param notes - Optional notes
 * @returns Operation result
 */
export async function registerManufacturerWalletAction(
  manufacturerId: string,
  walletAddress: string,
  signature: string,
  nonce: string,
  registeredBy: string,
  notes?: string
): Promise<WalletOperationResult> {
  try {
    // Normalize address
    const normalizedAddress = walletAddress.toLowerCase();

    // 1. Verify manufacturer exists
    const manufacturer = await prisma.manufacturers.findUnique({
      where: { id: manufacturerId },
    });

    if (!manufacturer) {
      return { success: false, error: 'Manufacturer not found' };
    }

    // 2. Check if wallet already registered
    const existingWallet = await prisma.manufacturer_wallets.findUnique({
      where: { wallet_address: normalizedAddress },
    });

    if (existingWallet) {
      return {
        success: false,
        error: 'Wallet already registered for a manufacturer',
      };
    }

    // 3. Verify signature
    const message = await createVerificationMessage(
      normalizedAddress,
      manufacturerId,
      nonce
    );
    const isValid = await verifyWalletOwnership(message, signature, normalizedAddress);

    if (!isValid) {
      return { success: false, error: 'Invalid signature - wallet ownership not verified' };
    }

    // 4. Create wallet record
    const wallet = await prisma.manufacturer_wallets.create({
      data: {
        manufacturer_id: manufacturerId,
        wallet_address: normalizedAddress,
        status: 'active',
        registered_at: new Date(),
        registered_by: registeredBy,
        notes: notes || null,
      },
    });

    console.log(
      `✅ Registered wallet ${normalizedAddress} for manufacturer ${manufacturer.name}`
    );

    return { success: true, walletId: wallet.id };
  } catch (error) {
    console.error('Error registering manufacturer wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deactivates a manufacturer wallet
 *
 * @param walletId - Wallet ID to deactivate
 * @returns Operation result
 */
export async function deactivateManufacturerWalletAction(
  walletId: string
): Promise<WalletOperationResult> {
  try {
    const wallet = await prisma.manufacturer_wallets.update({
      where: { id: walletId },
      data: { status: 'inactive' },
    });

    console.log(`✅ Deactivated wallet ${wallet.wallet_address}`);

    return { success: true, walletId: wallet.id };
  } catch (error) {
    console.error('Error deactivating manufacturer wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reactivates a manufacturer wallet
 *
 * @param walletId - Wallet ID to reactivate
 * @returns Operation result
 */
export async function reactivateManufacturerWalletAction(
  walletId: string
): Promise<WalletOperationResult> {
  try {
    const wallet = await prisma.manufacturer_wallets.update({
      where: { id: walletId },
      data: { status: 'active' },
    });

    console.log(`✅ Reactivated wallet ${wallet.wallet_address}`);

    return { success: true, walletId: wallet.id };
  } catch (error) {
    console.error('Error reactivating manufacturer wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generates a nonce for wallet verification
 *
 * @returns A unique nonce string
 */
export async function generateVerificationNonce(): Promise<string> {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

