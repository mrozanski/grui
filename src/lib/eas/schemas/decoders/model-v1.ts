/**
 * Model Attestation Schema Decoder - Version 1.0.0
 *
 * Decodes EAS attestation data back to model data structure according to the
 * GuitarModelAttestation_v1_0_0 schema.
 */

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { EAS_CONFIG } from '../../config';
import type { ModelAttestationDataV1 } from '../encoders/model-v1';

/**
 * Decodes model attestation data from EAS format
 *
 * @param encodedData - Hex encoded attestation data
 * @returns Decoded model attestation data
 */
export function decodeModelAttestationV1(encodedData: string): ModelAttestationDataV1 {
  const encoder = new SchemaEncoder(EAS_CONFIG.schemas.model.definition);
  const decodedData = encoder.decodeData(encodedData);

  // Extract values from decoded data
  // EAS SDK returns an array of { name, type, signature, value: { name, type, value } }
  const getValue = (name: string): unknown => {
    const field = decodedData.find((item: { name: string; value: { value: unknown } }) => item.name === name);
    if (!field) {
      throw new Error(`Field ${name} not found in decoded data`);
    }
    return field.value.value;
  };

  return {
    manufacturer_name: getValue('manufacturer_name') as string,
    product_line_name: getValue('product_line_name') as string,
    model_name: getValue('model_name') as string,
    year: Number(getValue('year')),
    db_reference_id: getValue('db_reference_id') as string,
    production_type: getValue('production_type') as string,
    production_dates: getValue('production_dates') as string,
    estimated_quantity: Number(getValue('estimated_quantity')),
    original_msrp: getValue('original_msrp') as string,
    currency: getValue('currency') as string,
    description: getValue('description') as string,
  };
}

/**
 * Safely decode model attestation data with error handling
 *
 * @param encodedData - Hex encoded attestation data
 * @returns Decoded data or null if decoding fails
 */
export function safeDecodeModelAttestationV1(
  encodedData: string
): ModelAttestationDataV1 | null {
  try {
    return decodeModelAttestationV1(encodedData);
  } catch (error) {
    console.error('Failed to decode model attestation v1:', error);
    return null;
  }
}
