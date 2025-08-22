"use client"

import { Badge } from "@/components/ui/badge"
import { Guitar } from "lucide-react"
import { ListView } from "@/components/ui/list-view"
import { GuitarCardsView } from "@/components/ui/cards-view"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useViewPreference } from "@/hooks/use-view-preference"
import { 
  getGuitarDisplayName, 
  getGuitarDisplayYear, 
  getSignificanceColor, 
  getConditionColor, 
  formatCurrency 
} from "@/lib/guitar-utils"

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

      market_valuations: number
    }
  }>
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
      render: (item: GuitarsListProps['guitars'][0]) => {
        if (item.models?.manufacturers?.name) {
          return item.models.manufacturers.name
        }
        return item.manufacturer_name_fallback || 'Unknown'
      }
    },
    { 
      key: 'model', 
      label: 'Model', 
      render: (item: GuitarsListProps['guitars'][0]) => {
        const displayName = getGuitarDisplayName(item)
        const displayYear = getGuitarDisplayYear(item)
        return `${displayName} (${displayYear})`
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
            <h1 className="text-3xl font-light text-foreground">Individual Guitars</h1>
            <p className="mt-2 text-muted-foreground">
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
          <h1 className="text-3xl font-light text-foreground">Individual Guitars</h1>
          <p className="mt-2 text-muted-foreground">
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
          emptyIcon={<Guitar className="h-12 w-12 text-muted-foreground mx-auto" />}
        />
      )}
    </div>
  )
} 