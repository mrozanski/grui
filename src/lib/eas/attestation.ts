/**
 * Core EAS Attestation Creation and Management
 *
 * This module handles:
 * - Creating offchain attestations for models and instruments
 * - Signing attestations with provided wallet
 * - Computing attestation UIDs
 */

import { EAS, Offchain, OffchainAttestationParams } from '@ethereum-attestation-service/eas-sdk';
import { ethers } from 'ethers';
import { EAS_CONFIG } from './config';
import { encodeModelAttestationV1, validateModelAttestationDataV1 } from './schemas/encoders/model-v1';
import { encodeInstrumentAttestationV1, validateInstrumentAttestationDataV1 } from './schemas/encoders/instrument-v1';
import type { ModelAttestationDataV1 } from './schemas/encoders/model-v1';
import type { InstrumentAttestationDataV1 } from './schemas/encoders/instrument-v1';

/**
 * Import the SignedOffchainAttestation type from EAS SDK
 */
import type { SignedOffchainAttestation } from '@ethereum-attestation-service/eas-sdk';

/**
 * Offchain attestation result type (alias for EAS SDK type)
 */
export type OffchainAttestationResult = SignedOffchainAttestation;

/**
 * Initialize EAS instance
 */
function initializeEAS(): EAS {
  const eas = new EAS(EAS_CONFIG.easContractAddress);
  return eas;
}

/**
 * Get offchain attestation handler
 */
async function getOffchainHandler(eas: EAS): Promise<Offchain> {
  return await eas.getOffchain();
}

/**
 * Creates an offchain model attestation
 *
 * @param modelData - Model attestation data
 * @param signerWallet - Wallet to sign the attestation
 * @returns Offchain attestation with signature
 */
export async function createModelAttestation(
  modelData: ModelAttestationDataV1,
  signerWallet: ethers.Wallet
): Promise<OffchainAttestationResult> {
  // Validate data
  const validation = validateModelAttestationDataV1(modelData);
  if (!validation.valid) {
    throw new Error(`Invalid model attestation data: ${validation.errors.join(', ')}`);
  }

  // Encode data using schema
  const encodedData = encodeModelAttestationV1(modelData);

  // Initialize EAS and connect provider
  const eas = initializeEAS();
  eas.connect(signerWallet); // Connect provider via signer
  const offchain = await getOffchainHandler(eas);

  // Create attestation parameters
  const attestationParams: OffchainAttestationParams = {
    schema: EAS_CONFIG.schemas.model.uid,
    recipient: EAS_CONFIG.attestation.defaultRecipient,
    time: BigInt(Math.floor(Date.now() / 1000)),
    expirationTime: BigInt(EAS_CONFIG.attestation.noExpiration),
    revocable: EAS_CONFIG.attestation.revocable,
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: encodedData,
  };

  // Sign offchain attestation
  const attestation = await offchain.signOffchainAttestation(
    attestationParams,
    signerWallet
  );

  return attestation as OffchainAttestationResult;
}

/**
 * Creates an offchain instrument attestation
 *
 * @param instrumentData - Instrument attestation data
 * @param signerWallet - Wallet to sign the attestation
 * @returns Offchain attestation with signature
 */
export async function createInstrumentAttestation(
  instrumentData: InstrumentAttestationDataV1,
  signerWallet: ethers.Wallet
): Promise<OffchainAttestationResult> {
  // Validate data
  const validation = validateInstrumentAttestationDataV1(instrumentData);
  if (!validation.valid) {
    throw new Error(`Invalid instrument attestation data: ${validation.errors.join(', ')}`);
  }

  // Encode data using schema
  const encodedData = encodeInstrumentAttestationV1(instrumentData);

  // Initialize EAS and connect provider
  const eas = initializeEAS();
  eas.connect(signerWallet); // Connect provider via signer
  const offchain = await getOffchainHandler(eas);

  // Create attestation parameters
  const attestationParams: OffchainAttestationParams = {
    schema: EAS_CONFIG.schemas.instrument.uid,
    recipient: EAS_CONFIG.attestation.defaultRecipient,
    time: BigInt(Math.floor(Date.now() / 1000)),
    expirationTime: BigInt(EAS_CONFIG.attestation.noExpiration),
    revocable: EAS_CONFIG.attestation.revocable,
    refUID: '0x0000000000000000000000000000000000000000000000000000000000000000',
    data: encodedData,
  };

  // Sign offchain attestation
  const attestation = await offchain.signOffchainAttestation(
    attestationParams,
    signerWallet
  );

  return attestation;
}

/**
 * Creates a signer wallet from private key
 *
 * @param privateKey - Private key (with or without 0x prefix)
 * @param provider - Optional provider (if not provided, uses configured RPC)
 * @returns Ethers wallet instance
 */
export function createSignerWallet(
  privateKey: string,
  provider?: ethers.Provider
): ethers.Wallet {
  // Ensure private key has 0x prefix
  const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

  // Create provider if not provided
  const finalProvider = provider || new ethers.JsonRpcProvider(EAS_CONFIG.rpcUrl);

  // Create and return wallet
  return new ethers.Wallet(formattedKey, finalProvider);
}

/**
 * Gets admin signer wallet from environment
 *
 * @returns Admin wallet for signing attestations
 */
export function getAdminSigner(): ethers.Wallet {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error('ADMIN_PRIVATE_KEY not found in environment variables');
  }

  return createSignerWallet(privateKey);
}

/**
 * Computes the UID for an attestation (for verification purposes)
 *
 * @param attestation - The offchain attestation
 * @returns The computed UID
 */
export function computeAttestationUID(attestation: OffchainAttestationResult): string {
  return attestation.uid;
}
