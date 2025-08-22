# Guitar Registry Attestations UI Development Specification v10

## Overview

This specification defines the scope for adding attestation capabilities to the Guitar Registry NextJS application with many-to-many review-to-model relationships. The goal is to demonstrate how attestations will work without implementing actual EAS integration or IPFS storage. All attestation data will be stored in the existing PostgreSQL database with dummy/mock content.

## Phase 1 Scope: Minimal Viable Attestation Demo

### Core Attestation Types to Implement
1. **Expert Reviews** (attached to one or more Models via many-to-many)
2. **Historical Events** (attached to Individual Guitars, extending existing notable_associations)

### Database Schema Extensions

#### 1. Expert Reviews Table (Many-to-Many Support)
```sql
-- Add to your existing schema
CREATE TABLE expert_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_credentials TEXT,
    review_title VARCHAR(200) NOT NULL,
    review_summary TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'review' CHECK (content_type IN ('review', 'comparison', 'overview')),
    
    -- Ratings (optional for some content types)
    condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
    build_quality_rating INTEGER CHECK (build_quality_rating BETWEEN 1 AND 10),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 10),
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
    
    -- Attestation simulation fields
    original_content_url VARCHAR(500), -- YouTube/source URL
    content_archived BOOLEAN DEFAULT FALSE,
    content_hash VARCHAR(64), -- Simulated IPFS hash
    attestation_uid VARCHAR(66), -- Simulated EAS UID
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'disputed')),
    
    -- Metadata
    review_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many model relationships
CREATE TABLE review_model_associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    review_id UUID REFERENCES expert_reviews(id) ON DELETE CASCADE,
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, model_id)
);

-- Indexes
CREATE INDEX idx_expert_reviews_reviewer ON expert_reviews(reviewer_name);
CREATE INDEX idx_expert_reviews_verification ON expert_reviews(verification_status);
CREATE INDEX idx_expert_reviews_type ON expert_reviews(content_type);
CREATE INDEX idx_review_model_associations_review ON review_model_associations(review_id);
CREATE INDEX idx_review_model_associations_model ON review_model_associations(model_id);
```

#### 2. Historical Events Table (Extension of notable_associations)
```sql
-- Extend existing notable_associations table
ALTER TABLE notable_associations ADD COLUMN event_type VARCHAR(50) DEFAULT 'ownership';
ALTER TABLE notable_associations ADD COLUMN event_title VARCHAR(200);
ALTER TABLE notable_associations ADD COLUMN event_description TEXT;
ALTER TABLE notable_associations ADD COLUMN event_date DATE;
ALTER TABLE notable_associations ADD COLUMN venue_name VARCHAR(200);
ALTER TABLE notable_associations ADD COLUMN recording_title VARCHAR(200);

-- Attestation simulation fields
ALTER TABLE notable_associations ADD COLUMN evidence_url VARCHAR(500);
ALTER TABLE notable_associations ADD COLUMN evidence_hash VARCHAR(64);
ALTER TABLE notable_associations ADD COLUMN attestation_uid VARCHAR(66);
ALTER TABLE notable_associations ADD COLUMN attestor_name VARCHAR(100);
ALTER TABLE notable_associations ADD COLUMN attestor_relationship VARCHAR(50);

-- Update check constraint to include new event types
ALTER TABLE notable_associations DROP CONSTRAINT IF EXISTS check_event_type;
ALTER TABLE notable_associations ADD CONSTRAINT check_event_type 
    CHECK (event_type IN ('ownership', 'performance', 'recording', 'tv_appearance', 'photo_session', 'auction'));
```

### Prisma Schema Updates

After updating the PostgreSQL schema, regenerate Prisma models:

```bash
npx prisma db pull
npx prisma generate
```

