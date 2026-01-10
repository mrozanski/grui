'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WalletRegistrationFormProps {
  manufacturerId: string;
  manufacturerName: string;
}

type RegistrationStep = 'connect' | 'sign' | 'complete' | 'error';

export function WalletRegistrationForm({
  manufacturerId,
  manufacturerName,
}: WalletRegistrationFormProps) {
  const [step, setStep] = useState<RegistrationStep>('connect');
  const [walletAddress, setWalletAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Connect wallet using window.ethereum (MetaMask or similar)
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if ethereum provider exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error(
          'No Ethereum wallet found. Please install MetaMask or another Web3 wallet.'
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

      // Get verification message from API
      const response = await fetch(
        `/api/manufacturers/wallets?get_message=true&manufacturer_id=${manufacturerId}&wallet_address=${address}`
      );
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get verification message');
      }

      setMessage(data.message);
      setNonce(data.nonce);
      setStep('sign');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [manufacturerId]);

  // Sign message and register wallet
  const signAndRegister = useCallback(async () => {
    if (!walletAddress || !message || !nonce) {
      setError('Missing required data. Please reconnect your wallet.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if ethereum provider exists
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Wallet not found');
      }

      // Request signature
      const signature = (await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      })) as string;

      // Register wallet via API
      const response = await fetch('/api/manufacturers/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manufacturer_id: manufacturerId,
          wallet_address: walletAddress,
          signature,
          nonce,
          registered_by: walletAddress,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to register wallet');
      }

      setStep('complete');

      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error signing/registering:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to sign and register'
      );
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, message, nonce, manufacturerId, notes]);

  // Reset form
  const resetForm = useCallback(() => {
    setStep('connect');
    setWalletAddress('');
    setNotes('');
    setError(null);
    setNonce(null);
    setMessage(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-4 text-sm">
        <div
          className={`flex items-center gap-2 ${
            step === 'connect' ? 'text-blue-600 font-medium' : 'text-gray-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
            1
          </span>
          Connect
        </div>
        <div className="h-px w-8 bg-gray-200" />
        <div
          className={`flex items-center gap-2 ${
            step === 'sign' ? 'text-blue-600 font-medium' : 'text-gray-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">
            2
          </span>
          Verify
        </div>
        <div className="h-px w-8 bg-gray-200" />
        <div
          className={`flex items-center gap-2 ${
            step === 'complete' ? 'text-green-600 font-medium' : 'text-gray-400'
          }`}
        >
          <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">
            3
          </span>
          Complete
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Step: Connect */}
      {step === 'connect' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Ethereum wallet to register it for{' '}
            <strong>{manufacturerName}</strong>. This wallet will be able to
            co-sign attestations for this manufacturer&apos;s guitar models.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Primary verification wallet, Marketing team wallet"
                className="mt-1"
              />
            </div>

            <Button onClick={connectWallet} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Sign */}
      {step === 'sign' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-medium text-blue-900 mb-2">
              Connected Wallet
            </p>
            <code className="text-sm bg-white px-2 py-1 rounded border">
              {walletAddress}
            </code>
          </div>

          <p className="text-gray-600">
            Sign the verification message to prove you own this wallet. This
            confirms you&apos;re authorized to register it for{' '}
            <strong>{manufacturerName}</strong>.
          </p>

          {message && (
            <div>
              <Label>Message to sign:</Label>
              <pre className="mt-1 text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                {message}
              </pre>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={signAndRegister} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sign & Register
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step: Complete */}
      {step === 'complete' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Wallet Registered Successfully!
          </h3>
          <p className="text-green-700 mb-4">
            The wallet <code className="bg-white px-2 py-0.5 rounded">{walletAddress}</code> has been
            registered for {manufacturerName}.
          </p>
          <p className="text-sm text-green-600">Refreshing page...</p>
        </div>
      )}

      {/* Step: Error */}
      {step === 'error' && (
        <div className="space-y-4">
          <Button onClick={resetForm} variant="outline">
            Try Again
          </Button>
        </div>
      )}
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

