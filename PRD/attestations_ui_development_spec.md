# String Authority Attestations UI Development Specification

## Overview

This specification defines the scope for adding attestation capabilities to the String Authority NextJS application. The goal is to demonstrate how attestations will work without implementing actual EAS integration or IPFS storage. All attestation data will be stored in the existing PostgreSQL database with dummy/mock content.

## Phase 1 Scope: Minimal Viable Attestation Demo

### Core Attestation Types to Implement
1. **Expert Reviews** (attached to Models)
2. **Historical Events** (attached to Individual Guitars, extending existing notable_associations)

### Database Schema Extensions

#### 1. Expert Reviews Table
```sql
-- Add to your existing schema
CREATE TABLE expert_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v7(),
    model_id UUID REFERENCES models(id) NOT NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_credentials TEXT,
    review_title VARCHAR(200) NOT NULL,
    review_summary TEXT NOT NULL,
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

CREATE INDEX idx_expert_reviews_model ON expert_reviews(model_id);
CREATE INDEX idx_expert_reviews_reviewer ON expert_reviews(reviewer_name);
CREATE INDEX idx_expert_reviews_verification ON expert_reviews(verification_status);
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

#### Updated Prisma Relations
```typescript
// Add to prisma/schema.prisma after db pull
model models {
  // ... existing fields
  expert_reviews expert_reviews[]
}

model individual_guitars {
  // ... existing fields
  // notable_associations will automatically include new fields
}