#### Updated Prisma Relations (Many-to-Many)
```typescript
// Add to prisma/schema.prisma after db pull
model models {
  // ... existing fields
  review_model_associations review_model_associations[]
}

model individual_guitars {
  // ... existing fields
  // notable_associations will automatically include new fields
}

model expert_reviews {
  id                        String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  reviewer_name             String    @db.VarChar(100)
  reviewer_credentials      String?
  review_title              String    @db.VarChar(200)
  review_summary            String
  content_type              String?   @default("review") @db.VarChar(50)
  condition_rating          Int?
  build_quality_rating      Int?
  value_rating              Int?
  overall_rating            Int?
  original_content_url      String?   @db.VarChar(500)
  content_archived          Boolean?  @default(false)
  content_hash              String?   @db.VarChar(64)
  attestation_uid           String?   @db.VarChar(66)
  verification_status       String?   @default("pending") @db.VarChar(20)
  review_date               DateTime  @db.Date
  created_at                DateTime? @default(now()) @db.Timestamptz(6)
  updated_at                DateTime? @default(now()) @db.Timestamptz(6)
  
  review_model_associations review_model_associations[]
}

model review_model_associations {
  id         String   @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  review_id  String   @db.Uuid
  model_id   String   @db.Uuid
  created_at DateTime? @default(now()) @db.Timestamptz(6)
  
  expert_reviews expert_reviews @relation(fields: [review_id], references: [id], onDelete: Cascade)
  models         models          @relation(fields: [model_id], references: [id], onDelete: Cascade)
  
  @@unique([review_id, model_id])
}
```

### Server Actions for Data Mutations

#### Expert Reviews Actions (Many-to-Many Support)
```typescript
// src/lib/actions/reviews.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createExpertReview(data: {
  modelIds: string[]; // Array of model IDs for many-to-many
  reviewerName: string;
  reviewerCredentials?: string;
  reviewTitle: string;
  reviewSummary: string;
  contentType?: string;
  conditionRating?: number;
  buildQualityRating?: number;
  valueRating?: number;
  overallRating?: number;
  originalContentUrl?: string;
  reviewDate: string;
}) {
  try {
    // Create the review first
    const review = await prisma.expert_reviews.create({
      data: {
        reviewer_name: data.reviewerName,
        reviewer_credentials: data.reviewerCredentials,
        review_title: data.reviewTitle,
        review_summary: data.reviewSummary,
        content_type: data.contentType || 'review',
        condition_rating: data.conditionRating,
        build_quality_rating: data.buildQualityRating,
        value_rating: data.valueRating,
        overall_rating: data.overallRating,
        original_content_url: data.originalContentUrl,
        review_date: new Date(data.reviewDate),
      }
    });

    // Create associations for each model
    await prisma.review_model_associations.createMany({
      data: data.modelIds.map(modelId => ({
        review_id: review.id,
        model_id: modelId
      }))
    });
    
    // Revalidate all affected model pages
    data.modelIds.forEach(modelId => {
      revalidatePath(`/models/${modelId}`);
    });
    
    return { success: true, review };
  } catch (error) {
    return { success: false, error: 'Failed to create review' };
  }
}

export async function simulateContentArchival(reviewId: string) {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const fakeHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
  const fakeUID = `0x${Math.random().toString(16).substring(2, 18)}...`;
  
  await prisma.expert_reviews.update({
    where: { id: reviewId },
    data: {
      content_archived: true,
      content_hash: fakeHash,
      attestation_uid: fakeUID,
    }
  });
  
  revalidatePath('/models');
  return { content_hash: fakeHash, attestation_uid: fakeUID };
}

export async function verifyReview(reviewId: string) {
  await prisma.expert_reviews.update({
    where: { id: reviewId },
    data: { verification_status: 'verified' }
  });
  
  revalidatePath('/models');
}

export async function updateReviewModelAssociations(reviewId: string, modelIds: string[]) {
  // Remove existing associations
  await prisma.review_model_associations.deleteMany({
    where: { review_id: reviewId }
  });
  
  // Create new associations
  await prisma.review_model_associations.createMany({
    data: modelIds.map(modelId => ({
      review_id: reviewId,
      model_id: modelId
    }))
  });
  
  // Revalidate affected pages
  modelIds.forEach(modelId => {
    revalidatePath(`/models/${modelId}`);
  });
}
```

