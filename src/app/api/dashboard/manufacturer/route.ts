/**
 * API Route: Manufacturer Dashboard
 *
 * GET /api/dashboard/manufacturer - Get manufacturer info and pending attestations
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getManufacturerByWallet,
  getPendingAttestationsForManufacturer,
} from '@/lib/data/manufacturer-wallets';

/**
 * GET /api/dashboard/manufacturer
 *
 * Query params:
 * - wallet_address: Connected wallet address
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('wallet_address');

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'wallet_address is required' },
        { status: 400 }
      );
    }

    // Get manufacturer by wallet
    const manufacturer = await getManufacturerByWallet(walletAddress);

    if (!manufacturer) {
      return NextResponse.json(
        { success: false, error: 'Wallet not registered' },
        { status: 403 }
      );
    }

    // Get pending attestations for this manufacturer
    const pendingAttestations = await getPendingAttestationsForManufacturer(walletAddress);

    return NextResponse.json({
      success: true,
      manufacturer: {
        id: manufacturer.id,
        name: manufacturer.name,
        country: manufacturer.country,
      },
      pendingAttestations,
      totalPending: pendingAttestations.length,
    });
  } catch (error) {
    console.error('Error in GET /api/dashboard/manufacturer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

