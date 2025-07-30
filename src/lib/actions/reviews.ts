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
    console.error('Failed to create review:', error);
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