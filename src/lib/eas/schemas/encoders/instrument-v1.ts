/**
 * Instrument Attestation Schema Encoder - Version 1.0.0
 *
 * Encodes instrument data into EAS attestation format according to the
 * GuitarInstrumentAttestation_v1_0_0 schema.
 */

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { EAS_CONFIG } from '../../config';

/**
 * Instrument attestation data structure (v1.0.0)
 */
export interface InstrumentAttestationDataV1 {
  model_attestation_uid: string; // bytes32
  serial_number: string;
  db_reference_id: string;
  production_date?: string;
  production_number?: number;
  significance_level?: string;
  current_condition?: string;
  modifications?: string;
  provenance_summary?: string;
}

/**
 * Encodes instrument data into EAS attestation format
 *
 * @param data - Instrument attestation data
 * @returns Encoded data as hex string
 */
export function encodeInstrumentAttestationV1(data: InstrumentAttestationDataV1): string {
  const encoder = new SchemaEncoder(EAS_CONFIG.schemas.instrument.definition);

  const encodedData = encoder.encodeData([
    { name: 'model_attestation_uid', value: data.model_attestation_uid, type: 'bytes32' },
    { name: 'serial_number', value: data.serial_number, type: 'string' },
    { name: 'db_reference_id', value: data.db_reference_id, type: 'string' },
    { name: 'production_date', value: data.production_date || '', type: 'string' },
    { name: 'production_number', value: data.production_number || 0, type: 'uint32' },
    { name: 'significance_level', value: data.significance_level || 'notable', type: 'string' },
    { name: 'current_condition', value: data.current_condition || '', type: 'string' },
    { name: 'modifications', value: data.modifications || '', type: 'string' },
    { name: 'provenance_summary', value: data.provenance_summary || '', type: 'string' },
  ]);

  return encodedData;
}

/**
 * Validates instrument attestation data before encoding
 *
 * @param data - Instrument attestation data to validate
 * @returns Validation result
 */
export function validateInstrumentAttestationDataV1(
  data: Partial<InstrumentAttestationDataV1>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.model_attestation_uid || data.model_attestation_uid.trim() === '') {
    errors.push('model_attestation_uid is required');
  } else if (!/^0x[a-fA-F0-9]{64}$/.test(data.model_attestation_uid)) {
    errors.push('model_attestation_uid must be a valid bytes32 hex string (0x + 64 hex chars)');
  }

  if (!data.serial_number || data.serial_number.trim() === '') {
    errors.push('serial_number is required');
  }

  if (!data.db_reference_id || data.db_reference_id.trim() === '') {
    errors.push('db_reference_id is required');
  }

  // Optional field validation
  if (data.production_number !== undefined && data.production_number < 0) {
    errors.push('production_number cannot be negative');
  }

  if (data.production_date && data.production_date.trim() !== '') {
    // Basic ISO date validation (YYYY-MM-DD)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(data.production_date)) {
      errors.push('production_date must be in ISO format (YYYY-MM-DD)');
    }
  }

  const validSignificanceLevels = ['notable', 'significant', 'legendary', 'historic'];
  if (data.significance_level && !validSignificanceLevels.includes(data.significance_level)) {
    errors.push(`significance_level must be one of: ${validSignificanceLevels.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
