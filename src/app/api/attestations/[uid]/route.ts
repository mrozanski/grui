/**
 * API Route: Get Attestation by UID
 *
 * GET /api/attestations/:uid
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAttestationByUID } from '@/lib/data/attestations';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;

    if (!uid) {
      return NextResponse.json(
        { error: 'Attestation UID is required' },
        { status: 400 }
      );
    }

    // Get attestation
    const attestation = await getAttestationByUID(uid);

    if (!attestation) {
      return NextResponse.json(
        { error: 'Attestation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      uid: attestation.uid,
      schema_uid: attestation.schema_uid,
      schema_type: attestation.schema_type,
      schema_version: attestation.schema_version,
      entity_type: attestation.entity_type,
      entity_id: attestation.entity_id,
      data: attestation.attestation_data,
      ipfs_cid: attestation.ipfs_cid,
      signer_wallet: attestation.signer_wallet,
      signer_role: attestation.signer_role,
      signed_at: attestation.signed_at,
      cosigner_wallet: attestation.cosigner_wallet,
      cosigner_role: attestation.cosigner_role,
      cosigned_at: attestation.cosigned_at,
      status: attestation.status,
      created_at: attestation.created_at,
    });
  } catch (error) {
    console.error('Error in GET /api/attestations/:uid:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
