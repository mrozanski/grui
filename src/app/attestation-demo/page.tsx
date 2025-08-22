import { AttestationBadge } from '@/components/attestations/AttestationBadge'

export default function AttestationDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Attestation Badge Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the AttestationBadge component with different verification states.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Verification States</h2>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Verified:</span>
              <AttestationBadge 
                status="verified" 
                uid="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Pending:</span>
              <AttestationBadge 
                status="pending" 
                uid="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Disputed:</span>
              <AttestationBadge 
                status="disputed" 
                uid="0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Unverified:</span>
              <AttestationBadge status="unverified" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Without UID</h2>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Verified:</span>
              <AttestationBadge status="verified" />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Pending:</span>
              <AttestationBadge status="pending" />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="w-32 font-medium">Disputed:</span>
              <AttestationBadge status="disputed" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Usage Examples</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">In a Review Card:</h3>
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">Classic Vibe Stratocaster Review</h4>
                  <p className="text-sm text-gray-600">by Trogly&apos;s Guitar Show</p>
                </div>
                <AttestationBadge 
                  status="verified" 
                  uid="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                />
              </div>
              <p className="text-gray-700">
                This guitar punches way above its weight class. The vintage-style appointments 
                and tone are remarkable for the price point...
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-2">In an Event Card:</h3>
            <div className="border rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold">🎵 Led Zeppelin IV Recording Session</h4>
                  <p className="text-sm text-gray-600">1971 • Island Records Studio</p>
                </div>
                <AttestationBadge 
                  status="pending" 
                  uid="0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
                />
              </div>
              <p className="text-gray-700">
                Used for the recording of &apos;Black Dog&apos; and &apos;Rock and Roll&apos;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 