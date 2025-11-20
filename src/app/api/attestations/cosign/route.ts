/**
 * API Route: Co-sign Attestation
 *
 * POST /api/attestations/cosign
 */

import { NextRequest, NextResponse } from 'next/server';
import { cosignAttestationAction } from '@/lib/actions/attestations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attestation_uid, signature, wallet_address } = body;

    if (!attestation_uid || !signature || !wallet_address) {
      return NextResponse.json(
        {
          success: false,
          error: 'attestation_uid, signature, and wallet_address are required',
        },
        { status: 400 }
      );
    }

    // Co-sign attestation
    const result = await cosignAttestationAction(
      attestation_uid,
      signature,
      wallet_address
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error === 'Unauthorized wallet' ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'official',
    });
  } catch (error) {
    console.error('Error in POST /api/attestations/cosign:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
