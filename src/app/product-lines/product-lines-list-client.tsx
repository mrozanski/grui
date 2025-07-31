"use client"

import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"
import { ListView } from "@/components/ui/list-view"
import { ViewToggle } from "@/components/ui/view-toggle"
import { useViewPreference } from "@/hooks/use-view-preference"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

interface ProductLinesListProps {
  productLines: Array<{
    id: string
    name: string
    description: string | null
    introduced_year: number | null
    discontinued_year: number | null
    manufacturers: {
      id: string
      name: string
      country: string | null
    } | null
    _count: {
      models: number
    }
    image: {
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

export function ProductLinesListClient({ productLines }: ProductLinesListProps) {
  const { currentView, setView, isLoaded } = useViewPreference({
    storageKey: 'product-lines-view-preference',
    defaultView: 'cards'
  })

  const getStatusColor = (introduced: number | null, discontinued: number | null) => {
    if (!discontinued) return 'bg-success text-white' // Active
    return 'bg-error text-white' // Discontinued
  }

  const getStatusText = (introduced: number | null, discontinued: number | null) => {
    if (!discontinued) return 'active'
    return 'discontinued'
  }

  const getProductionYears = (introduced: number | null, discontinued: number | null) => {
    if (!introduced && !discontinued) return 'Unknown period'
    if (introduced && !discontinued) return `${introduced}-present`
    if (introduced && discontinued) return `${introduced}-${discontinued}`
    if (!introduced && discontinued) return `Until ${discontinued}`
    return 'Unknown period'
  }

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Product Lines</h1>
            <p className="mt-2 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const listItems = productLines.map(productLine => ({
    id: productLine.id,
    name: productLine.name,
    href: `/product-lines/${productLine.id}`,
    icon: Package,
    content: (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {productLine.image ? (
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={productLine.image.small_url || productLine.image.thumbnail_url || productLine.image.original_url}
                alt={productLine.image.caption || `${productLine.name} image`}
                fill
                className="object-cover rounded-[4px]"
              />
            </div>
          ) : (
            <Package className="h-10 w-10 text-muted-foreground flex-shrink-0" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground">{productLine.name}</h3>
              <Badge className={getStatusColor(productLine.introduced_year, productLine.discontinued_year)}>
                {getStatusText(productLine.introduced_year, productLine.discontinued_year)}
              </Badge>
            </div>
          <p className="text-sm text-muted-foreground mt-1">
            {productLine.manufacturers?.name || 'Unknown Manufacturer'}
            {productLine.manufacturers?.country && ` • ${productLine.manufacturers.country}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {getProductionYears(productLine.introduced_year, productLine.discontinued_year)} • {productLine._count.models} model{productLine._count.models !== 1 ? 's' : ''}
          </p>
          {productLine.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {productLine.description}
            </p>
          )}
          </div>
        </div>
      </div>
    )
  }))

  const cardItems = productLines.map(productLine => ({
    id: productLine.id,
    href: `/product-lines/${productLine.id}`,
    content: (
      <Link key={productLine.id} href={`/product-lines/${productLine.id}`}>
        <Card className="transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] h-full">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {productLine.image ? (
                  <div className="relative h-12 w-12 flex-shrink-0">
                    <Image
                      src={productLine.image.small_url || productLine.image.thumbnail_url || productLine.image.original_url}
                      alt={productLine.image.caption || `${productLine.name} image`}
                      fill
                      className="object-cover rounded-[4px]"
                    />
                  </div>
                ) : (
                  <Package className="h-12 w-12 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg">{productLine.name}</CardTitle>
                  <CardDescription>
                    {productLine.manufacturers?.name || 'Unknown Manufacturer'}
                    {productLine.manufacturers?.country && ` • ${productLine.manufacturers.country}`}
                  </CardDescription>
                </div>
              </div>
              <Badge className={getStatusColor(productLine.introduced_year, productLine.discontinued_year)}>
                {getStatusText(productLine.introduced_year, productLine.discontinued_year)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {getProductionYears(productLine.introduced_year, productLine.discontinued_year)}
              </p>
              <p className="text-sm text-muted-foreground">
                {productLine._count.models} model{productLine._count.models !== 1 ? 's' : ''}
              </p>
              {productLine.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mt-2">
                  {productLine.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Lines</h1>
          <p className="mt-2 text-muted-foreground">
            {productLines.length} product line{productLines.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <ViewToggle currentView={currentView} onViewChange={setView} />
      </div>

      {currentView === 'list' ? (
        <ListView 
          data={productLines}
          fields={[
            { key: 'name', label: 'Name' },
            { key: 'manufacturer', label: 'Manufacturer', render: (item) => item.manufacturers?.name || 'Unknown' },
            { key: 'period', label: 'Period', render: (item) => getProductionYears(item.introduced_year, item.discontinued_year) },
            { key: 'models', label: 'Models', render: (item) => `${item._count.models} model${item._count.models !== 1 ? 's' : ''}` }
          ]}
          getHref={(item) => `/product-lines/${item.id}`}
          emptyMessage="No product lines found."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cardItems.map(item => (
            <div key={item.id}>
              {item.content}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}