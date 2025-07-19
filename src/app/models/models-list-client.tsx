"use client"

import { Badge } from "@/components/ui/badge"
import { Guitar } from "lucide-react"
import { ListView } from "@/components/ui/list-view"
import { ModelCardsView } from "@/components/ui/cards-view"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useViewPreference } from "@/hooks/use-view-preference"

interface ModelsListProps {
  models: Array<{
    id: string
    name: string
    year: number
    production_type: string | null
    msrp_original: number | null
    currency: string | null
    description: string | null
    manufacturers: {
      id: string
      name: string
    } | null
    product_lines: {
      id: string
      name: string
    } | null
    _count: {
      individual_guitars: number
      specifications: number
      finishes: number
    }
  }>
}

function getProductionTypeColor(type: string | null) {
  switch (type?.toLowerCase()) {
    case 'mass':
      return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'limited':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'custom':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    case 'prototype':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

export function ModelsListClient({ models }: ModelsListProps) {
  const { currentView, setView, isLoaded } = useViewPreference({
    storageKey: 'models-view-preference',
    defaultView: 'cards'
  })

  const listFields = [
    { key: 'name', label: 'Model Name' },
    { key: 'manufacturer', label: 'Manufacturer', render: (item: ModelsListProps['models'][0]) => item.manufacturers?.name || 'Unknown' },
    { key: 'year', label: 'Year' },
    { key: 'product_line', label: 'Product Line', render: (item: ModelsListProps['models'][0]) => item.product_lines?.name || 'N/A' },
    { 
      key: 'production_type', 
      label: 'Production Type', 
      render: (item: ModelsListProps['models'][0]) => (
        <Badge className={getProductionTypeColor(item.production_type)}>
          {item.production_type || 'unknown'}
        </Badge>
      )
    }
  ]

  // Show loading state or default view if localStorage hasn't loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Guitar Models</h1>
            <p className="mt-2 text-gray-600">
              Explore guitar models from various manufacturers
            </p>
          </div>
          <ViewToggle currentView="cards" onViewChange={() => {}} />
        </div>
        <ModelCardsView models={models} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Guitar Models</h1>
          <p className="mt-2 text-gray-600">
            Explore guitar models from various manufacturers
          </p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'cards' ? (
        <ModelCardsView models={models} />
      ) : (
        <ListView
          data={models}
          fields={listFields}
          getHref={(item) => `/models/${item.id}`}
          emptyMessage="No models found."
          emptyIcon={<Guitar className="h-12 w-12 text-gray-400 mx-auto" />}
        />
      )}
    </div>
  )
} 