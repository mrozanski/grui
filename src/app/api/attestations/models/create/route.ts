/**
 * API Route: Create Model Attestation
 *
 * POST /api/attestations/models/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createModelAttestationAction } from '@/lib/actions/attestations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { model_id } = body;

    if (!model_id) {
      return NextResponse.json(
        { success: false, error: 'model_id is required' },
        { status: 400 }
      );
    }

    // Create model attestation
    const result = await createModelAttestationAction(model_id);

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
    console.error('Error in POST /api/attestations/models/create:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
