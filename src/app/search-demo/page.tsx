'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface ValidationErrors {
  searchType?: string;
  name?: string;
  manufacturer?: string;
  yearFrom?: string;
  serialNumber?: string;
}

interface SearchResult {
  id: string;
  name?: string;
  serial_number?: string;
  year?: number;
  manufacturer_name?: string;
  type: 'model' | 'guitar';
}

export default function SearchDemoPage() {
  const [searchType, setSearchType] = useState<'model' | 'guitar'>('model')
  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    yearFrom: '',
    serialNumber: '',
    page: 1,
    pageSize: 10,
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchError, setSearchError] = useState<string>('')

  const validateForm = (): ValidationErrors => {
    const errors: ValidationErrors = {}
    
    // Clear previous errors
    setValidationErrors({})
    setSearchError('')
    
    // Required field validation based on search type
    if (searchType === 'model') {
      if (!formData.name.trim() && !formData.manufacturer.trim() && !formData.yearFrom.trim()) {
        errors.name = 'At least one search criteria is required for model search'
      }
    } else if (searchType === 'guitar') {
      // For guitar search, either serial number OR (model name OR manufacturer name) is required
      if (!formData.serialNumber.trim() && !formData.name.trim() && !formData.manufacturer.trim()) {
        errors.serialNumber = 'Either serial number or at least one search criteria (model name/manufacturer) is required for guitar search'
      }
    }
    
    // Year validation (API only supports single year, not range)
    if (formData.yearFrom) {
      const year = parseInt(formData.yearFrom)
      if (isNaN(year) || year < 1900 || year > 2030) {
        errors.yearFrom = 'Year must be between 1900 and 2030'
      }
    }
    
    return errors
  }

  const handleInputChange = (fieldName: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[fieldName as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: undefined }))
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    
    // Validate form
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsSearching(false)
      return
    }
    
    try {
      let endpoint: string
      const params = new URLSearchParams()
      
      if (searchType === 'model') {
        endpoint = 'http://localhost:8000/api/search/models'
        if (formData.name.trim()) params.append('model_name', formData.name.trim())
        if (formData.manufacturer.trim()) params.append('manufacturer_name', formData.manufacturer.trim())
        if (formData.yearFrom.trim()) params.append('year', formData.yearFrom.trim())
        if (formData.page) params.append('page', formData.page.toString())
        if (formData.pageSize) params.append('page_size', formData.pageSize.toString())
      } else {
        endpoint = 'http://localhost:8000/api/search/instruments'
        
        if (formData.serialNumber.trim()) {
          // Serial number search
          params.append('serial_number', formData.serialNumber.trim())
        } else {
          // Unknown serial search
          params.append('unknown_serial', 'true')
          if (formData.name.trim()) params.append('model_name', formData.name.trim())
          if (formData.manufacturer.trim()) params.append('manufacturer_name', formData.manufacturer.trim())
          if (formData.yearFrom.trim()) params.append('year_estimate', formData.yearFrom.trim())
        }
        
        if (formData.page) params.append('page', formData.page.toString())
        if (formData.pageSize) params.append('page_size', formData.pageSize.toString())
      }
      
      const response = await fetch(`${endpoint}?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transform API response to our SearchResult format
      let results: SearchResult[] = []
      if (searchType === 'model' && data.models) {
        results = data.models.map((model: any) => ({
          id: model.id,
          name: model.model_name,
          year: model.year,
          manufacturer_name: model.manufacturer_name,
          type: 'model' as const
        }))
      } else if (searchType === 'guitar' && data.individual_guitars) {
        results = data.individual_guitars.map((guitar: any) => ({
          id: guitar.id,
          name: guitar.model_name,
          serial_number: guitar.serial_number,
          year: guitar.year_estimate,
          manufacturer_name: guitar.manufacturer_name,
          type: 'guitar' as const
        }))
      }
      
      setSearchResults(results)
      setSearchError('')
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'An unexpected error occurred')
      setSearchResults([])
    }
    
    setIsSearching(false)
  }

  const getHref = (result: SearchResult) => {
    if (result.type === 'model') {
      return `/models/${result.id}`
    } else {
      return `/guitars/${result.id}`
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Search Demo</h1>
        <p className="text-gray-600 mb-4">
          Search for guitar models or individual guitars using the external API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="searchType">Search Type *</Label>
            <Select value={searchType} onValueChange={(value: 'model' | 'guitar') => setSearchType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select search type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="model">Guitar Models</SelectItem>
                <SelectItem value="guitar">Individual Guitars</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.searchType && (
              <p className="text-sm text-destructive">{validationErrors.searchType}</p>
            )}
          </div>

          {/* Common Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{searchType === 'model' ? 'Model Name *' : 'Model Name'}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={searchType === 'model' ? 'e.g., Les Paul Standard' : 'e.g., Les Paul Standard'}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer Name</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="e.g., Gibson"
              />
              {validationErrors.manufacturer && (
                <p className="text-sm text-destructive">{validationErrors.manufacturer}</p>
              )}
            </div>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="yearFrom">Year</Label>
            <Input
              id="yearFrom"
              type="number"
              value={formData.yearFrom}
              onChange={(e) => handleInputChange('yearFrom', e.target.value)}
              placeholder="e.g., 1959"
              min="1900"
              max="2030"
            />
            {validationErrors.yearFrom && (
              <p className="text-sm text-destructive">{validationErrors.yearFrom}</p>
            )}
          </div>

          {/* Guitar-specific Fields */}
          {searchType === 'guitar' && (
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                placeholder="e.g., 9-0824 or 90824"
              />
              <p className="text-xs text-gray-500">
                Leave empty to search by model/manufacturer (unknown serial search)
              </p>
              {validationErrors.serialNumber && (
                <p className="text-sm text-destructive">{validationErrors.serialNumber}</p>
              )}
            </div>
          )}

          {/* Search Button */}
          <div className="pt-4">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="w-full md:w-auto"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Error Messages */}
          {Object.keys(validationErrors).length > 0 && (
            <p className="text-sm text-destructive">Please enter all the required values</p>
          )}
          {searchError && (
            <p className="text-sm text-destructive">{searchError}</p>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({searchResults.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {result.type === 'model' ? (
                        <>
                          <h3 className="font-semibold">{result.name}</h3>
                          <p className="text-sm text-gray-600">
                            {result.year && `${result.year} • `}
                            {result.manufacturer_name}
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold">Serial: {result.serial_number}</h3>
                          <p className="text-sm text-gray-600">
                            {result.name && `${result.name} • `}
                            {result.year && `${result.year} • `}
                            {result.manufacturer_name}
                          </p>
                        </>
                      )}
                    </div>
                    <Link 
                      href={getHref(result)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {searchResults.length === 0 && !searchError && !isSearching && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500 text-center">No search results to display. Enter search criteria and click Search to begin.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 