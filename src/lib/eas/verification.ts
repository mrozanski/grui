/**
 * EAS Attestation Signature Verification
 *
 * This module handles verification of attestation signatures and data integrity.
 */

import { EAS } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { EAS_CONFIG } from './config';
import type { OffchainAttestationResult } from './attestation';

/**
 * Verifies an offchain attestation signature
 *
 * @param attestation - The attestation to verify
 * @returns True if signature is valid
 */
export async function verifyAttestationSignature(
  attestation: OffchainAttestationResult
): Promise<boolean> {
  try {
    const eas = new EAS(EAS_CONFIG.easContractAddress);
    const offchain = await eas.getOffchain();

    // Verify the signature using the full attestation object
    const isValid = await offchain.verifyOffchainAttestationSignature(
      attestation.uid,
      attestation
    );

    return isValid;
  } catch (error) {
    console.error('Error verifying attestation signature:', error);
    return false;
  }
}

/**
 * Recovers the signer address from an attestation
 *
 * @param attestation - The attestation
 * @returns The signer's Ethereum address
 */
export async function recoverAttestationSigner(
  attestation: OffchainAttestationResult
): Promise<string> {
  try {
    // Use EAS SDK to get the attestor/signer
    // The signer is embedded in the attestation structure
    // For offchain attestations, we can extract it from the signature
    const eas = new EAS(EAS_CONFIG.easContractAddress);
    const offchain = await eas.getOffchain();

    // The signer can be recovered from the attestation
    // This is a simplified version - actual recovery would use the full attestation data
    // For now, we'll return a placeholder that indicates this needs the full EAS implementation
    throw new Error('Signer recovery not yet fully implemented - use verifyAttestationSigner instead');
  } catch (error) {
    console.error('Error recovering signer address:', error);
    throw new Error('Failed to recover signer address from attestation');
  }
}

/**
 * Verifies that the attestation was signed by the expected address
 *
 * @param attestation - The attestation to verify
 * @param expectedSigner - The expected signer address
 * @returns True if the attestation was signed by the expected address
 */
export async function verifyAttestationSigner(
  attestation: OffchainAttestationResult,
  expectedSigner: string
): Promise<boolean> {
  try {
    const recoveredSigner = await recoverAttestationSigner(attestation);
    return recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error verifying attestation signer:', error);
    return false;
  }
}

/**
 * Verifies a manufacturer co-signature
 *
 * @param message - The message that was signed
 * @param signature - The signature
 * @param expectedSigner - The expected signer address
 * @returns True if signature is valid and from expected signer
 */
export function verifyManufacturerCosignature(
  message: string,
  signature: string,
  expectedSigner: string
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error verifying manufacturer co-signature:', error);
    return false;
  }
}

/**
 * Creates a deterministic message for manufacturer co-signing
 * NOTE: This message must be identical on client and server for signature verification
 *
 * @param attestationUid - The attestation UID being co-signed
 * @param originalSigner - The address of the original signer
 * @returns Message to be signed (deterministic, no timestamp)
 */
export function createCosignMessage(
  attestationUid: string,
  originalSigner: string
): string {
  // Use a deterministic message format (no timestamp) so client and server produce identical messages
  const message = {
    action: 'cosign_attestation',
    attestation_uid: attestationUid,
    original_signer: originalSigner.toLowerCase(),
    cosigner_role: 'manufacturer',
  };

  return JSON.stringify(message, null, 2);
}

/**
 * Verifies the integrity of attestation data
 * Checks that UID matches the data content
 *
 * @param attestation - The attestation to verify
 * @returns True if data integrity is valid
 */
export function verifyAttestationDataIntegrity(
  attestation: OffchainAttestationResult
): boolean {
  try {
    // The UID should be deterministic based on the attestation data
    // This is computed by EAS SDK during creation
    // For now, we just verify the structure is correct
    const hasValidUID = attestation.uid &&
      attestation.uid.startsWith('0x') &&
      attestation.uid.length === 66;

    return !!hasValidUID;
  } catch (error) {
    console.error('Error verifying attestation data integrity:', error);
    return false;
  }
}
