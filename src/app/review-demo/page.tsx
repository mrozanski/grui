'use client'

import { ReviewCard } from '@/components/reviews/ReviewCard'

// Sample review data for demo
const sampleReviews = [
  {
    id: "review-1",
    reviewer_name: "Trogly's Guitar Show",
    reviewer_credentials: "Professional guitar appraiser, 500K+ YouTube subscribers",
    review_title: "Squier Classic Vibe '50s Stratocaster - Incredible Value",
    review_summary: "This guitar punches way above its weight class. The vintage-style appointments and tone are remarkable for the price point. The neck feels great, the pickups have that classic Strat sound, and the build quality is surprisingly good for a guitar in this price range.",
    overall_rating: 9,
    verification_status: "verified",
    attestation_uid: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    content_archived: true,
    original_content_url: "https://youtube.com/watch?v=example1",
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
      }
    ]
  },
  {
    id: "review-2",
    reviewer_name: "Guitar World",
    reviewer_credentials: "Leading guitar magazine, 30+ years of expertise",
    review_title: "Fender Player Stratocaster - Modern Classic",
    review_summary: "The Player Series represents Fender's best value proposition. These guitars offer professional-grade features at an accessible price point. The Alnico V pickups deliver that iconic Strat tone, while the modern C-shaped neck provides excellent playability.",
    overall_rating: 8,
    verification_status: "pending",
    attestation_uid: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    content_archived: false,
    original_content_url: "https://guitarworld.com/reviews/fender-player-stratocaster",
    review_model_associations: [
      {
        models: {
          id: "model-player-2023",
          name: "Player Stratocaster",
          year: 2023,
          manufacturers: { name: "Fender" }
        }
      }
    ]
  },
  {
    id: "review-3",
    reviewer_name: "Premier Guitar",
    reviewer_credentials: "Professional musician and gear reviewer",
    review_title: "Gibson Les Paul Standard - The Gold Standard",
    review_summary: "The Les Paul Standard continues to set the benchmark for electric guitars. Its rich, warm tone and sustain are unmatched. The craftsmanship is exceptional, with attention to detail that justifies its premium price tag.",
    overall_rating: 10,
    verification_status: "disputed",
    attestation_uid: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    content_archived: true,
    original_content_url: "https://premierguitar.com/reviews/gibson-les-paul-standard",
    review_model_associations: [
      {
        models: {
          id: "model-les-paul-standard-2024",
          name: "Les Paul Standard",
          year: 2024,
          manufacturers: { name: "Gibson" }
        }
      }
    ]
  }
];

export default function ReviewDemoPage() {
  const handleVerify = async (reviewId: string) => {
    console.log('Verifying review:', reviewId);
    // In a real app, this would call the server action
    // await verifyReview(reviewId);
  };

  const handleEdit = (reviewId: string) => {
    console.log('Editing review:', reviewId);
    // In a real app, this would open an edit modal
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">ReviewCard Component Demo</h1>
        <p className="text-gray-600 mb-8">
          This page demonstrates the ReviewCard component with different verification states and model associations.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Cards with Different States</h2>
          
          <div className="grid gap-6">
            {sampleReviews.map((review, index) => (
              <div key={review.id} className="space-y-2">
                <h3 className="text-lg font-medium text-gray-700">
                  Example {index + 1}: {review.verification_status.charAt(0).toUpperCase() + review.verification_status.slice(1)} Review
                </h3>
                <ReviewCard 
                  review={review}
                  onVerify={handleVerify}
                  onEdit={handleEdit}
                  showModels={true}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Card Without Model Display</h2>
          <p className="text-gray-600">When used on a model detail page, the associated models are hidden:</p>
          
          <ReviewCard 
            review={sampleReviews[0]}
            onVerify={handleVerify}
            onEdit={handleEdit}
            showModels={false}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Review Card Without Actions</h2>
          <p className="text-gray-600">When no actions are provided, the buttons are hidden:</p>
          
          <ReviewCard 
            review={sampleReviews[1]}
            showModels={true}
          />
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold mb-4">Component Features</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Attestation Badge:</strong> Shows verification status with UID</li>
            <li>• <strong>Model Associations:</strong> Displays associated guitar models as badges</li>
            <li>• <strong>Rating Display:</strong> Shows overall rating when available</li>
            <li>• <strong>Content Status:</strong> Indicates if content is archived</li>
            <li>• <strong>Original Source:</strong> Links to the original review content</li>
            <li>• <strong>Action Buttons:</strong> Verify and Edit buttons when callbacks provided</li>
            <li>• <strong>Responsive Design:</strong> Adapts to different screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 