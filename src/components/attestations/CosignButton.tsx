'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, AlertCircle, Pen } from 'lucide-react';

interface CosignButtonProps {
  attestationUid: string;
  signerWallet: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

type CosignStep = 'idle' | 'connecting' | 'signing' | 'submitting' | 'success' | 'error';

export function CosignButton({
  attestationUid,
  signerWallet,
  onSuccess,
  disabled = false,
}: CosignButtonProps) {
  const [step, setStep] = useState<CosignStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const handleCosign = useCallback(async () => {
    setError(null);
    setStep('connecting');

    try {
      // 1. Check if ethereum provider exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Please install MetaMask or another Web3 wallet');
      }

      // 2. Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || (accounts as string[]).length === 0) {
        throw new Error('No accounts found');
      }

      const walletAddress = (accounts as string[])[0];
      setConnectedAddress(walletAddress);

      // 3. Create co-sign message (must match server's createCosignMessage exactly)
      setStep('signing');
      const message = JSON.stringify(
        {
          action: 'cosign_attestation',
          attestation_uid: attestationUid,
          original_signer: signerWallet.toLowerCase(),
          cosigner_role: 'manufacturer',
        },
        null,
        2
      );

      // 4. Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      // 5. Submit to API
      setStep('submitting');
      const response = await fetch('/api/attestations/cosign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attestation_uid: attestationUid,
          signature,
          wallet_address: walletAddress,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to co-sign attestation');
      }

      setStep('success');
      onSuccess?.();
    } catch (err) {
      console.error('Error co-signing:', err);
      setError(err instanceof Error ? err.message : 'Failed to co-sign');
      setStep('error');
    }
  }, [attestationUid, signerWallet, onSuccess]);

  const reset = useCallback(() => {
    setStep('idle');
    setError(null);
    setConnectedAddress(null);
  }, []);

  // Render based on step
  if (step === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Co-signed!</span>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="flex flex-col gap-2 max-w-xs">
        <div className="flex items-start gap-2 text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
        <Button variant="outline" size="sm" onClick={reset}>
          Try Again
        </Button>
      </div>
    );
  }

  const isLoading = ['connecting', 'signing', 'submitting'].includes(step);

  const getButtonText = () => {
    switch (step) {
      case 'connecting':
        return 'Connecting...';
      case 'signing':
        return 'Sign in wallet...';
      case 'submitting':
        return 'Submitting...';
      default:
        return 'Co-sign';
    }
  };

  return (
    <Button
      onClick={handleCosign}
      disabled={disabled || isLoading}
      size="sm"
      variant="default"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {getButtonText()}
        </>
      ) : (
        <>
          <Pen className="w-4 h-4 mr-2" />
          Co-sign
        </>
      )}
    </Button>
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

