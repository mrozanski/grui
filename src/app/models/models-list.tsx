import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Package, FileText, Guitar } from "lucide-react"
import { prisma } from "@/lib/prisma"

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

export default async function ModelsList() {
  const models = await prisma.models.findMany({
    select: {
      id: true,
      name: true,
      year: true,
      production_type: true,
      msrp_original: true,
      currency: true,
      description: true,
      manufacturers: {
        select: {
          id: true,
          name: true,
        }
      },
      product_lines: {
        select: {
          id: true,
          name: true,
        }
      },
      _count: {
        select: {
          individual_guitars: true,
          specifications: true,
          finishes: true,
        },
      },
    },
    orderBy: [
      { year: 'desc' },
      { name: 'asc' }
    ],
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-gray-900">Guitar Models</h1>
        <p className="mt-2 text-gray-600">
          Explore guitar models from various manufacturers
        </p>
      </div>

      {/* Grid of model cards */}
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

      {/* Empty state */}
      {models.length === 0 && (
        <div className="text-center py-12">
          <Guitar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No models found.</p>
        </div>
      )}
    </div>
  )
}