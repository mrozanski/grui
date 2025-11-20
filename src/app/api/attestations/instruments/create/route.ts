/**
 * API Route: Create Instrument Attestation
 *
 * POST /api/attestations/instruments/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createInstrumentAttestationAction } from '@/lib/actions/attestations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { guitar_id } = body;

    if (!guitar_id) {
      return NextResponse.json(
        { success: false, error: 'guitar_id is required' },
        { status: 400 }
      );
    }

    // Create instrument attestation
    const result = await createInstrumentAttestationAction(guitar_id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      attestation_uid: result.attestationUid,
      ipfs_cid: result.ipfsCid,
      status: 'pending',
    });
  } catch (error) {
    console.error('Error in POST /api/attestations/instruments/create:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
