import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, MapPin, Calendar, Guitar, FileText, Package } from "lucide-react"

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
  }>
}

export function ManufacturerCardsView({ manufacturers }: ManufacturerCardsViewProps) {
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

  if (manufacturers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No manufacturers found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {manufacturers.map((manufacturer) => (
        <Link key={manufacturer.id} href={`/manufacturers/${manufacturer.id}`}>
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{manufacturer.name}</CardTitle>
                  <Badge className={getStatusColor(manufacturer.status)}>
                    {manufacturer.status || 'unknown'}
                  </Badge>
                </div>
                {manufacturer.website && (
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                )}
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
                    <p className="font-medium text-gray-900">
                      {manufacturer._count.models}
                    </p>
                    <p className="text-gray-500">Models</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {manufacturer._count.product_lines}
                    </p>
                    <p className="text-gray-500">Product Lines</p>
                  </div>
                </div>
                
                {manufacturer.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
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
        <Guitar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No models found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {models.map((model) => (
        <Link key={model.id} href={`/models/${model.id}`}>
          <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{model.name} ({model.year})</CardTitle>
                  <Badge className={getProductionTypeColor(model.production_type)}>
                    {model.production_type || 'unknown'}
                  </Badge>
                </div>
                <Guitar className="h-5 w-5 text-gray-400" />
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
                      <span className="text-green-600 font-medium">
                        {formatCurrency(model.msrp_original, model.currency)}
                      </span>
                    </div>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {model.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {model.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500">
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