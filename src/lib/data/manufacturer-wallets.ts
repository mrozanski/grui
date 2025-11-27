/**
 * Manufacturer Wallet Data Layer
 *
 * Database query functions for manufacturer wallet management.
 */

'use server';

import { prisma } from '@/lib/prisma';

/**
 * Manufacturer wallet record type
 */
export interface ManufacturerWalletRecord {
  id: string;
  manufacturer_id: string;
  wallet_address: string;
  status: string | null;
  registered_at: Date | null;
  registered_by: string | null;
  notes: string | null;
  manufacturer_name?: string;
}

/**
 * Get all wallets for a manufacturer
 *
 * @param manufacturerId - Manufacturer ID
 * @returns Array of wallet records
 */
export async function getManufacturerWallets(
  manufacturerId: string
): Promise<ManufacturerWalletRecord[]> {
  const wallets = await prisma.manufacturer_wallets.findMany({
    where: { manufacturer_id: manufacturerId },
    include: {
      manufacturers: {
        select: { name: true },
      },
    },
    orderBy: { registered_at: 'desc' },
  });

  return wallets.map((w) => ({
    ...w,
    manufacturer_name: w.manufacturers.name,
  })) as ManufacturerWalletRecord[];
}

/**
 * Get wallet by address
 *
 * @param walletAddress - Ethereum wallet address
 * @returns Wallet record or null
 */
export async function getWalletByAddress(
  walletAddress: string
): Promise<ManufacturerWalletRecord | null> {
  const wallet = await prisma.manufacturer_wallets.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() },
    include: {
      manufacturers: {
        select: { name: true },
      },
    },
  });

  if (!wallet) return null;

  return {
    ...wallet,
    manufacturer_name: wallet.manufacturers.name,
  } as ManufacturerWalletRecord;
}

/**
 * Check if a wallet is registered and active for a manufacturer
 *
 * @param walletAddress - Ethereum wallet address
 * @param manufacturerId - Optional manufacturer ID to check against
 * @returns True if wallet is registered and active
 */
export async function isWalletRegistered(
  walletAddress: string,
  manufacturerId?: string
): Promise<boolean> {
  const wallet = await prisma.manufacturer_wallets.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() },
  });

  if (!wallet || wallet.status !== 'active') {
    return false;
  }

  if (manufacturerId && wallet.manufacturer_id !== manufacturerId) {
    return false;
  }

  return true;
}

/**
 * Get manufacturer by wallet address
 *
 * @param walletAddress - Ethereum wallet address
 * @returns Manufacturer data or null
 */
export async function getManufacturerByWallet(walletAddress: string) {
  const wallet = await prisma.manufacturer_wallets.findUnique({
    where: { wallet_address: walletAddress.toLowerCase() },
    include: {
      manufacturers: true,
    },
  });

  if (!wallet || wallet.status !== 'active') {
    return null;
  }

  return wallet.manufacturers;
}

/**
 * Get pending attestations for a manufacturer (by wallet)
 * Only returns attestations that:
 * 1. Are pending (not yet co-signed)
 * 2. Belong to models from this manufacturer
 *
 * @param walletAddress - Manufacturer's wallet address
 * @returns Array of pending attestations this wallet can co-sign
 */
export async function getPendingAttestationsForManufacturer(
  walletAddress: string
) {
  // Get manufacturer by wallet
  const manufacturer = await getManufacturerByWallet(walletAddress);

  if (!manufacturer) {
    return [];
  }

  // Get all models for this manufacturer
  const manufacturerModels = await prisma.models.findMany({
    where: {
      manufacturer_id: manufacturer.id,
      attestation_uid: { not: null },
      attestation_status: 'pending',
    },
    select: { id: true, attestation_uid: true },
  });

  if (manufacturerModels.length === 0) {
    return [];
  }

  // Get attestations for these models
  const modelIds = manufacturerModels.map((m) => m.id);
  
  const attestations = await prisma.attestations.findMany({
    where: {
      entity_type: 'model',
      entity_id: { in: modelIds },
      status: 'pending',
      cosigner_wallet: null, // Not yet co-signed
    },
    orderBy: { signed_at: 'desc' },
  });

  return attestations;
}

/**
 * Get all registered manufacturer wallets (for admin)
 *
 * @returns All manufacturer wallets with manufacturer info
 */
export async function getAllManufacturerWallets(): Promise<
  ManufacturerWalletRecord[]
> {
  const wallets = await prisma.manufacturer_wallets.findMany({
    include: {
      manufacturers: {
        select: { name: true },
      },
    },
    orderBy: { registered_at: 'desc' },
  });

  return wallets.map((w) => ({
    ...w,
    manufacturer_name: w.manufacturers.name,
  })) as ManufacturerWalletRecord[];
}

