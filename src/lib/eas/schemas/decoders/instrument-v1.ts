/**
 * Instrument Attestation Schema Decoder - Version 1.0.0
 *
 * Decodes EAS attestation data back to instrument data structure according to the
 * GuitarInstrumentAttestation_v1_0_0 schema.
 */

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { EAS_CONFIG } from '../../config';
import type { InstrumentAttestationDataV1 } from '../encoders/instrument-v1';

/**
 * Decodes instrument attestation data from EAS format
 *
 * @param encodedData - Hex encoded attestation data
 * @returns Decoded instrument attestation data
 */
export function decodeInstrumentAttestationV1(encodedData: string): InstrumentAttestationDataV1 {
  const encoder = new SchemaEncoder(EAS_CONFIG.schemas.instrument.definition);
  const decodedData = encoder.decodeData(encodedData);

  // Extract values from decoded data
  const getValue = (name: string): unknown => {
    const field = decodedData.find((item: { name: string; value: { value: unknown } }) => item.name === name);
    if (!field) {
      throw new Error(`Field ${name} not found in decoded data`);
    }
    return field.value.value;
  };

  return {
    model_attestation_uid: getValue('model_attestation_uid') as string,
    serial_number: getValue('serial_number') as string,
    db_reference_id: getValue('db_reference_id') as string,
    production_date: getValue('production_date') as string,
    production_number: Number(getValue('production_number')),
    significance_level: getValue('significance_level') as string,
    current_condition: getValue('current_condition') as string,
    modifications: getValue('modifications') as string,
    provenance_summary: getValue('provenance_summary') as string,
  };
}

/**
 * Safely decode instrument attestation data with error handling
 *
 * @param encodedData - Hex encoded attestation data
 * @returns Decoded data or null if decoding fails
 */
export function safeDecodeInstrumentAttestationV1(
  encodedData: string
): InstrumentAttestationDataV1 | null {
  try {
    return decodeInstrumentAttestationV1(encodedData);
  } catch (error) {
    console.error('Failed to decode instrument attestation v1:', error);
    return null;
  }
}
