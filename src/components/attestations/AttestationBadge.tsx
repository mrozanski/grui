'use client'

import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react'

interface AttestationBadgeProps {
  status: string;
  uid?: string;
}

export function AttestationBadge({ status, uid }: AttestationBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Verified',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'disputed':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          text: 'Disputed',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      default: // pending, unverified
        return {
          variant: 'secondary' as const,
          icon: Clock,
          text: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
      {uid && (
        <span className="text-xs font-mono text-gray-500">
          {uid.slice(0, 8)}...
        </span>
      )}
    </div>
  );
} 