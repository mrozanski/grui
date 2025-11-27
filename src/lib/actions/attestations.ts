/**
 * Server Actions for Attestations
 *
 * These server-side functions handle attestation creation and management.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { createModelAttestation, createInstrumentAttestation, getAdminSigner } from '@/lib/eas/attestation';
import { pinAttestationToIPFS } from '@/lib/ipfs/pinning';
import type { ModelAttestationDataV1 } from '@/lib/eas/schemas/encoders/model-v1';
import type { InstrumentAttestationDataV1 } from '@/lib/eas/schemas/encoders/instrument-v1';
import { EAS_CONFIG } from '@/lib/eas/config';
import { verifyManufacturerCosignature, createCosignMessage } from '@/lib/eas/verification';

/**
 * Result type for attestation creation
 */
export interface CreateAttestationResult {
  success: boolean;
  attestationUid?: string;
  ipfsCid?: string;
  error?: string;
}

/**
 * Creates a model attestation for an existing model
 *
 * @param modelId - Model ID (UUID)
 * @returns Result with attestation UID and IPFS CID
 */
export async function createModelAttestationAction(
  modelId: string
): Promise<CreateAttestationResult> {
  try {
    console.log(`📝 Creating model attestation for model ${modelId}...`);

    // 1. Fetch model data
    const model = await prisma.models.findUnique({
      where: { id: modelId },
      include: {
        manufacturers: true,
        product_lines: true,
      },
    });

    if (!model) {
      return { success: false, error: 'Model not found' };
    }

    // 2. Check if model already has attestation
    if (model.attestation_uid) {
      return {
        success: false,
        error: `Model already has an attestation: ${model.attestation_uid}`,
      };
    }

    // 3. Prepare attestation data
    const attestationData: ModelAttestationDataV1 = {
      manufacturer_name: model.manufacturers?.name || '',
      product_line_name: model.product_lines?.name || '',
      model_name: model.name,
      year: model.year,
      db_reference_id: model.id,
      production_type: model.production_type || '',
      production_dates: model.production_start_date && model.production_end_date
        ? `${model.production_start_date.toISOString().split('T')[0]}/${model.production_end_date.toISOString().split('T')[0]}`
        : '',
      estimated_quantity: model.estimated_production_quantity || 0,
      original_msrp: model.msrp_original?.toString() || '',
      currency: model.currency || 'USD',
      description: model.description || '',
    };

    // 4. Get admin signer
    const adminWallet = getAdminSigner();
    console.log(`✍️  Signing with admin wallet: ${adminWallet.address}`);

    // 5. Create offchain attestation
    const attestation = await createModelAttestation(attestationData, adminWallet);
    console.log(`✅ Attestation created with UID: ${attestation.uid}`);

    // 6. Pin to IPFS (async, may return null if IPFS not configured)
    const ipfsCid = await pinAttestationToIPFS(attestation, `model-${model.id}`);

    // 7. Store in database
    await prisma.attestations.create({
      data: {
        uid: attestation.uid,
        schema_uid: EAS_CONFIG.schemas.model.uid,
        schema_type: 'model',
        entity_type: 'model',
        entity_id: model.id,
        attestation_data: JSON.parse(JSON.stringify(attestationData)),
        ipfs_cid: ipfsCid,
        schema_version: EAS_CONFIG.schemas.model.version,
        signer_wallet: adminWallet.address,
        signer_role: 'admin',
        signed_at: new Date(),
        status: 'pending',
      },
    });

    console.log('💾 Attestation saved to database');

    // 8. Update model record
    await prisma.models.update({
      where: { id: modelId },
      data: {
        attestation_uid: attestation.uid,
        ipfs_cid: ipfsCid,
        attestation_status: 'pending',
        attested_by: adminWallet.address,
        attested_at: new Date(),
      },
    });

    console.log('✅ Model updated with attestation references');

    return {
      success: true,
      attestationUid: attestation.uid,
      ipfsCid: ipfsCid || undefined,
    };
  } catch (error) {
    console.error('❌ Error creating model attestation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Creates an instrument attestation for an existing guitar
 *
 * @param guitarId - Individual guitar ID (UUID)
 * @returns Result with attestation UID and IPFS CID
 */
export async function createInstrumentAttestationAction(
  guitarId: string
): Promise<CreateAttestationResult> {
  try {
    console.log(`📝 Creating instrument attestation for guitar ${guitarId}...`);

    // 1. Fetch guitar data
    const guitar = await prisma.individual_guitars.findUnique({
      where: { id: guitarId },
      include: {
        models: true,
      },
    });

    if (!guitar) {
      return { success: false, error: 'Guitar not found' };
    }

    // 2. Check if guitar already has attestation
    if (guitar.attestation_uid) {
      return {
        success: false,
        error: `Guitar already has an attestation: ${guitar.attestation_uid}`,
      };
    }

    // 3. Verify model has attestation (required for instrument attestations)
    if (!guitar.models?.attestation_uid) {
      return {
        success: false,
        error: 'Model must have an attestation before creating instrument attestation',
      };
    }

    // 4. Prepare attestation data
    const attestationData: InstrumentAttestationDataV1 = {
      model_attestation_uid: guitar.models.attestation_uid,
      serial_number: guitar.serial_number || '',
      db_reference_id: guitar.id,
      production_date: guitar.production_date?.toISOString().split('T')[0] || '',
      production_number: guitar.production_number || 0,
      significance_level: guitar.significance_level || 'notable',
      current_condition: guitar.condition_rating || '',
      modifications: guitar.modifications || '',
      provenance_summary: guitar.provenance_notes || '',
    };

    // 5. Get admin signer
    const adminWallet = getAdminSigner();
    console.log(`✍️  Signing with admin wallet: ${adminWallet.address}`);

    // 6. Create offchain attestation
    const attestation = await createInstrumentAttestation(attestationData, adminWallet);
    console.log(`✅ Attestation created with UID: ${attestation.uid}`);

    // 7. Pin to IPFS
    const ipfsCid = await pinAttestationToIPFS(attestation, `instrument-${guitar.id}`);

    // 8. Store in database
    await prisma.attestations.create({
      data: {
        uid: attestation.uid,
        schema_uid: EAS_CONFIG.schemas.instrument.uid,
        schema_type: 'instrument',
        entity_type: 'individual_guitar',
        entity_id: guitar.id,
        attestation_data: JSON.parse(JSON.stringify(attestationData)),
        ipfs_cid: ipfsCid,
        schema_version: EAS_CONFIG.schemas.instrument.version,
        signer_wallet: adminWallet.address,
        signer_role: 'admin',
        signed_at: new Date(),
        status: 'pending',
      },
    });

    console.log('💾 Attestation saved to database');

    // 9. Update guitar record
    await prisma.individual_guitars.update({
      where: { id: guitarId },
      data: {
        attestation_uid: attestation.uid,
        ipfs_cid: ipfsCid,
        attestation_status: 'pending',
        attested_by: adminWallet.address,
        attested_at: new Date(),
      },
    });

    console.log('✅ Guitar updated with attestation references');

    return {
      success: true,
      attestationUid: attestation.uid,
      ipfsCid: ipfsCid || undefined,
    };
  } catch (error) {
    console.error('❌ Error creating instrument attestation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Manufacturer co-signs an attestation
 *
 * @param attestationUid - Attestation UID
 * @param signature - Signature from manufacturer wallet
 * @param walletAddress - Manufacturer wallet address
 * @returns Success result
 */
export async function cosignAttestationAction(
  attestationUid: string,
  signature: string,
  walletAddress: string
): Promise<CreateAttestationResult> {
  try {
    // Normalize wallet address
    const normalizedWallet = walletAddress.toLowerCase();
    console.log(`📝 Processing co-signature for attestation ${attestationUid}...`);
    console.log(`   Wallet: ${normalizedWallet}`);

    // 1. Verify manufacturer wallet is registered
    const manufacturerWallet = await prisma.manufacturer_wallets.findUnique({
      where: { wallet_address: normalizedWallet },
      include: { manufacturers: true },
    });

    if (!manufacturerWallet) {
      return { 
        success: false, 
        error: 'This wallet is not registered as a manufacturer wallet. Please register your wallet first.' 
      };
    }

    if (manufacturerWallet.status !== 'active') {
      return { 
        success: false, 
        error: 'This manufacturer wallet is inactive. Please contact an administrator.' 
      };
    }

    // 2. Fetch attestation
    const attestationRecord = await prisma.attestations.findUnique({
      where: { uid: attestationUid },
    });

    if (!attestationRecord) {
      return { success: false, error: 'Attestation not found' };
    }

    // 3. Check if already co-signed
    if (attestationRecord.status === 'official' && attestationRecord.cosigner_wallet) {
      return { 
        success: false, 
        error: 'This attestation has already been co-signed.' 
      };
    }

    // 4. Verify manufacturer matches model manufacturer (for model attestations)
    if (attestationRecord.schema_type === 'model') {
      const model = await prisma.models.findUnique({
        where: { id: attestationRecord.entity_id },
        include: { manufacturers: true },
      });

      if (!model) {
        return { success: false, error: 'Model not found for this attestation' };
      }

      if (model.manufacturer_id !== manufacturerWallet.manufacturer_id) {
        return { 
          success: false, 
          error: `You can only co-sign attestations for ${manufacturerWallet.manufacturers.name}. This model belongs to a different manufacturer.` 
        };
      }
    }

    // 5. Create and verify co-sign message
    const message = createCosignMessage(attestationUid, attestationRecord.signer_wallet);
    console.log('   Expected message:', message);

    const isValid = verifyManufacturerCosignature(message, signature, normalizedWallet);

    if (!isValid) {
      console.log('   Signature verification failed');
      return { 
        success: false, 
        error: 'Signature verification failed. Please try signing again.' 
      };
    }

    console.log('✅ Signature verified');

    // 5. Update attestation with co-signature
    await prisma.attestations.update({
      where: { uid: attestationUid },
      data: {
        cosigner_wallet: walletAddress,
        cosigner_role: 'manufacturer',
        cosigned_at: new Date(),
        status: 'official',
      },
    });

    // 6. Update entity record (model or guitar)
    if (attestationRecord.entity_type === 'model') {
      await prisma.models.update({
        where: { id: attestationRecord.entity_id },
        data: {
          attestation_status: 'official',
          cosigner_wallet: walletAddress,
          cosigned_at: new Date(),
        },
      });
    } else if (attestationRecord.entity_type === 'individual_guitar') {
      await prisma.individual_guitars.update({
        where: { id: attestationRecord.entity_id },
        data: {
          attestation_status: 'official',
          cosigner_wallet: walletAddress,
          cosigned_at: new Date(),
        },
      });
    }

    console.log('✅ Attestation co-signed successfully');

    return { success: true, attestationUid };
  } catch (error) {
    console.error('❌ Error co-signing attestation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
