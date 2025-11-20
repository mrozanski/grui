#!/usr/bin/env tsx
/**
 * Seed Initial Schema Versions
 *
 * This script populates the schema_versions table with the initial v1.0.0 versions
 * of the Model and Instrument attestation schemas.
 *
 * Usage:
 *   tsx scripts/seed-schema-versions.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { registerInitialSchemaVersions } from '../src/lib/eas/schemas/versions';

async function main() {
  console.log('🌱 Seeding initial schema versions...\n');

  try {
    await registerInitialSchemaVersions();
    console.log('\n✅ Schema versions seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to seed schema versions:', error);
    process.exit(1);
  }
}

main();
