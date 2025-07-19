"use client"

import { Badge } from "@/components/ui/badge"
import { Factory } from "lucide-react"
import { ListView } from "@/components/ui/list-view"
import { ManufacturerCardsView } from "@/components/ui/cards-view"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useViewPreference } from "@/hooks/use-view-preference"

interface ManufacturersListProps {
  manufacturers: Array<{
    id: string
    name: string
    country: string | null
    founded_year: number | null
    website: string | null
    status: string | null
    notes: string | null
    _count: {
      models: number
      product_lines: number
    }
    logo: {
      id: string
      thumbnail_url: string | null
      small_url: string | null
      medium_url: string | null
      large_url: string | null
      original_url: string
      caption: string | null
    } | null
  }>
}

export function ManufacturersListClient({ manufacturers }: ManufacturersListProps) {
  const { currentView, setView, isLoaded } = useViewPreference({
    storageKey: 'manufacturers-view-preference',
    defaultView: 'cards'
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'defunct':
        return 'bg-red-100 text-red-800'
      case 'acquired':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const listFields = [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country', render: (item: ManufacturersListProps['manufacturers'][0]) => item.country || 'Unknown' },
    { key: 'models', label: 'Models', render: (item: ManufacturersListProps['manufacturers'][0]) => item._count.models.toLocaleString() },
    { key: 'product_lines', label: 'Product Lines', render: (item: ManufacturersListProps['manufacturers'][0]) => item._count.product_lines.toLocaleString() },
    { 
      key: 'status', 
      label: 'Status', 
      render: (item: ManufacturersListProps['manufacturers'][0]) => (
        <Badge className={getStatusColor(item.status)}>
          {item.status || 'unknown'}
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
            <h1 className="text-3xl font-light text-gray-900">Guitar Manufacturers</h1>
            <p className="mt-2 text-gray-600">
              Explore the companies that have shaped the electric guitar industry
            </p>
          </div>
          <ViewToggle currentView="cards" onViewChange={() => {}} />
        </div>
        <ManufacturerCardsView manufacturers={manufacturers} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-900">Guitar Manufacturers</h1>
          <p className="mt-2 text-gray-600">
            Explore the companies that have shaped the electric guitar industry
          </p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'cards' ? (
        <ManufacturerCardsView manufacturers={manufacturers} />
      ) : (
        <ListView
          data={manufacturers}
          fields={listFields}
          getHref={(item) => `/manufacturers/${item.id}`}
          emptyMessage="No manufacturers found."
          emptyIcon={<Factory className="h-12 w-12 text-gray-400 mx-auto" />}
        />
      )}
    </div>
  )
} 