/**
 * Attestation Data Layer
 *
 * Database query functions for attestations.
 */

'use server';

import { prisma } from '@/lib/prisma';

/**
 * Attestation record type from database
 */
export interface AttestationRecord {
  id: string;
  uid: string;
  schema_uid: string;
  schema_type: string;
  entity_type: string;
  entity_id: string;
  attestation_data: unknown;
  ipfs_cid: string | null;
  schema_version: string | null;
  signer_wallet: string;
  signer_role: string | null;
  signed_at: Date;
  cosigner_wallet: string | null;
  cosigner_role: string | null;
  cosigned_at: Date | null;
  status: string | null;
  created_at: Date | null;
}

/**
 * Get attestation by UID
 *
 * @param uid - Attestation UID
 * @returns Attestation record or null
 */
export async function getAttestationByUID(uid: string): Promise<AttestationRecord | null> {
  const attestation = await prisma.attestations.findUnique({
    where: { uid },
  });

  return attestation as AttestationRecord | null;
}

/**
 * Get attestations for a specific entity
 *
 * @param entityType - Entity type (model, individual_guitar, etc.)
 * @param entityId - Entity ID (UUID)
 * @returns Array of attestations
 */
export async function getAttestationsForEntity(
  entityType: string,
  entityId: string
): Promise<AttestationRecord[]> {
  const attestations = await prisma.attestations.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
    },
    orderBy: { signed_at: 'desc' },
  });

  return attestations as AttestationRecord[];
}

/**
 * Get pending attestations (awaiting manufacturer co-signature)
 *
 * @param schemaType - Optional filter by schema type (model, instrument)
 * @returns Array of pending attestations
 */
export async function getPendingAttestations(
  schemaType?: string
): Promise<AttestationRecord[]> {
  const attestations = await prisma.attestations.findMany({
    where: {
      status: 'pending',
      ...(schemaType && { schema_type: schemaType }),
    },
    orderBy: { signed_at: 'desc' },
  });

  return attestations as AttestationRecord[];
}

/**
 * Get attestations for a specific manufacturer (for co-signing dashboard)
 *
 * @param manufacturerName - Manufacturer name
 * @returns Array of pending attestations for this manufacturer
 */
export async function getPendingModelAttestationsForManufacturer(
  manufacturerName: string
): Promise<AttestationRecord[]> {
  const attestations = await prisma.attestations.findMany({
    where: {
      schema_type: 'model',
      status: 'pending',
      attestation_data: {
        path: ['manufacturer_name'],
        equals: manufacturerName,
      },
    },
    orderBy: { signed_at: 'desc' },
  });

  return attestations as AttestationRecord[];
}

/**
 * Get all attestations with optional filters
 *
 * @param options - Filter options
 * @returns Array of attestations
 */
export async function getAttestations(options?: {
  schemaType?: string;
  status?: string;
  signerWallet?: string;
  limit?: number;
  offset?: number;
}): Promise<{ attestations: AttestationRecord[]; total: number }> {
  const where = {
    ...(options?.schemaType && { schema_type: options.schemaType }),
    ...(options?.status && { status: options.status }),
    ...(options?.signerWallet && { signer_wallet: options.signerWallet }),
  };

  const [attestations, total] = await Promise.all([
    prisma.attestations.findMany({
      where,
      orderBy: { signed_at: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    }),
    prisma.attestations.count({ where }),
  ]);

  return {
    attestations: attestations as AttestationRecord[],
    total,
  };
}

/**
 * Get model with its attestation
 *
 * @param modelId - Model ID
 * @returns Model with attestation data or null
 */
export async function getModelWithAttestation(modelId: string) {
  const model = await prisma.models.findUnique({
    where: { id: modelId },
    include: {
      manufacturers: true,
      product_lines: true,
    },
  });

  if (!model || !model.attestation_uid) {
    return model;
  }

  // Fetch attestation
  const attestation = await getAttestationByUID(model.attestation_uid);

  return {
    ...model,
    attestation,
  };
}

/**
 * Get instrument with its attestation and linked model attestation
 *
 * @param guitarId - Individual guitar ID
 * @returns Guitar with attestation chain
 */
export async function getInstrumentWithAttestationChain(guitarId: string) {
  const guitar = await prisma.individual_guitars.findUnique({
    where: { id: guitarId },
    include: {
      models: {
        include: {
          manufacturers: true,
          product_lines: true,
        },
      },
    },
  });

  if (!guitar) {
    return null;
  }

  // Fetch instrument attestation
  const instrumentAttestation = guitar.attestation_uid
    ? await getAttestationByUID(guitar.attestation_uid)
    : null;

  // Fetch model attestation
  const modelAttestation = guitar.models?.attestation_uid
    ? await getAttestationByUID(guitar.models.attestation_uid)
    : null;

  return {
    ...guitar,
    instrumentAttestation,
    modelAttestation,
  };
}

/**
 * Get attestation statistics
 *
 * @returns Attestation statistics
 */
export async function getAttestationStats() {
  const [
    totalAttestations,
    modelAttestations,
    instrumentAttestations,
    pendingAttestations,
    officialAttestations,
  ] = await Promise.all([
    prisma.attestations.count(),
    prisma.attestations.count({ where: { schema_type: 'model' } }),
    prisma.attestations.count({ where: { schema_type: 'instrument' } }),
    prisma.attestations.count({ where: { status: 'pending' } }),
    prisma.attestations.count({ where: { status: 'official' } }),
  ]);

  return {
    total: totalAttestations,
    byType: {
      model: modelAttestations,
      instrument: instrumentAttestations,
    },
    byStatus: {
      pending: pendingAttestations,
      official: officialAttestations,
    },
  };
}
