/**
 * Schema Version Management Utilities
 *
 * Handles schema version tracking, migration, and version chain queries.
 */

'use server';

import { prisma } from '@/lib/prisma';

/**
 * Schema version record type
 */
export interface SchemaVersionRecord {
  id: string;
  schema_name: string;
  version: string;
  schema_uid: string;
  previous_version_id: string | null;
  next_version_id: string | null;
  changelog: string | null;
  effective_date: Date;
  deprecated_date: Date | null;
  status: string | null;
  created_at: Date | null;
}

/**
 * Get the version chain for a schema
 * Returns all versions from oldest to newest
 *
 * @param schemaName - Name of the schema (e.g., 'GuitarModelAttestation')
 * @returns Array of schema versions in chronological order
 */
export async function getSchemaVersionChain(
  schemaName: string
): Promise<SchemaVersionRecord[]> {
  const currentVersion = await prisma.schema_versions.findFirst({
    where: {
      schema_name: schemaName,
      status: 'active',
    },
    orderBy: { effective_date: 'desc' },
  });

  if (!currentVersion) {
    return [];
  }

  // Walk the chain backward
  const versions: SchemaVersionRecord[] = [];
  let version: typeof currentVersion | null = currentVersion;

  while (version) {
    versions.push(version as SchemaVersionRecord);

    if (!version.previous_version_id) {
      break;
    }

    version = await prisma.schema_versions.findUnique({
      where: { id: version.previous_version_id },
    });
  }

  // Reverse to get chronological order (oldest to newest)
  return versions.reverse();
}

/**
 * Get current active schema version
 *
 * @param schemaName - Name of the schema
 * @returns Current active version or null
 */
export async function getCurrentSchemaVersion(
  schemaName: string
): Promise<SchemaVersionRecord | null> {
  const version = await prisma.schema_versions.findFirst({
    where: {
      schema_name: schemaName,
      status: 'active',
    },
    orderBy: { effective_date: 'desc' },
  });

  return version as SchemaVersionRecord | null;
}

/**
 * Get schema version by UID
 *
 * @param schemaUID - The schema UID
 * @returns Schema version string (e.g., '1.0.0') or default
 */
export async function getSchemaVersionByUID(schemaUID: string): Promise<string> {
  const versionRecord = await prisma.schema_versions.findFirst({
    where: { schema_uid: schemaUID },
  });

  return versionRecord?.version || '1.0.0';
}

/**
 * Get schema UID by name and version
 *
 * @param schemaName - Name of the schema
 * @param version - Version string (e.g., '1.0.0')
 * @returns Schema UID or null
 */
export async function getSchemaUIDByVersion(
  schemaName: string,
  version: string
): Promise<string | null> {
  const versionRecord = await prisma.schema_versions.findUnique({
    where: {
      schema_name_version: {
        schema_name: schemaName,
        version,
      },
    },
  });

  return versionRecord?.schema_uid || null;
}

/**
 * Register initial schema versions in database
 * Call this during Phase 1A setup
 */
export async function registerInitialSchemaVersions(): Promise<void> {
  // Check if already registered
  const existingModel = await prisma.schema_versions.findFirst({
    where: {
      schema_name: 'GuitarModelAttestation',
      version: '1.0.0',
    },
  });

  if (existingModel) {
    console.log('Schema versions already registered');
    return;
  }

  // Get schema UIDs from environment
  const modelSchemaUID = process.env.MODEL_SCHEMA_UID;
  const instrumentSchemaUID = process.env.INSTRUMENT_SCHEMA_UID;

  if (!modelSchemaUID || !instrumentSchemaUID) {
    throw new Error('MODEL_SCHEMA_UID and INSTRUMENT_SCHEMA_UID must be set in environment variables');
  }

  // Register Model Schema v1.0.0
  await prisma.schema_versions.create({
    data: {
      schema_name: 'GuitarModelAttestation',
      version: '1.0.0',
      schema_uid: modelSchemaUID,
      previous_version_id: null,
      next_version_id: null,
      changelog: 'Initial model attestation schema',
      effective_date: new Date(),
      status: 'active',
    },
  });

  // Register Instrument Schema v1.0.0
  await prisma.schema_versions.create({
    data: {
      schema_name: 'GuitarInstrumentAttestation',
      version: '1.0.0',
      schema_uid: instrumentSchemaUID,
      previous_version_id: null,
      next_version_id: null,
      changelog: 'Initial instrument attestation schema',
      effective_date: new Date(),
      status: 'active',
    },
  });

  console.log('✅ Initial schema versions registered successfully');
}

/**
 * Get all schema versions for a given schema name
 *
 * @param schemaName - Name of the schema
 * @returns All versions for this schema
 */
export async function getAllSchemaVersions(
  schemaName: string
): Promise<SchemaVersionRecord[]> {
  const versions = await prisma.schema_versions.findMany({
    where: { schema_name: schemaName },
    orderBy: { effective_date: 'asc' },
  });

  return versions as SchemaVersionRecord[];
}

/**
 * Check if a schema version is deprecated
 *
 * @param schemaUID - The schema UID
 * @returns True if deprecated
 */
export async function isSchemaVersionDeprecated(schemaUID: string): Promise<boolean> {
  const version = await prisma.schema_versions.findFirst({
    where: { schema_uid: schemaUID },
  });

  return version?.status === 'deprecated' || version?.status === 'sunset';
}
