/**
 * Model Attestation Schema Encoder - Version 1.0.0
 *
 * Encodes model data into EAS attestation format according to the
 * GuitarModelAttestation_v1_0_0 schema.
 */

import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';
import { EAS_CONFIG } from '../../config';

/**
 * Model attestation data structure (v1.0.0)
 */
export interface ModelAttestationDataV1 {
  manufacturer_name: string;
  product_line_name: string;
  model_name: string;
  year: number;
  db_reference_id: string;
  production_type?: string;
  production_dates?: string;
  estimated_quantity?: number;
  original_msrp?: string;
  currency?: string;
  description?: string;
}

/**
 * Encodes model data into EAS attestation format
 *
 * @param data - Model attestation data
 * @returns Encoded data as hex string
 */
export function encodeModelAttestationV1(data: ModelAttestationDataV1): string {
  const encoder = new SchemaEncoder(EAS_CONFIG.schemas.model.definition);

  const encodedData = encoder.encodeData([
    { name: 'manufacturer_name', value: data.manufacturer_name, type: 'string' },
    { name: 'product_line_name', value: data.product_line_name, type: 'string' },
    { name: 'model_name', value: data.model_name, type: 'string' },
    { name: 'year', value: data.year, type: 'uint16' },
    { name: 'db_reference_id', value: data.db_reference_id, type: 'string' },
    { name: 'production_type', value: data.production_type || '', type: 'string' },
    { name: 'production_dates', value: data.production_dates || '', type: 'string' },
    { name: 'estimated_quantity', value: data.estimated_quantity || 0, type: 'uint32' },
    { name: 'original_msrp', value: data.original_msrp || '', type: 'string' },
    { name: 'currency', value: data.currency || 'USD', type: 'string' },
    { name: 'description', value: data.description || '', type: 'string' },
  ]);

  return encodedData;
}

/**
 * Validates model attestation data before encoding
 *
 * @param data - Model attestation data to validate
 * @returns Validation result
 */
export function validateModelAttestationDataV1(
  data: Partial<ModelAttestationDataV1>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.manufacturer_name || data.manufacturer_name.trim() === '') {
    errors.push('manufacturer_name is required');
  }

  if (!data.product_line_name || data.product_line_name.trim() === '') {
    errors.push('product_line_name is required');
  }

  if (!data.model_name || data.model_name.trim() === '') {
    errors.push('model_name is required');
  }

  if (!data.year) {
    errors.push('year is required');
  } else if (data.year < 1800 || data.year > new Date().getFullYear() + 1) {
    errors.push(`year must be between 1800 and ${new Date().getFullYear() + 1}`);
  }

  if (!data.db_reference_id || data.db_reference_id.trim() === '') {
    errors.push('db_reference_id is required');
  }

  // Optional field validation
  if (data.estimated_quantity !== undefined && data.estimated_quantity < 0) {
    errors.push('estimated_quantity cannot be negative');
  }

  if (data.currency && data.currency.length !== 3) {
    errors.push('currency must be a 3-letter code (e.g., USD, EUR)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
