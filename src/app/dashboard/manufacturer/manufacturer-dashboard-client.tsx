'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CosignButton } from '@/components/attestations/CosignButton';
import {
  Wallet,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileCheck,
  Clock,
} from 'lucide-react';

interface AttestationData {
  manufacturer_name: string;
  product_line_name: string;
  model_name: string;
  year: number;
  db_reference_id: string;
  production_type?: string;
  original_msrp?: string;
  currency?: string;
  description?: string;
}

interface PendingAttestation {
  id: string;
  uid: string;
  schema_type: string;
  entity_type: string;
  entity_id: string;
  attestation_data: AttestationData;
  ipfs_cid: string | null;
  signer_wallet: string;
  signed_at: string;
  status: string;
}

interface ManufacturerInfo {
  id: string;
  name: string;
  country: string | null;
}

type DashboardState = 'disconnected' | 'connecting' | 'loading' | 'connected' | 'error';

export function ManufacturerDashboardClient() {
  const [state, setState] = useState<DashboardState>('disconnected');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [manufacturer, setManufacturer] = useState<ManufacturerInfo | null>(null);
  const [pendingAttestations, setPendingAttestations] = useState<PendingAttestation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Connect wallet and load manufacturer data
  const connectWallet = useCallback(async () => {
    setState('connecting');
    setError(null);

    try {
      // Check if ethereum provider exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          'Please install MetaMask or another Web3 wallet to access the manufacturer dashboard.'
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      const address = accounts[0];
      setWalletAddress(address);

      // Load manufacturer and attestations
      await loadManufacturerData(address);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setState('error');
    }
  }, []);

  // Load manufacturer data and pending attestations
  const loadManufacturerData = async (address: string) => {
    setState('loading');

    try {
      // Fetch manufacturer info and pending attestations
      const response = await fetch(
        `/api/dashboard/manufacturer?wallet_address=${address}`
      );
      const data = await response.json();

      if (!data.success) {
        if (data.error === 'Wallet not registered') {
          throw new Error(
            'This wallet is not registered as a manufacturer wallet. Please contact an administrator to register your wallet.'
          );
        }
        throw new Error(data.error || 'Failed to load manufacturer data');
      }

      setManufacturer(data.manufacturer);
      setPendingAttestations(data.pendingAttestations || []);
      setState('connected');
    } catch (err) {
      console.error('Error loading manufacturer data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setState('error');
    }
  };

  // Refresh attestations
  const refreshAttestations = useCallback(async () => {
    if (!walletAddress) return;

    setRefreshing(true);
    try {
      await loadManufacturerData(walletAddress);
    } finally {
      setRefreshing(false);
    }
  }, [walletAddress]);

  // Handle successful co-sign
  const handleCosignSuccess = useCallback(() => {
    // Refresh after a short delay
    setTimeout(() => {
      refreshAttestations();
    }, 1000);
  }, [refreshAttestations]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setManufacturer(null);
    setPendingAttestations([]);
    setState('disconnected');
    setError(null);
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum?.on) {
      const handleAccountsChanged = (accounts: unknown) => {
        const accts = accounts as string[];
        if (accts.length === 0) {
          disconnectWallet();
        } else if (accts[0] !== walletAddress) {
          setWalletAddress(accts[0]);
          loadManufacturerData(accts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
  }, [walletAddress, disconnectWallet]);

  // Render disconnected state
  if (state === 'disconnected') {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Connect your registered manufacturer wallet to view pending
          attestations and co-sign guitar model verifications.
        </p>
        <Button onClick={connectWallet} size="lg">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Render connecting/loading state
  if (state === 'connecting' || state === 'loading') {
    return (
      <div className="bg-white border rounded-lg p-8 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">
          {state === 'connecting' ? 'Connecting wallet...' : 'Loading manufacturer data...'}
        </p>
      </div>
    );
  }

  // Render error state
  if (state === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Unable to Access Dashboard
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={connectWallet} variant="outline">
                Try Again
              </Button>
              <Button onClick={disconnectWallet} variant="ghost">
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render connected state
  return (
    <div className="space-y-6">
      {/* Manufacturer Info */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{manufacturer?.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Wallet className="w-3 h-3" />
                <code>{walletAddress?.slice(0, 8)}...{walletAddress?.slice(-6)}</code>
                <Badge variant="success">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      </div>

      {/* Pending Attestations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Attestations ({pendingAttestations.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshAttestations}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {pendingAttestations.length === 0 ? (
          <div className="bg-gray-50 border border-dashed rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              All Caught Up!
            </h4>
            <p className="text-gray-500 text-sm">
              There are no pending attestations requiring your signature.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAttestations.map((attestation) => (
              <PendingAttestationCard
                key={attestation.uid}
                attestation={attestation}
                onCosignSuccess={handleCosignSuccess}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PendingAttestationCardProps {
  attestation: PendingAttestation;
  onCosignSuccess: () => void;
}

function PendingAttestationCard({
  attestation,
  onCosignSuccess,
}: PendingAttestationCardProps) {
  const data = attestation.attestation_data;
  const signedDate = new Date(attestation.signed_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Model Info */}
          <h4 className="font-semibold text-lg mb-1">
            {data.model_name} ({data.year})
          </h4>
          <p className="text-gray-600 text-sm mb-3">
            {data.product_line_name} • {data.production_type || 'Standard Production'}
          </p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {data.original_msrp && (
              <div>
                <span className="text-gray-500">MSRP:</span>{' '}
                <span className="font-medium">
                  {data.currency || '$'}{data.original_msrp}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Created:</span>{' '}
              <span className="font-medium">{signedDate}</span>
            </div>
          </div>

          {/* Attestation UID */}
          <div className="mt-3 pt-3 border-t">
            <span className="text-xs text-gray-500">Attestation UID: </span>
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
              {attestation.uid.slice(0, 16)}...
            </code>
          </div>
        </div>

        {/* Co-sign Button */}
        <div className="flex-shrink-0">
          <CosignButton
            attestationUid={attestation.uid}
            signerWallet={attestation.signer_wallet}
            onSuccess={onCosignSuccess}
          />
        </div>
      </div>
    </div>
  );
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

