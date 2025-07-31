'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createExpertReview, simulateContentArchival } from '@/lib/actions/reviews'

interface ValidationErrors {
  reviewerName?: string;
  reviewTitle?: string;
  reviewSummary?: string;
  reviewDate?: string;
  modelSelection?: string;
}

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  const validateForm = (formData: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Clear previous errors
    setValidationErrors({});
    setSubmitError('');
    
    // Required field validation
    if (!formData.get('reviewerName')?.toString().trim()) {
      errors.reviewerName = 'Reviewer name is required';
    }
    
    if (!formData.get('reviewTitle')?.toString().trim()) {
      errors.reviewTitle = 'Review title is required';
    }
    
    if (!formData.get('reviewSummary')?.toString().trim()) {
      errors.reviewSummary = 'Review summary is required';
    }
    
    if (!formData.get('reviewDate')?.toString().trim()) {
      errors.reviewDate = 'Review date is required';
    }
    
    if (selectedModelIds.length === 0) {
      errors.modelSelection = 'Please select at least one model';
    }
    
    return errors;
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const result = await createExpertReview({
        modelIds: selectedModelIds,
        reviewerName: formData.get('reviewerName') as string,
        reviewerCredentials: formData.get('reviewerCredentials') as string,
        reviewTitle: formData.get('reviewTitle') as string,
        reviewSummary: formData.get('reviewSummary') as string,
        conditionRating: Number(formData.get('conditionRating')) || undefined,
        buildQualityRating: Number(formData.get('buildQualityRating')) || undefined,
        valueRating: Number(formData.get('valueRating')) || undefined,
        overallRating: Number(formData.get('overallRating')) || undefined,
        originalContentUrl: formData.get('originalContentUrl') as string,
        reviewDate: formData.get('reviewDate') as string,
      });
      
      if (result.success && result.review) {
        setReviewId(result.review.id);
      } else {
        setSubmitError('There was an issue processing your review');
      }
    } catch {
      setSubmitError('There was an issue processing your review');
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
    // Clear model selection error when user makes a selection
    if (validationErrors.modelSelection) {
      setValidationErrors(prev => ({ ...prev, modelSelection: undefined }));
    }
  };

  const handleInputChange = (fieldName: keyof ValidationErrors) => {
    // Clear validation error when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle>Create Expert Review</DialogTitle>
        </DialogHeader>
        
        <form id="reviewForm" className="space-y-6 flex-1 overflow-y-auto pt-4">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className={`text-base font-medium ${validationErrors.modelSelection ? 'text-red-600' : ''}`}>
              This review applies to: (select all that apply)
            </Label>
            <div className={`grid gap-2 max-h-40 overflow-y-auto border rounded p-3 ${validationErrors.modelSelection ? 'border-red-300 bg-red-50' : ''}`}>
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
            {validationErrors.modelSelection && (
              <p className="text-sm text-red-600">{validationErrors.modelSelection}</p>
            )}
          </div>

          {/* Reviewer Information */}
          <div className="grid gap-4">
            <div>
              <Label htmlFor="reviewerName" className={validationErrors.reviewerName ? 'text-red-600' : ''}>
                Reviewer Name *
              </Label>
              <Input 
                id="reviewerName" 
                name="reviewerName" 
                required 
                placeholder="e.g., Trogly's Guitar Show"
                className={validationErrors.reviewerName ? 'border-red-300 bg-red-50' : ''}
                onChange={() => handleInputChange('reviewerName')}
              />
              {validationErrors.reviewerName && (
                <p className="text-sm text-red-600">{validationErrors.reviewerName}</p>
              )}
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
              <Label htmlFor="reviewTitle" className={validationErrors.reviewTitle ? 'text-red-600' : ''}>
                Review Title *
              </Label>
              <Input 
                id="reviewTitle" 
                name="reviewTitle" 
                required 
                placeholder="e.g., Classic Vibe Stratocaster - Great Value Guitar"
                className={validationErrors.reviewTitle ? 'border-red-300 bg-red-50' : ''}
                onChange={() => handleInputChange('reviewTitle')}
              />
              {validationErrors.reviewTitle && (
                <p className="text-sm text-red-600">{validationErrors.reviewTitle}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reviewSummary" className={validationErrors.reviewSummary ? 'text-red-600' : ''}>
                Review Summary *
              </Label>
              <Textarea 
                id="reviewSummary" 
                name="reviewSummary" 
                required
                rows={4}
                placeholder="Detailed review content..."
                className={validationErrors.reviewSummary ? 'border-red-300 bg-red-50' : ''}
                onChange={() => handleInputChange('reviewSummary')}
              />
              {validationErrors.reviewSummary && (
                <p className="text-sm text-red-600">{validationErrors.reviewSummary}</p>
              )}
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
            <Label htmlFor="reviewDate" className={validationErrors.reviewDate ? 'text-red-600' : ''}>
              Review Date *
            </Label>
            <Input 
              id="reviewDate" 
              name="reviewDate" 
              type="date" 
              required
              className={validationErrors.reviewDate ? 'border-red-300 bg-red-50' : ''}
              onChange={() => handleInputChange('reviewDate')}
            />
            {validationErrors.reviewDate && (
              <p className="text-sm text-red-600">{validationErrors.reviewDate}</p>
            )}
          </div>
        </form>

        <div className="space-y-3 pt-4 border-t mt-4 flex-shrink-0">
          <div className="flex gap-3">
            <Button 
              type="submit" 
              disabled={isSubmitting || selectedModelIds.length === 0}
              onClick={() => {
                const form = document.getElementById('reviewForm') as HTMLFormElement;
                if (form) {
                  const formData = new FormData(form);
                  handleSubmit(formData);
                }
              }}
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
          
          {/* Error Messages */}
          {Object.keys(validationErrors).length > 0 && (
            <p className="text-sm text-red-600">Please enter all the required values</p>
          )}
          {submitError && (
            <p className="text-sm text-red-600">{submitError}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 