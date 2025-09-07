// Utility functions for guitar-related components

export interface GuitarDisplayData {
  models?: {
    name: string
    year: number
    manufacturers?: {
      name: string
    } | null
  } | null
  manufacturer_name_fallback?: string | null
  model_name_fallback?: string | null
  year_estimate?: string | null
}

export function getGuitarDisplayName(guitar: GuitarDisplayData): string {
  if (guitar.models) {
    return `${guitar.models.manufacturers?.name || 'Unknown'} ${guitar.models.name}`
  }
  return `${guitar.manufacturer_name_fallback || 'Unknown'} ${guitar.model_name_fallback || 'Model'}`
}

export function getGuitarDisplayYear(guitar: GuitarDisplayData): string {
  if (guitar.models) {
    return guitar.models.year.toString()
  }
  return guitar.year_estimate || 'Unknown'
}

export function getSignificanceColor(level: string | null): string {
  switch (level?.toLowerCase()) {
    case 'legendary':
      return 'bg-blue-500 text-white'
    case 'historic':
      return 'bg-purple-500 text-white'
    case 'notable':
      return 'bg-green-500 text-white'
    case 'rare':
      return 'bg-yellow-500 text-white'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

export function getConditionColor(condition: string | null): string {
  switch (condition?.toLowerCase()) {
    case 'mint':
      return 'bg-green-500 text-white'
    case 'excellent':
      return 'bg-blue-500 text-white'
    case 'very good':
      return 'bg-yellow-500 text-white'
    case 'good':
      return 'bg-orange-500 text-white'
    case 'fair':
      return 'bg-red-500 text-white'
    default:
      return 'bg-gray-200 text-gray-700'
  }
}

export function formatCurrency(amount: number | null | unknown): string | null {
  if (!amount) return null
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(amount))
  } catch {
    return `$${Number(amount).toLocaleString()}`
  }
}

export function formatDate(date: Date | null): string | null {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
} 