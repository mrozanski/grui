/**
 * IPFS Async Pinning Queue
 *
 * Handles asynchronous pinning of attestations to IPFS with retry logic
 * and graceful degradation if IPFS is unavailable.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { pinJSONToIPFS, isPinataConfigured } from './client';
import type { OffchainAttestationResult } from '../eas/attestation';
import { safeDecodeModelAttestationV1 } from '../eas/schemas/decoders/model-v1';
import { safeDecodeInstrumentAttestationV1 } from '../eas/schemas/decoders/instrument-v1';
import { EAS_CONFIG } from '../eas/config';

/**
 * Maximum retry attempts for pinning
 */
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry delay in milliseconds (exponential backoff)
 */
const RETRY_DELAY_MS = 1000;

/**
 * Decodes attestation data based on schema type
 * Adds decodedData field for human-readable JSON in IPFS
 */
function decodeAttestationData(attestation: OffchainAttestationResult): OffchainAttestationResult & { decodedData?: unknown } {
  const schemaUid = attestation.message.schema;
  const encodedData = attestation.message.data;

  // Determine schema type and decode accordingly
  let decodedData: unknown = null;

  if (schemaUid === EAS_CONFIG.schemas.model.uid) {
    // Model attestation
    decodedData = safeDecodeModelAttestationV1(encodedData);
  } else if (schemaUid === EAS_CONFIG.schemas.instrument.uid) {
    // Instrument attestation
    decodedData = safeDecodeInstrumentAttestationV1(encodedData);
  }

  // Return attestation with decoded data added
  return {
    ...attestation,
    decodedData: decodedData || null,
  };
}

/**
 * Pins attestation to IPFS with retry logic
 *
 * @param attestation - Offchain attestation to pin
 * @param attestationName - Optional name for the pinned content
 * @returns IPFS CID or null if pinning fails
 */
export async function pinAttestationToIPFS(
  attestation: OffchainAttestationResult,
  attestationName?: string
): Promise<string | null> {
  // Check if IPFS is configured
  if (!isPinataConfigured()) {
    console.warn('⚠️  IPFS/Pinata not configured. Attestation will only be stored in database.');
    console.warn('   See PINATA_SETUP.md for setup instructions.');
    return null;
  }

  // Decode the attestation data for human-readable JSON in IPFS
  const attestationWithDecodedData = decodeAttestationData(attestation);

  let lastError: Error | null = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`📌 Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}: Pinning attestation to IPFS...`);

      const cid = await pinJSONToIPFS(
        attestationWithDecodedData,
        attestationName || `attestation-${attestation.uid}`
      );

      console.log(`✅ Successfully pinned to IPFS: ${cid}`);
      return cid;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`❌ Attempt ${attempt} failed:`, lastError.message);

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`❌ Failed to pin to IPFS after ${MAX_RETRY_ATTEMPTS} attempts:`, lastError);
  return null;
}

/**
 * Asynchronously updates attestation with IPFS CID
 * This can be called after the attestation is created to add IPFS storage
 *
 * @param attestationUid - Attestation UID
 * @param attestation - Offchain attestation object
 */
export async function updateAttestationWithIPFS(
  attestationUid: string,
  attestation: OffchainAttestationResult
): Promise<void> {
  try {
    // Pin to IPFS
    const ipfsCid = await pinAttestationToIPFS(attestation);

    if (!ipfsCid) {
      console.warn(`⚠️  Attestation ${attestationUid} created without IPFS backup`);
      return;
    }

    // Update database record with IPFS CID
    await prisma.attestations.update({
      where: { uid: attestationUid },
      data: { ipfs_cid: ipfsCid },
    });

    // Also update the entity table (models or individual_guitars)
    const attestationRecord = await prisma.attestations.findUnique({
      where: { uid: attestationUid },
      select: { entity_type: true, entity_id: true },
    });

    if (attestationRecord) {
      if (attestationRecord.entity_type === 'model') {
        await prisma.models.update({
          where: { id: attestationRecord.entity_id },
          data: { ipfs_cid: ipfsCid },
        });
      } else if (attestationRecord.entity_type === 'individual_guitar') {
        await prisma.individual_guitars.update({
          where: { id: attestationRecord.entity_id },
          data: { ipfs_cid: ipfsCid },
        });
      }
    }

    console.log(`✅ Updated attestation ${attestationUid} with IPFS CID: ${ipfsCid}`);
  } catch (error) {
    console.error('Error updating attestation with IPFS:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Batch pin multiple attestations to IPFS
 * Useful for backfilling existing attestations
 *
 * @param attestationUids - Array of attestation UIDs to pin
 * @returns Number of successfully pinned attestations
 */
export async function batchPinAttestations(attestationUids: string[]): Promise<number> {
  const successCount = 0;

  for (const uid of attestationUids) {
    try {
      // Fetch attestation from database
      const record = await prisma.attestations.findUnique({
        where: { uid },
      });

      if (!record) {
        console.warn(`⚠️  Attestation ${uid} not found in database`);
        continue;
      }

      // Skip if already has IPFS CID
      if (record.ipfs_cid) {
        console.log(`⏭️  Attestation ${uid} already has IPFS CID: ${record.ipfs_cid}`);
        continue;
      }

      // Note: We cannot fully reconstruct the SignedOffchainAttestation from database records alone
      // as we don't store the complete attestation structure (domain, message, signature, etc.)
      // This function is intended for attestations that were pinned at creation time.
      // For attestations without IPFS CIDs, they would need to be re-created with full attestation data.
      console.warn(`⚠️  Cannot reconstruct full attestation for ${uid} - skipping. Full attestation data required for IPFS pinning.`);
      continue;
    } catch (error) {
      console.error(`Error pinning attestation ${uid}:`, error);
    }
  }

  console.log(`✅ Successfully pinned ${successCount}/${attestationUids.length} attestations`);
  return successCount;
}
