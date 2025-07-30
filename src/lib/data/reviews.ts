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