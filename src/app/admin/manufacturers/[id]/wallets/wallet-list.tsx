'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  CheckCircle,
  XCircle,
  MoreVertical,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { ManufacturerWalletRecord } from '@/lib/data/manufacturer-wallets';

interface WalletListProps {
  wallets: ManufacturerWalletRecord[];
  manufacturerId: string;
}

export function WalletList({ wallets, manufacturerId }: WalletListProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEtherscanUrl = (address: string) => {
    // Use Sepolia for testnet, mainnet for production
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  if (wallets.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed rounded-lg p-8 text-center">
        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No Wallets Registered
        </h3>
        <p className="text-gray-500 text-sm">
          Register a wallet above to enable co-signing of attestations for this
          manufacturer.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Wallet Address */}
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-gray-400" />
                <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded truncate">
                  {wallet.wallet_address}
                </code>
                <button
                  onClick={() => copyAddress(wallet.wallet_address)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="Copy address"
                >
                  {copiedAddress === wallet.wallet_address ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <a
                  href={getEtherscanUrl(wallet.wallet_address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title="View on Etherscan"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>

              {/* Status and Metadata */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Badge
                  variant={wallet.status === 'active' ? 'success' : 'secondary'}
                >
                  {wallet.status === 'active' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
                <span>Registered {formatDate(wallet.registered_at)}</span>
                {wallet.registered_by && (
                  <span>by {wallet.registered_by.slice(0, 10)}...</span>
                )}
              </div>

              {/* Notes */}
              {wallet.notes && (
                <p className="mt-2 text-sm text-gray-600">{wallet.notes}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center">
              <WalletActions walletId={wallet.id} status={wallet.status || 'active'} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface WalletActionsProps {
  walletId: string;
  status: string;
}

function WalletActions({ walletId, status }: WalletActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const toggleStatus = async () => {
    setIsLoading(true);
    try {
      const action = status === 'active' ? 'deactivate' : 'reactivate';
      // TODO: Implement status toggle via API
      console.log(`${action} wallet ${walletId}`);
      window.location.reload();
    } catch (error) {
      console.error('Error toggling wallet status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleStatus}
      disabled={isLoading}
    >
      {status === 'active' ? 'Deactivate' : 'Activate'}
    </Button>
  );
}