#### Historical Events Actions  
```typescript
// src/lib/actions/events.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createHistoricalEvent(data: {
  guitarId: string;
  eventType: string;
  eventTitle?: string;
  eventDescription?: string;
  eventDate?: string;
  venueName?: string;
  personName: string;
  attestorName?: string;
  attestorRelationship?: string;
  evidenceUrl?: string;
}) {
  try {
    const event = await prisma.notable_associations.create({
      data: {
        individual_guitar_id: data.guitarId,
        person_name: data.personName,
        event_type: data.eventType,
        event_title: data.eventTitle,
        event_description: data.eventDescription,
        event_date: data.eventDate ? new Date(data.eventDate) : null,
        venue_name: data.venueName,
        attestor_name: data.attestorName,
        attestor_relationship: data.attestorRelationship,
        evidence_url: data.evidenceUrl,
      }
    });
    
    revalidatePath(`/guitars/${data.guitarId}`);
    return { success: true, event };
  } catch (error) {
    return { success: false, error: 'Failed to create event' };
  }
}

export async function simulateEventAttestation(eventId: string) {
  const fakeHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
  const fakeUID = `0x${Math.random().toString(16).substring(2, 18)}...`;
  
  await prisma.notable_associations.update({
    where: { id: eventId },
    data: {
      evidence_hash: fakeHash,
      attestation_uid: fakeUID,
      verification_status: 'verified'
    }
  });
  
  revalidatePath('/guitars');
  return { evidence_hash: fakeHash, attestation_uid: fakeUID };
}
```

### Data Fetching Functions

#### Expert Reviews Data Fetchers (Many-to-Many Support)
```typescript
// src/lib/data/reviews.ts
import { prisma } from '@/lib/prisma'

export async function getModelReviews(modelId: string) {
  return await prisma.expert_reviews.findMany({
    where: {
      review_model_associations: {
        some: { model_id: modelId }
      }
    },
    include: {
      review_model_associations: {
        include: {
          models: {
            include: {
              manufacturers: true
            }
          }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}

export async function getModelWithReviews(modelId: string) {
  return await prisma.models.findUnique({
    where: { id: modelId },
    include: {
      manufacturers: true,
      product_lines: true,
      review_model_associations: {
        include: {
          expert_reviews: {
            include: {
              review_model_associations: {
                include: {
                  models: {
                    include: {
                      manufacturers: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          expert_reviews: {
            created_at: 'desc'
          }
        }
      }
    }
  });
}

export async function getRelatedModels(manufacturerId: string, modelName: string) {
  // Helper function to find models with same name across different years
  return await prisma.models.findMany({
    where: {
      manufacturer_id: manufacturerId,
      name: {
        contains: modelName,
        mode: 'insensitive'
      }
    },
    include: {
      manufacturers: true
    },
    orderBy: { year: 'asc' }
  });
}

export async function getReviewWithModels(reviewId: string) {
  return await prisma.expert_reviews.findUnique({
    where: { id: reviewId },
    include: {
      review_model_associations: {
        include: {
          models: {
            include: {
              manufacturers: true
            }
          }
        }
      }
    }
  });
}
```

#### Historical Events Data Fetchers
```typescript
// src/lib/data/events.ts
import { prisma } from '@/lib/prisma'

export async function getGuitarEvents(guitarId: string) {
  return await prisma.notable_associations.findMany({
    where: { individual_guitar_id: guitarId },
    orderBy: { event_date: 'asc' }
  });
}

export async function getGuitarWithEvents(guitarId: string) {
  return await prisma.individual_guitars.findUnique({
    where: { id: guitarId },
    include: {
      models: {
        include: { manufacturers: true }
      },
      notable_associations: {
        orderBy: { event_date: 'asc' }
      }
    }
  });
}
```

