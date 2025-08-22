'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreateReviewModal } from '@/components/reviews/CreateReviewModal'

// Sample related models data for demo - using real model IDs from database
const sampleRelatedModels = [
  {
    id: "019857b5-619a-7684-b298-e7cda33c3d36",
    name: "Stratocaster",
    year: 1954,
    manufacturers: { name: "Fender Musical Instruments Corporation" }
  },
  {
    id: "019857b5-6197-77a2-9825-cf82315ed54e", 
    name: "Telecaster",
    year: 1950,
    manufacturers: { name: "Fender Musical Instruments Corporation" }
  }
];

export default function CreateReviewDemoPage() {
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialModelId, setInitialModelId] = useState('019857b5-619a-7684-b298-e7cda33c3d36')

  // Check for URL parameter to auto-open modal
  useEffect(() => {
    const modelId = searchParams.get('modelId')
    const autoOpen = searchParams.get('open')
    
    if (modelId) {
      setInitialModelId(modelId)
    }
    
    if (autoOpen === 'true') {
      setIsModalOpen(true)
    }
  }, [searchParams])

  const handleSuccess = () => {
    setIsModalOpen(false)
    alert('Review created successfully! Check the database or refresh the page.')
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Create Review Modal Demo</h1>
        <p className="text-gray-600 mb-4">
          This page demonstrates the CreateReviewModal component with many-to-many model selection.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Access Instructions:</h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• <strong>Auto-open modal:</strong> Add <code>?open=true</code> to the URL</li>
            <li>• <strong>Set initial model:</strong> Add <code>?modelId=019857b5-619a-7684-b298-e7cda33c3d36</code></li>
            <li>• <strong>Both:</strong> <code>?open=true&modelId=019857b5-6197-77a2-9825-cf82315ed54e</code></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Current Settings:</h2>
          <div className="grid gap-2 text-sm">
            <div><strong>Initial Model ID:</strong> {initialModelId}</div>
            <div><strong>Modal Open:</strong> {isModalOpen ? 'Yes' : 'No'}</div>
            <div><strong>Available Models:</strong> {sampleRelatedModels.length}</div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Open Create Review Modal
          </button>
        </div>
      </div>

      <CreateReviewModal
        initialModelId={initialModelId}
        relatedModels={sampleRelatedModels}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  )
} 