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
          variant: 'success' as const,
          icon: CheckCircle,
          text: 'Verified'
        };
      case 'disputed':
        return {
          variant: 'error' as const,
          icon: AlertTriangle,
          text: 'Disputed'
        };
      default: // pending, unverified
        return {
          variant: 'warning' as const,
          icon: Clock,
          text: 'Pending'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
      {uid && (
        <span className="text-xs font-mono text-muted-foreground">
          {uid.slice(0, 8)}...
        </span>
      )}
    </div>
  );
} 