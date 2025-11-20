/**
 * IPFS Client Configuration
 *
 * Handles connection to Pinata IPFS service for decentralized storage
 * of attestation data.
 */

/**
 * Pinata configuration
 */
export const PINATA_CONFIG = {
  apiKey: process.env.PINATA_API_KEY,
  secretKey: process.env.PINATA_SECRET_KEY,
  jwt: process.env.PINATA_JWT,
  gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud',
  apiUrl: 'https://api.pinata.cloud',
} as const;

/**
 * Check if Pinata is configured
 */
export function isPinataConfigured(): boolean {
  // Can use either API Key/Secret or JWT
  return !!(
    (PINATA_CONFIG.apiKey && PINATA_CONFIG.secretKey) ||
    PINATA_CONFIG.jwt
  );
}

/**
 * Pinata pin response type
 */
export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Pins JSON data to IPFS via Pinata
 *
 * @param data - Data to pin (will be JSON stringified)
 * @param name - Optional name for the pinned content
 * @returns IPFS CID (hash)
 */
export async function pinJSONToIPFS(
  data: unknown,
  name?: string
): Promise<string> {
  if (!isPinataConfigured()) {
    throw new Error(
      'Pinata is not configured. Please set PINATA_API_KEY and PINATA_SECRET_KEY or PINATA_JWT in environment variables. See PINATA_SETUP.md for instructions.'
    );
  }

  try {
    const url = `${PINATA_CONFIG.apiUrl}/pinning/pinJSONToIPFS`;

    const body = {
      pinataContent: data,
      pinataMetadata: {
        name: name || `attestation-${Date.now()}`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    };

    // Prepare headers based on authentication method
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (PINATA_CONFIG.jwt) {
      headers['Authorization'] = `Bearer ${PINATA_CONFIG.jwt}`;
    } else {
      headers['pinata_api_key'] = PINATA_CONFIG.apiKey!;
      headers['pinata_secret_api_key'] = PINATA_CONFIG.secretKey!;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pinata API error: ${response.status} - ${errorText}`);
    }

    const result = (await response.json()) as PinataResponse;
    return result.IpfsHash;
  } catch (error) {
    console.error('Error pinning to IPFS:', error);
    throw new Error(`Failed to pin to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves data from IPFS via Pinata gateway
 *
 * @param cid - IPFS CID (hash)
 * @returns Retrieved data
 */
export async function getFromIPFS<T = unknown>(cid: string): Promise<T> {
  try {
    const url = `${PINATA_CONFIG.gateway}/ipfs/${cid}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw new Error(`Failed to retrieve from IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Tests Pinata authentication
 *
 * @returns True if authentication is successful
 */
export async function testPinataAuth(): Promise<boolean> {
  if (!isPinataConfigured()) {
    return false;
  }

  try {
    const url = `${PINATA_CONFIG.apiUrl}/data/testAuthentication`;

    const headers: Record<string, string> = {};

    if (PINATA_CONFIG.jwt) {
      headers['Authorization'] = `Bearer ${PINATA_CONFIG.jwt}`;
    } else {
      headers['pinata_api_key'] = PINATA_CONFIG.apiKey!;
      headers['pinata_secret_api_key'] = PINATA_CONFIG.secretKey!;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    return response.ok;
  } catch (error) {
    console.error('Error testing Pinata auth:', error);
    return false;
  }
}

/**
 * Unpins content from Pinata (removes from IPFS)
 *
 * @param cid - IPFS CID to unpin
 * @returns True if successful
 */
export async function unpinFromIPFS(cid: string): Promise<boolean> {
  if (!isPinataConfigured()) {
    throw new Error('Pinata is not configured');
  }

  try {
    const url = `${PINATA_CONFIG.apiUrl}/pinning/unpin/${cid}`;

    const headers: Record<string, string> = {};

    if (PINATA_CONFIG.jwt) {
      headers['Authorization'] = `Bearer ${PINATA_CONFIG.jwt}`;
    } else {
      headers['pinata_api_key'] = PINATA_CONFIG.apiKey!;
      headers['pinata_secret_api_key'] = PINATA_CONFIG.secretKey!;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    return response.ok;
  } catch (error) {
    console.error('Error unpinning from IPFS:', error);
    return false;
  }
}
