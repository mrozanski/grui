"use client"

import { Guitar } from "lucide-react"
import Image from "next/image"
import { SortableListView } from "@/components/ui/sortable-list-view"
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
    updated_at: Date | string | null
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
    }
  }>
}

export function ModelsListClient({ models }: ModelsListProps) {
  const { currentView, setView, isLoaded } = useViewPreference({
    storageKey: 'models-view-preference',
    defaultView: 'cards'
  })

  const listFields = [
    { 
      key: 'thumbnail', 
      label: 'Photo', 
      render: (item: ModelsListProps['models'][0]) => (
        <Image 
          src="/images/guitars/mini-thumb.png" 
          alt={`${item.name} thumbnail`}
          width={48}
          height={48}
          className="w-12 h-12 object-cover rounded"
        />
      )
    },
    { key: 'name', label: 'Model Name' },
    { key: 'manufacturer', label: 'Manufacturer', render: (item: ModelsListProps['models'][0]) => item.manufacturers?.name || 'Unknown' },
    { key: 'year', label: 'Year' },
    { key: 'product_line', label: 'Product Line', render: (item: ModelsListProps['models'][0]) => item.product_lines?.name || 'N/A' },
    { 
      key: 'updated_at', 
      label: 'Updated on', 
      render: (item: ModelsListProps['models'][0]) => item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Unknown'
    }
  ]

  // Show loading state or default view if localStorage hasn't loaded yet
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Guitar Models</h1>
            <p className="mt-2 text-muted-foreground">
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
          <h1 className="text-3xl font-light text-foreground">Guitar Models</h1>
          <p className="mt-2 text-muted-foreground">
            Explore guitar models from various manufacturers
          </p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'cards' ? (
        <ModelCardsView models={models} />
      ) : (
        <SortableListView
          data={models}
          fields={listFields}
          getHref={(item) => `/models/${item.id}`}
          emptyMessage="No models found."
          emptyIcon={<Guitar className="h-12 w-12 text-muted-foreground mx-auto" />}
        />
      )}
    </div>
  )
} 