### Frontend Components to Build

#### 1. Expert Reviews Components

##### ReviewCard Component
```typescript
// src/components/reviews/ReviewCard.tsx
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
```

##### CreateReviewModal Component
```typescript
// src/components/reviews/CreateReviewModal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createExpertReview, simulateContentArchival } from '@/lib/actions/reviews'

interface CreateReviewModalProps {
  initialModelId: string;
  relatedModels: {
    id: string;
    name: string;
    year: number;
    manufacturers: { name: string };
  }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReviewModal({ 
  initialModelId, 
  relatedModels, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([initialModelId]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    const result = await createExpertReview({
      modelIds: selectedModelIds,
      reviewerName: formData.get('reviewerName') as string,
      reviewerCredentials: formData.get('reviewerCredentials') as string,
      reviewTitle: formData.get('reviewTitle') as string,
      reviewSummary: formData.get('reviewSummary') as string,
      conditionRating: Number(formData.get('conditionRating')),
      buildQualityRating: Number(formData.get('buildQualityRating')),
      valueRating: Number(formData.get('valueRating')),
      overallRating: Number(formData.get('overallRating')),
      originalContentUrl: formData.get('originalContentUrl') as string,
      reviewDate: formData.get('reviewDate') as string,
    });
    
    if (result.success) {
      setReviewId(result.review.id);
    }
    
    setIsSubmitting(false);
  };

  const handleArchiveContent = async () => {
    if (!reviewId) return;
    
    setIsArchiving(true);
    await simulateContentArchival(reviewId);
    setIsArchiving(false);
    onSuccess();
  };

  const handleModelSelection = (modelId: string, checked: boolean) => {
    if (checked) {
      setSelectedModelIds(prev => [...prev, modelId]);
    } else {
      setSelectedModelIds(prev => prev.filter(id => id !== modelId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Expert Review</DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              This review applies to: (select all that apply)
            </Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto border rounded p-3">
              {relatedModels.map(model => (
                <div key={model.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`model-${model.id}`}
                    checked={selectedModelIds.includes(model.id)}
                    onCheckedChange={(checked) => 
                      handleModelSelection(model.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`model-${model.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {model.manufacturers.name} {model.name} {model.year}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="reviewerName">Reviewer Name *</Label>
              <Input 
                id="reviewerName" 
                name="reviewerName" 
                required 
                placeholder="e.g., Trogly's Guitar Show"
              />
            </div>
            <div>
              <Label htmlFor="reviewerCredentials">Credentials</Label>
              <Input 
                id="reviewerCredentials" 
                name="reviewerCredentials" 
                placeholder="e.g., Professional appraiser, 500K+ subscribers"
              />
            </div>
          </div>

          {/* Review Content */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="reviewTitle">Review Title *</Label>
              <Input 
                id="reviewTitle" 
                name="reviewTitle" 
                required 
                placeholder="e.g., Classic Vibe Stratocaster - Great Value Guitar"
              />
            </div>
            <div>
              <Label htmlFor="reviewSummary">Review Summary *</Label>
              <Textarea 
                id="reviewSummary" 
                name="reviewSummary" 
                required
                rows={4}
                placeholder="Detailed review content..."
              />
            </div>
            <div>
              <Label htmlFor="originalContentUrl">Original Content URL</Label>
              <Input 
                id="originalContentUrl" 
                name="originalContentUrl" 
                type="url"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="conditionRating">Condition Rating (1-10)</Label>
              <Input 
                id="conditionRating" 
                name="conditionRating" 
                type="number" 
                min="1" 
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="buildQualityRating">Build Quality (1-10)</Label>
              <Input 
                id="buildQualityRating" 
                name="buildQualityRating" 
                type="number" 
                min="1" 
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="valueRating">Value Rating (1-10)</Label>
              <Input 
                id="valueRating" 
                name="valueRating" 
                type="number" 
                min="1" 
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="overallRating">Overall Rating (1-10)</Label>
              <Input 
                id="overallRating" 
                name="overallRating" 
                type="number" 
                min="1" 
                max="10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reviewDate">Review Date *</Label>
            <Input 
              id="reviewDate" 
              name="reviewDate" 
              type="date" 
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedModelIds.length === 0}
            >
              {isSubmitting ? 'Creating...' : 'Create Review'}
            </Button>
            
            {reviewId && (
              <Button 
                type="button"
                variant="secondary"
                onClick={handleArchiveContent}
                disabled={isArchiving}
              >
                {isArchiving ? 'Archiving...' : 'Archive Content'}
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

##### ReviewsList Component
```typescript
// src/components/reviews/ReviewsList.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ReviewCard } from './ReviewCard'
import { CreateReviewModal } from './CreateReviewModal'
import { getRelatedModels } from '@/lib/data/reviews'

interface ReviewsListProps {
  modelId: string;
  modelName: string;
  manufacturerId: string;
  reviews: any[]; // Type from your Prisma query
  canAddReview: boolean;
}

export function ReviewsList({ 
  modelId, 
  modelName, 
  manufacturerId,
  reviews, 
  canAddReview 
}: ReviewsListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [relatedModels, setRelatedModels] = useState<any[]>([]);

  const handleAddReview = async () => {
    // Fetch related models for the modal
    const related = await getRelatedModels(manufacturerId, modelName);
    setRelatedModels(related);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Expert Reviews ({reviews.length})
        </h3>
        {canAddReview && (
          <Button onClick={handleAddReview}>
            Add Review
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            showModels={false} // Don't show models on model page
          />
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No reviews yet. {canAddReview && 'Be the first to add one!'}
        </div>
      )}

      <CreateReviewModal
        initialModelId={modelId}
        relatedModels={relatedModels}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          // Refresh page or update state
          window.location.reload();
        }}
      />
    </div>
  );
}
```

#### 2. Historical Events Components

##### EventCard Component
```typescript
// src/components/events/EventCard.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AttestationBadge } from '@/components/attestations/AttestationBadge'

interface EventCardProps {
  event: {
    id: string;
    event_type: string;
    event_title?: string;
    event_description?: string;
    event_date?: Date;
    venue_name?: string;
    person_name: string;
    attestor_name?: string;
    verification_status: string;
    attestation_uid?: string;
    evidence_url?: string;
  };
  onAttest?: (id: string) => void;
  showGuitar?: boolean;
}

export function EventCard({ event, onAttest, showGuitar = false }: EventCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Date unknown';
    return new Date(date).toLocaleDateString();
  };

  const getEventIcon = (type: string) => {
    const icons = {
      performance: '🎸',
      recording: '🎵',
      tv_appearance: '📺',
      photo_session: '📸',
      auction: '🏷️',
      ownership: '👤'
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getEventIcon(event.event_type)}</span>
              <h3 className="text-lg font-semibold">
                {event.event_title || `${event.event_type} event`}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{formatDate(event.event_date)}</span>
              {event.venue_name && (
                <>
                  <span>•</span>
                  <span>{event.venue_name}</span>
                </>
              )}
            </div>
          </div>
          <AttestationBadge 
            status={event.verification_status} 
            uid={event.attestation_uid}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <span className="font-medium">Associated with:</span> {event.person_name}
          </div>
          
          {event.event_description && (
            <p className="text-gray-700">{event.event_description}</p>
          )}
          
          {event.attestor_name && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Attested by:</span> {event.attestor_name}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {event.event_type.replace('_', ' ')}
              </Badge>
              {event.evidence_url && (
                <a 
                  href={event.evidence_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Evidence
                </a>
              )}
            </div>
            
            {onAttest && event.verification_status === 'unverified' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAttest(event.id)}
              >
                Create Attestation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

##### CreateEventModal Component
```typescript
// src/components/events/CreateEventModal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createHistoricalEvent, simulateEventAttestation } from '@/lib/actions/events'

interface CreateEventModalProps {
  guitarId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ guitarId, isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<string>('');

  const eventTypes = [
    { value: 'performance', label: 'Live Performance' },
    { value: 'recording', label: 'Studio Recording' },
    { value: 'tv_appearance', label: 'TV Appearance' },
    { value: 'photo_session', label: 'Photo Session' },
    { value: 'auction', label: 'Auction/Sale' },
    { value: 'ownership', label: 'Ownership Transfer' }
  ];

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    const result = await createHistoricalEvent({
      guitarId,
      eventType: selectedEventType,
      eventTitle: formData.get('eventTitle') as string,
      eventDescription: formData.get('eventDescription') as string,
      eventDate: formData.get('eventDate') as string,
      venueName: formData.get('venueName') as string,
      personName: formData.get('personName') as string,
      attestorName: formData.get('attestorName') as string,
      attestorRelationship: formData.get('attestorRelationship') as string,
      evidenceUrl: formData.get('evidenceUrl') as string,
    });
    
    if (result.success) {
      setEventId(result.event.id);
    }
    
    setIsSubmitting(false);
  };

  const handleCreateAttestation = async () => {
    if (!eventId) return;
    
    setIsAttesting(true);
    await simulateEventAttestation(eventId);
    setIsAttesting(false);
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Historical Event</DialogTitle>
        </DialogHeader>
        
        <form action={handleSubmit} className="space-y-6">
          {/* Event Type */}
          <div>
            <Label htmlFor="eventType">Event Type *</Label>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Event Details */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="eventTitle">Event Title</Label>
              <Input 
                id="eventTitle" 
                name="eventTitle" 
                placeholder="e.g., Led Zeppelin IV Recording Session"
              />
            </div>
            <div>
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea 
                id="eventDescription" 
                name="eventDescription" 
                rows={3}
                placeholder="Detailed description of the event..."
              />
            </div>
          </div>

          {/* Date and Venue */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="eventDate">Event Date</Label>
              <Input 
                id="eventDate" 
                name="eventDate" 
                type="date"
              />
            </div>
            <div>
              <Label htmlFor="venueName">Venue/Location</Label>
              <Input 
                id="venueName" 
                name="venueName" 
                placeholder="e.g., Island Records Studio"
              />
            </div>
          </div>

          {/* Associated Person */}
          <div>
            <Label htmlFor="personName">Associated Person *</Label>
            <Input 
              id="personName" 
              name="personName" 
              required
              placeholder="e.g., Jimmy Page"
            />
          </div>

          {/* Attestor Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="attestorName">Attestor Name</Label>
              <Input 
                id="attestorName" 
                name="attestorName" 
                placeholder="Who is making this claim?"
              />
            </div>
            <div>
              <Label htmlFor="attestorRelationship">Relationship</Label>
              <Input 
                id="attestorRelationship" 
                name="attestorRelationship" 
                placeholder="e.g., bandmate, photographer, venue owner"
              />
            </div>
          </div>

          {/* Evidence */}
          <div>
            <Label htmlFor="evidenceUrl">Evidence URL</Label>
            <Input 
              id="evidenceUrl" 
              name="evidenceUrl" 
              type="url"
              placeholder="Link to photos, documents, or other evidence"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedEventType}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
            
            {eventId && (
              <Button 
                type="button"
                variant="secondary"
                onClick={handleCreateAttestation}
                disabled={isAttesting}
              >
                {isAttesting ? 'Creating Attestation...' : 'Create Attestation'}
              </Button>
            )}
            
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

##### EventsTimeline Component
```typescript
// src/components/events/EventsTimeline.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EventCard } from './EventCard'
import { CreateEventModal } from './CreateEventModal'

interface EventsTimelineProps {
  guitarId: string;
  events: any[]; // Type from your Prisma query
  canAddEvent: boolean;
}

export function EventsTimeline({ guitarId, events, canAddEvent }: EventsTimelineProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sort events by date (earliest first, unknown dates last)
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.event_date && !b.event_date) return 0;
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          Historical Timeline ({events.length} events)
        </h3>
        {canAddEvent && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Add Event
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative">
            {/* Timeline line */}
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200"></div>
            )}
            
            {/* Timeline dot */}
            <div className="absolute left-2 top-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow"></div>
            
            {/* Event card */}
            <div className="ml-12">
              <EventCard event={event} />
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No historical events recorded. {canAddEvent && 'Add the first one!'}
        </div>
      )}

      <CreateEventModal
        guitarId={guitarId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          // Refresh page or update state
          window.location.reload();
        }}
      />
    </div>
  );
}
```

#### 3. Attestation Badge Component

```typescript
// src/components/attestations/AttestationBadge.tsx
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
```

### Page Modifications

#### 1. Model Detail Page Enhancement
```typescript
// src/app/models/[id]/page.tsx
import { getModelWithReviews, getRelatedModels } from '@/lib/data/reviews'
import { ReviewsList } from '@/components/reviews/ReviewsList'

export default async function ModelPage({ params }: { params: { id: string } }) {
  const model = await getModelWithReviews(params.id);
  
  if (!model) {
    return <div>Model not found</div>;
  }

  // Extract reviews from associations
  const reviews = model.review_model_associations.map(assoc => assoc.expert_reviews);
  
  // Calculate review statistics
  const reviewStats = {
    total_reviews: reviews.length,
    average_rating: reviews.reduce((acc, review) => 
      acc + (review.overall_rating || 0), 0) / reviews.length || 0,
    verified_reviews: reviews.filter(r => 
      r.verification_status === 'verified').length,
  };

  return (
    <div className="space-y-8">
      {/* Existing model details */}
      <ModelDetails model={model} />
      
      {/* New Reviews Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Expert Reviews</h2>
          <div className="text-sm text-gray-600">
            {reviewStats.total_reviews} reviews • {reviewStats.average_rating.toFixed(1)} avg rating
          </div>
        </div>
        <ReviewsList 
          modelId={model.id}
          modelName={model.name}
          manufacturerId={model.manufacturer_id} 
          reviews={reviews}
          canAddReview={true} // Based on user permissions
        />
      </section>
    </div>
  );
}
```

#### 2. Individual Guitar Detail Page Enhancement
```typescript
// src/app/guitars/[id]/page.tsx
import { getGuitarWithEvents } from '@/lib/data/events'
import { EventsTimeline } from '@/components/events/EventsTimeline'

export default async function GuitarPage({ params }: { params: { id: string } }) {
  const guitar = await getGuitarWithEvents(params.id);
  
  if (!guitar) {
    return <div>Guitar not found</div>;
  }

  // Calculate provenance summary
  const provenanceSummary = {
    total_events: guitar.notable_associations.length,
    verified_events: guitar.notable_associations.filter(e => 
      e.verification_status === 'verified').length,
    first_known_date: guitar.notable_associations
      .filter(e => e.event_date)
      .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())[0]?.event_date,
    current_status: 'documented' // Based on latest event
  };

  return (
    <div className="space-y-8">
      {/* Existing guitar details */}
      <GuitarDetails guitar={guitar} />
      
      {/* New Historical Events Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Historical Timeline</h2>
          <div className="text-sm text-gray-600">
            {provenanceSummary.total_events} events • {provenanceSummary.verified_events} verified
          </div>
        </div>
        <EventsTimeline 
          guitarId={guitar.id}
          events={guitar.notable_associations}
          canAddEvent={true} // Based on user permissions
        />
      </section>
    </div>
  );
}
```

### Mock Data for Demo

#### Sample Expert Reviews (Many-to-Many)
```typescript
const mockReviews = [
  {
    id: "review-1",
    reviewer_name: "Trogly's Guitar Show",
    reviewer_credentials: "Professional guitar appraiser, 500K+ YouTube subscribers",
    review_title: "Squier Classic Vibe '50s Stratocaster - Incredible Value",
    review_summary: "This guitar punches way above its weight class. The vintage-style appointments and tone are remarkable for the price point...",
    content_type: "review",
    condition_rating: 8,
    build_quality_rating: 8,
    value_rating: 10,
    overall_rating: 9,
    original_content_url: "https://youtube.com/watch?v=example1",
    content_archived: true,
    content_hash: "QmX123abc...",
    attestation_uid: "0x456def...",
    verification_status: "verified",
    review_date: "2024-06-15",
    review_model_associations: [
      {
        models: {
          id: "model-cv50-2023",
          name: "Classic Vibe '50s Stratocaster",
          year: 2023,
          manufacturers: { name: "Squier" }
        }
      },
      {
        models: {
          id: "model-cv50-2024", 
          name: "Classic Vibe '50s Stratocaster",
          year: 2024,
          manufacturers: { name: "Squier" }
        }
      },
      {
        models: {
          id: "model-cv50-2025",
          name: "Classic Vibe '50s Stratocaster", 
          year: 2025,
          manufacturers: { name: "Squier" }
        }
      }
    ]
  }
];
```

#### Sample Historical Events
```typescript
const mockEvents = [
  {
    id: "event-1",
    individual_guitar_id: "guitar-burst-123",
    event_type: "recording",
    event_title: "Led Zeppelin IV Recording Session",
    event_description: "Used for the recording of 'Black Dog' and 'Rock and Roll'",
    event_date: "1971-02-01",
    venue_name: "Island Records Studio",
    person_name: "Jimmy Page",
    attestor_name: "John Paul Jones",
    attestor_relationship: "bandmate",
    evidence_url: "https://example.com/studio-photos",
    evidence_hash: "QmY789xyz...",
    attestation_uid: "0x789ghi...",
    verification_status: "verified"
  }
];
```

### Development Priority

1. **Week 1**: 
   - Database schema changes (SQL + Prisma regeneration)
   - Server actions for reviews and events with many-to-many support
   - Data fetching functions

2. **Week 2**: 
   - ReviewCard, CreateReviewModal components with model selection
   - Integration on model detail pages
   - Basic attestation simulation

3. **Week 3**: 
   - EventCard, CreateEventModal components  
   - EventsTimeline integration on guitar pages
   - Historical events attestation flow

4. **Week 4**: 
   - AttestationBadge and status indicators
   - Mock data seeding with many-to-many relationships
   - UX polish and demo preparation

### Implementation Steps for Coding Agents

1. **Run SQL schema updates** on your PostgreSQL database
2. **Execute `npx prisma db pull && npx prisma generate`** to update Prisma models
3. **Create server actions** in `/src/lib/actions/` with many-to-many support
4. **Create data fetching functions** in `/src/lib/data/` with proper joins
5. **Build React components** with model selection UI
6. **Update model and guitar detail pages** to include new sections
7. **Add mock data** with many-to-many associations
8. **Test the simulation flows** (archival, attestation, verification, model selection)

### Success Criteria

- Stakeholders can see how attestations enhance content credibility
- Clear demonstration of verification workflow
- Reviews appear on all relevant model year pages (many-to-many working)
- Intuitive UI for creating and viewing attestations with model selection
- Professional presentation suitable for investor/partner demos
- Foundation for real EAS integration in future phases

This prototype will effectively communicate the attestation value proposition while solving the discoverability issue and providing a solid foundation for the real implementation.