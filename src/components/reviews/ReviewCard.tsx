'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AttestationBadge } from '@/components/attestations/AttestationBadge'

interface ReviewCardProps {
  review: {
    id: string;
    reviewer_name: string;
    reviewer_credentials?: string;
    review_title: string;
    review_summary: string;
    overall_rating?: number;
    verification_status: string;
    attestation_uid?: string;
    content_archived: boolean;
    original_content_url?: string;
    review_model_associations: {
      models: {
        id: string;
        name: string;
        year: number;
        manufacturers: {
          name: string;
        };
      };
    }[];
  };
  onVerify?: (id: string) => void;
  onEdit?: (id: string) => void;
  showModels?: boolean;
}

export function ReviewCard({ review, onVerify, onEdit, showModels = true }: ReviewCardProps) {
  const associatedModels = review.review_model_associations.map(assoc => assoc.models);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{review.review_title}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{review.reviewer_name}</span>
              {review.overall_rating && (
                <Badge variant="secondary">
                  {review.overall_rating}/10
                </Badge>
              )}
            </div>
          </div>
          <AttestationBadge 
            status={review.verification_status} 
            uid={review.attestation_uid}
          />
        </div>
        
        {showModels && associatedModels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {associatedModels.map(model => (
              <Badge key={model.id} variant="outline" className="text-xs">
                {model.manufacturers.name} {model.name} {model.year}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-700 mb-4">{review.review_summary}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {review.content_archived && (
              <Badge variant="outline" className="text-xs">
                📁 Archived
              </Badge>
            )}
            {review.original_content_url && (
              <a 
                href={review.original_content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Original Source
              </a>
            )}
          </div>
          
          <div className="flex gap-2">
            {onVerify && review.verification_status === 'pending' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onVerify(review.id)}
              >
                Verify
              </Button>
            )}
            {onEdit && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onEdit(review.id)}
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 