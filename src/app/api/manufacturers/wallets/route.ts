/**
 * API Route: Manufacturer Wallet Management
 *
 * POST /api/manufacturers/wallets - Register a new wallet
 * GET /api/manufacturers/wallets - Get wallets (with optional manufacturer filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  registerManufacturerWalletAction,
  createVerificationMessage,
  generateVerificationNonce,
} from '@/lib/actions/manufacturer-wallets';
import {
  getManufacturerWallets,
  getAllManufacturerWallets,
} from '@/lib/data/manufacturer-wallets';

/**
 * GET /api/manufacturers/wallets
 *
 * Query params:
 * - manufacturer_id: Filter by manufacturer (optional)
 * - get_message: If true, returns a message to sign for verification
 * - wallet_address: Required if get_message is true
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const manufacturerId = searchParams.get('manufacturer_id');
    const getMessage = searchParams.get('get_message') === 'true';
    const walletAddress = searchParams.get('wallet_address');

    // Return verification message
    if (getMessage) {
      if (!manufacturerId || !walletAddress) {
        return NextResponse.json(
          {
            success: false,
            error: 'manufacturer_id and wallet_address required for verification message',
          },
          { status: 400 }
        );
      }

      const nonce = await generateVerificationNonce();
      const message = await createVerificationMessage(
        walletAddress,
        manufacturerId,
        nonce
      );

      return NextResponse.json({
        success: true,
        message,
        nonce,
      });
    }

    // Get wallets
    const wallets = manufacturerId
      ? await getManufacturerWallets(manufacturerId)
      : await getAllManufacturerWallets();

    return NextResponse.json({
      success: true,
      wallets,
      count: wallets.length,
    });
  } catch (error) {
    console.error('Error in GET /api/manufacturers/wallets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/manufacturers/wallets
 *
 * Body:
 * - manufacturer_id: Manufacturer ID
 * - wallet_address: Wallet address to register
 * - signature: Signature proving ownership
 * - nonce: Nonce used in the verification message
 * - registered_by: Who is registering (admin address)
 * - notes: Optional notes
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      manufacturer_id,
      wallet_address,
      signature,
      nonce,
      registered_by,
      notes,
    } = body;

    // Validate required fields
    if (!manufacturer_id || !wallet_address || !signature || !nonce) {
      return NextResponse.json(
        {
          success: false,
          error:
            'manufacturer_id, wallet_address, signature, and nonce are required',
        },
        { status: 400 }
      );
    }

    // Register wallet
    const result = await registerManufacturerWalletAction(
      manufacturer_id,
      wallet_address,
      signature,
      nonce,
      registered_by || 'admin',
      notes
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      walletId: result.walletId,
    });
  } catch (error) {
    console.error('Error in POST /api/manufacturers/wallets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

