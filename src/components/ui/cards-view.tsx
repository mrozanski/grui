import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin, Calendar, Guitar, FileText, Package, DollarSign } from "lucide-react"
import { 
  getGuitarDisplayName, 
  getGuitarDisplayYear, 
  getSignificanceColor, 
  getConditionColor, 
  formatCurrency as formatCurrencyGuitar 
} from "@/lib/guitar-utils"

interface ManufacturerCardsViewProps {
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

export function ManufacturerCardsView({ manufacturers }: ManufacturerCardsViewProps) {
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-success text-white'
      case 'defunct':
        return 'bg-error text-white'
      case 'acquired':
        return 'bg-warning text-white'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (manufacturers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No manufacturers found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {manufacturers.map((manufacturer) => (
        <Link key={manufacturer.id} href={`/manufacturers/${manufacturer.id}`}>
          <Card className="h-full transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-lg">{manufacturer.name}</CardTitle>
                  <Badge className={getStatusColor(manufacturer.status)}>
                    {manufacturer.status || 'unknown'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {manufacturer.logo && (
                    <div className="w-[150px] h-12 flex items-center justify-center">
                      <img
                        src={manufacturer.logo.medium_url || manufacturer.logo.original_url}
                        alt={manufacturer.logo.caption || `${manufacturer.name} logo`}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {/* {manufacturer.website && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )} */}
                </div>
              </div>
              <CardDescription className="space-y-2">
                {manufacturer.country && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3" />
                    {manufacturer.country}
                  </div>
                )}
                {manufacturer.founded_year && (
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3" />
                    Founded {manufacturer.founded_year}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {manufacturer._count.models}
                    </p>
                    <p className="text-muted-foreground">Models</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {manufacturer._count.product_lines}
                    </p>
                    <p className="text-muted-foreground">Product Lines</p>
                  </div>
                </div>
                
                {manufacturer.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {manufacturer.notes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

interface ModelCardsViewProps {
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
      return 'bg-success text-white'
    case 'limited':
      return 'bg-info text-white'
    case 'custom':
      return 'bg-primary text-white'
    case 'prototype':
      return 'bg-warning text-white'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function formatCurrency(amount: number | null | unknown, currency: string | null = 'USD') {
  if (!amount) return null
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(Number(amount))
  } catch {
    return `${currency || 'USD'} ${Number(amount).toLocaleString()}`
  }
}

export function ModelCardsView({ models }: ModelCardsViewProps) {
  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <Guitar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No models found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Link key={model.id} href={`/models/${model.id}`}>
          <Card className="h-full transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{model.name} ({model.year})</CardTitle>
                  <Badge className={getProductionTypeColor(model.production_type)}>
                    {model.production_type || 'unknown'}
                  </Badge>
                </div>
                <Guitar className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Manufacturer:</span>
                    <span>{model.manufacturers?.name || 'Unknown'}</span>
                  </div>
                  {model.product_lines && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Product Line:</span>
                      <span>{model.product_lines.name}</span>
                    </div>
                  )}
                  {model.msrp_original && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Original MSRP:</span>
                      <span className="text-success font-medium">
                        {formatCurrency(model.msrp_original, model.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {model.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {model.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Guitar className="h-4 w-4" />
                    <span>{model._count.individual_guitars} guitars</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>{model._count.specifications} specs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    <span>{model._count.finishes} finishes</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

interface GuitarCardsViewProps {
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

function formatDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short'
  }).format(date)
}

export function GuitarCardsView({ guitars }: GuitarCardsViewProps) {
  if (guitars.length === 0) {
    return (
      <div className="text-center py-12">
        <Guitar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No guitars found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {guitars.map((guitar) => (
        <Link key={guitar.id} href={`/guitars/${guitar.id}`}>
          <Card className="h-full transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    {getGuitarDisplayName(guitar)}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getSignificanceColor(guitar.significance_level)}>
                      {guitar.significance_level || 'notable'}
                    </Badge>
                    {guitar.condition_rating && (
                      <Badge className={getConditionColor(guitar.condition_rating)} variant="outline">
                        {guitar.condition_rating}
                      </Badge>
                    )}
                  </div>
                </div>
                <Guitar className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Serial:</span>
                    <span className="font-mono text-xs">{guitar.serial_number || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Year:</span>
                    <span>{getGuitarDisplayYear(guitar)}</span>
                  </div>
                  {guitar.production_date && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Production:</span>
                      <span>{formatDate(guitar.production_date)}</span>
                    </div>
                  )}
                  {guitar.current_estimated_value && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Est. Value:</span>
                      <span className="text-success font-medium">
                        {formatCurrencyGuitar(guitar.current_estimated_value)}
                      </span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {guitar.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {guitar.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">

                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{guitar._count.market_valuations} valuations</span>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}