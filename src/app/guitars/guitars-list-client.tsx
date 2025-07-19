"use client"

import { Badge } from "@/components/ui/badge"
import { Guitar } from "lucide-react"
import { ListView } from "@/components/ui/list-view"
import { GuitarCardsView } from "@/components/ui/cards-view"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useViewPreference } from "@/hooks/use-view-preference"

interface GuitarsListProps {
  guitars: Array<{
    id: string
    serial_number: string | null
    production_date: Date | null
    significance_level: string | null
    current_estimated_value: number | null
    condition_rating: string | null
    manufacturer_name_fallback: string | null
    model_name_fallback: string | null
    year_estimate: string | null
    description: string | null
    models: {
      id: string
      name: string
      year: number
      manufacturers: {
        id: string
        name: string
      } | null
    } | null
    _count: {
      notable_associations: number
      market_valuations: number
    }
  }>
}

function getSignificanceColor(level: string | null) {
  switch (level?.toLowerCase()) {
    case 'legendary':
      return 'bg-purple-100 text-purple-800'
    case 'historic':
      return 'bg-blue-100 text-blue-800'
    case 'notable':
      return 'bg-green-100 text-green-800'
    case 'rare':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getConditionColor(condition: string | null) {
  switch (condition?.toLowerCase()) {
    case 'mint':
      return 'bg-green-100 text-green-800'
    case 'excellent':
      return 'bg-blue-100 text-blue-800'
    case 'very good':
      return 'bg-yellow-100 text-yellow-800'
    case 'good':
      return 'bg-orange-100 text-orange-800'
    case 'fair':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatCurrency(amount: number | null) {
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

export function GuitarsListClient({ guitars }: GuitarsListProps) {
  const { currentView, setView, isLoaded } = useViewPreference({
    storageKey: 'guitars-view-preference',
    defaultView: 'cards'
  })

  const listFields = [
    { 
      key: 'manufacturer', 
      label: 'Manufacturer', 
      render: (item: GuitarsListProps['guitars'][0]) => item.models?.manufacturers?.name || item.manufacturer_name_fallback || 'Unknown' 
    },
    { 
      key: 'model', 
      label: 'Model', 
      render: (item: GuitarsListProps['guitars'][0]) => {
        if (item.models) {
          return `${item.models.name} (${item.models.year})`
        }
        return item.model_name_fallback || 'Unknown Model'
      }
    },
    { 
      key: 'serial_number', 
      label: 'Serial Number', 
      render: (item: GuitarsListProps['guitars'][0]) => item.serial_number || 'N/A' 
    },
    { 
      key: 'significance', 
      label: 'Significance', 
      render: (item: GuitarsListProps['guitars'][0]) => (
        <Badge className={getSignificanceColor(item.significance_level)}>
          {item.significance_level || 'notable'}
        </Badge>
      )
    },
    { 
      key: 'condition', 
      label: 'Condition', 
      render: (item: GuitarsListProps['guitars'][0]) => item.condition_rating ? (
        <Badge className={getConditionColor(item.condition_rating)}>
          {item.condition_rating}
        </Badge>
      ) : 'N/A'
    },
    { 
      key: 'value', 
      label: 'Est. Value', 
      render: (item: GuitarsListProps['guitars'][0]) => formatCurrency(item.current_estimated_value) || 'N/A'
    }
  ]

  // Show loading state or default view if localStorage hasn't loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Individual Guitars</h1>
            <p className="mt-2 text-gray-600">
              Registry of specific guitar instruments and their provenance
            </p>
          </div>
          <ViewToggle currentView="cards" onViewChange={() => {}} />
        </div>
        <GuitarCardsView guitars={guitars} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Individual Guitars</h1>
          <p className="mt-2 text-gray-600">
            Registry of specific guitar instruments and their provenance
          </p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'cards' ? (
        <GuitarCardsView guitars={guitars} />
      ) : (
        <ListView
          data={guitars}
          fields={listFields}
          getHref={(item) => `/guitars/${item.id}`}
          emptyMessage="No guitars found."
          emptyIcon={<Guitar className="h-12 w-12 text-gray-400 mx-auto" />}
        />
      )}
    </div>
  )
} 