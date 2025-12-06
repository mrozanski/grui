'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AttestationBadge } from './AttestationBadge'
import { CopyButton } from '@/components/ui/copy-button'
import { Shield, ExternalLink } from 'lucide-react'

interface AttestationData {
  attestation_uid: string
  ipfs_cid: string | null
  attestation_status: string | null
  attested_by: string | null
  attested_at: Date | null
  cosigner_wallet: string | null
  cosigned_at: Date | null
}

interface AttestationSectionProps {
  attestation: AttestationData
  entityType: 'model' | 'instrument'
}

function formatDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

function truncateAddress(address: string, startChars = 6, endChars = 4) {
  if (address.length <= startChars + endChars) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export function AttestationSection({ attestation, entityType }: AttestationSectionProps) {
  const ipfsGatewayUrl = attestation.ipfs_cid 
    ? `https://gateway.pinata.cloud/ipfs/${attestation.ipfs_cid}`
    : null

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-emerald-600" />
          Blockchain Attestation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Status Badge */}
        <div>
          <AttestationBadge
            status={attestation.attestation_status || 'pending'}
            uid={attestation.attestation_uid}
          />
        </div>

        {/* Attestation Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Attestation UID */}
          <div className="space-y-1">
            <span className="font-medium text-gray-700">Attestation UID</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-white/80 border border-gray-200 px-2 py-1.5 rounded font-mono text-gray-600 truncate max-w-[200px]">
                {attestation.attestation_uid}
              </code>
              <CopyButton value={attestation.attestation_uid} />
            </div>
          </div>

          {/* IPFS CID */}
          {attestation.ipfs_cid && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">IPFS CID</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white/80 border border-gray-200 px-2 py-1.5 rounded font-mono text-gray-600 truncate max-w-[180px]">
                  {attestation.ipfs_cid}
                </code>
                <CopyButton value={attestation.ipfs_cid} />
                {ipfsGatewayUrl && (
                  <a
                    href={ipfsGatewayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 transition-colors"
                    title="View on IPFS"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Attested By */}
          {attestation.attested_by && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Attested By</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white/80 border border-gray-200 px-2 py-1.5 rounded font-mono text-gray-600">
                  {truncateAddress(attestation.attested_by)}
                </code>
                <CopyButton value={attestation.attested_by} />
                {attestation.attested_at && (
                  <span className="text-xs text-gray-500">
                    {formatDate(attestation.attested_at)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Manufacturer Verification (Co-signer) */}
          {attestation.cosigner_wallet && (
            <div className="space-y-1">
              <span className="font-medium text-gray-700">Manufacturer Verified</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white/80 border border-gray-200 px-2 py-1.5 rounded font-mono text-gray-600">
                  {truncateAddress(attestation.cosigner_wallet)}
                </code>
                <CopyButton value={attestation.cosigner_wallet} />
                {attestation.cosigned_at && (
                  <span className="text-xs text-gray-500">
                    {formatDate(attestation.cosigned_at)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Explanatory Footer */}
        <div className="pt-3 border-t border-emerald-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            This {entityType} has been cryptographically attested using the Ethereum Attestation Service (EAS).
            {attestation.ipfs_cid && ' The attestation data is stored on IPFS for permanent, decentralized access.'}
            {attestation.cosigner_wallet && ' This attestation has been verified by the manufacturer.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}