model expert_reviews {
  id                   String    @id @default(dbgenerated("uuid_generate_v7()")) @db.Uuid
  model_id             String    @db.Uuid
  reviewer_name        String    @db.VarChar(100)
  reviewer_credentials String?
  review_title         String    @db.VarChar(200)
  review_summary       String
  condition_rating     Int?
  build_quality_rating Int?
  value_rating         Int?
  overall_rating       Int?
  original_content_url String?   @db.VarChar(500)
  content_archived     Boolean?  @default(false)
  content_hash         String?   @db.VarChar(64)
  attestation_uid      String?   @db.VarChar(66)
  verification_status  String?   @default("pending") @db.VarChar(20)
  review_date          DateTime  @db.Date
  created_at           DateTime? @default(now()) @db.Timestamptz(6)
  updated_at           DateTime? @default(now()) @db.Timestamptz(6)
  
  models models @relation(fields: [model_id], references: [id], onDelete: NoAction, onUpdate: NoAction)
}
```

### Server Actions for Data Mutations

#### Expert Reviews Actions
```typescript
// src/lib/actions/reviews.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createExpertReview(data: {
  modelId: string;
  reviewerName: string;
  reviewerCredentials?: string;
  reviewTitle: string;
  reviewSummary: string;
  conditionRating?: number;
  buildQualityRating?: number;
  valueRating?: number;
  overallRating?: number;
  originalContentUrl?: string;
  reviewDate: string;
}) {
  try {
    const review = await prisma.expert_reviews.create({
      data: {
        model_id: data.modelId,
        reviewer_name: data.reviewerName,
        reviewer_credentials: data.reviewerCredentials,
        review_title: data.reviewTitle,
        review_summary: data.reviewSummary,
        condition_rating: data.conditionRating,
        build_quality_rating: data.buildQualityRating,
        value_rating: data.valueRating,
        overall_rating: data.overallRating,
        original_content_url: data.originalContentUrl,
        review_date: new Date(data.reviewDate),
      }
    });
    
    revalidatePath(`/models/${data.modelId}`);
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

#### 1. Expert Reviews Components

##### ReviewCard Component
```typescript
// src/components/reviews/ReviewCard.tsx
interface ReviewCardProps {
  review: ExpertReview;
  onVerify?: (id: string) => void;
  onEdit?: (id: string) => void;
}

// Features:
// - Display reviewer info and credentials
// - Show ratings (condition, build quality, value, overall)
// - Display verification status with badge
// - Show original content link and archived status
// - Action buttons for verify/edit (if user has permissions)
```

##### CreateReviewModal Component
```typescript
// src/components/reviews/CreateReviewModal.tsx
'use client'

import { useState } from 'react'
import { createExpertReview, simulateContentArchival } from '@/lib/actions/reviews'

interface CreateReviewModalProps {
  modelId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReviewModal({ modelId, isOpen, onClose, onSuccess }: CreateReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    const result = await createExpertReview({
      modelId,
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

  // Form JSX with all fields
  // Archive Content button that calls handleArchiveContent
  // Shows progress states for submission and archiving
}
```

##### ReviewsList Component
```typescript
// src/components/reviews/ReviewsList.tsx
interface ReviewsListProps {
  modelId: string;
  reviews: ExpertReview[];
  canAddReview: boolean;
}

// Features:
// - Grid/list of ReviewCard components
// - "Add Review" button for authorized users
// - Filter by verification status
// - Sort by date, rating, etc.
```

#### 2. Historical Events Components

##### EventCard Component
```typescript
// src/components/events/EventCard.tsx
interface EventCardProps {
  event: HistoricalEvent;
  onAttest?: (id: string) => void;
  showGuitar?: boolean; // For cross-references
}

// Features:
// - Display event details (type, date, venue, description)
// - Show attestor information
// - Display verification status
// - Evidence links (photos, documents, etc.)
// - Attestation UID display
```

##### CreateEventModal Component
```typescript
// src/components/events/CreateEventModal.tsx
interface CreateEventModalProps {
  guitarId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Features:
// - Event type selector (performance, recording, etc.)
// - Date picker and venue fields
// - Evidence upload simulation
// - Attestor information fields
```

##### EventsTimeline Component
```typescript
// src/components/events/EventsTimeline.tsx
interface EventsTimelineProps {
  guitarId: string;
  events: HistoricalEvent[];
  canAddEvent: boolean;
}

// Features:
// - Chronological timeline of events
// - Visual indicators for different event types
// - Verification status indicators
// - "Add Event" functionality
```

### Page Modifications

#### 1. Model Detail Page Enhancement
```typescript
// src/app/models/[id]/page.tsx
import { getModelWithReviews } from '@/lib/data/reviews'
import { ReviewsList } from '@/components/reviews/ReviewsList'

export default async function ModelPage({ params }: { params: { id: string } }) {
  const model = await getModelWithReviews(params.id);
  
  if (!model) {
    return <div>Model not found</div>;
  }

  // Calculate review statistics
  const reviewStats = {
    total_reviews: model.expert_reviews.length,
    average_rating: model.expert_reviews.reduce((acc, review) => 
      acc + (review.overall_rating || 0), 0) / model.expert_reviews.length || 0,
    verified_reviews: model.expert_reviews.filter(r => 
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
          reviews={model.expert_reviews}
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

### Simulation Features

#### Attestation Status Indicators
```typescript
// Component to show attestation status across the app
const AttestationBadge = ({ status, uid }: { status: string; uid?: string }) => {
  const badges = {
    pending: { color: 'yellow', icon: 'Clock', text: 'Pending Verification' },
    verified: { color: 'green', icon: 'CheckCircle', text: 'Verified' },
    disputed: { color: 'red', icon: 'AlertTriangle', text: 'Disputed' }
  };
  
  return (
    <Badge variant={badges[status].color}>
      <Icon name={badges[status].icon} />
      {badges[status].text}
      {uid && <span className="ml-1 font-mono text-xs">{uid.slice(0, 8)}...</span>}
    </Badge>
  );
};
```

#### Mock Content Archiving Flow
```typescript
// Simulate the YouTube → IPFS archiving process
const simulateContentArchival = async (url: string) => {
  // Fake processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate fake IPFS hash
  const fakeHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
  
  // Generate fake EAS attestation UID
  const fakeUID = `0x${Math.random().toString(16).substring(2, 18)}...`;
  
  return {
    content_hash: fakeHash,
    attestation_uid: fakeUID,
    archived: true
  };
};
```

### Mock Data for Demo

#### Sample Expert Reviews
```typescript
const mockReviews: ExpertReview[] = [
  {
    id: "review-1",
    model_id: "model-les-paul-1959",
    reviewer_name: "Trogly's Guitar Show",
    reviewer_credentials: "Professional guitar appraiser, 500K+ YouTube subscribers",
    review_title: "1959 Les Paul Standard - The Holy Grail",
    review_summary: "Exceptional build quality with original PAF pickups...",
    condition_rating: 8,
    build_quality_rating: 10,
    value_rating: 9,
    overall_rating: 9,
    original_content_url: "https://youtube.com/watch?v=example",
    content_archived: true,
    content_hash: "QmX123abc...",
    attestation_uid: "0x456def...",
    verification_status: "verified",
    review_date: "2023-06-15"
  }
];
```

#### Sample Historical Events
```typescript
const mockEvents: HistoricalEvent[] = [
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

### User Experience Flow

#### For Expert Reviews
1. User views model detail page
2. Sees existing reviews with verification status
3. Clicks "Add Review" (if authorized)
4. Fills out review form with YouTube URL
5. Clicks "Archive Content" → simulates download/IPFS upload
6. Clicks "Create Attestation" → generates fake EAS UID
7. Review appears as "Pending Verification"
8. Admin/expert can verify → status changes to "Verified"

#### For Historical Events
1. User views individual guitar page
2. Sees timeline of historical events
3. Clicks "Add Event" 
4. Selects event type, fills details
5. Uploads evidence (simulated)
6. Specifies attestor information
7. Creates attestation → generates UID
8. Event appears in timeline

### Development Priority

1. **Week 1**: 
   - Database schema changes (SQL + Prisma regeneration)
   - Server actions for reviews and events
   - Data fetching functions

2. **Week 2**: 
   - ReviewCard, CreateReviewModal components
   - Integration on model detail pages
   - Basic attestation simulation

3. **Week 3**: 
   - EventCard, CreateEventModal components  
   - EventsTimeline integration on guitar pages
   - Historical events attestation flow

4. **Week 4**: 
   - AttestationBadge and status indicators
   - Mock data seeding
   - UX polish and demo preparation

### Implementation Steps for Coding Agents

1. **Run SQL schema updates** on your PostgreSQL database
2. **Execute `npx prisma db pull && npx prisma generate`** to update Prisma models
3. **Create server actions** in `/src/lib/actions/` following the provided patterns
4. **Create data fetching functions** in `/src/lib/data/` 
5. **Build React components** using your existing UI component patterns
6. **Update model and guitar detail pages** to include new sections
7. **Add mock data** using the provided samples
8. **Test the simulation flows** (archival, attestation, verification)

### Success Criteria

- Stakeholders can see how attestations enhance content credibility
- Clear demonstration of verification workflow
- Intuitive UI for creating and viewing attestations
- Professional presentation suitable for investor/partner demos
- Foundation for real EAS integration in future phases

This prototype will effectively communicate the attestation value proposition while providing a solid foundation for the real implementation.