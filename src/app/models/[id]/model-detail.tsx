import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ExternalLink, Package, FileText, Guitar, DollarSign, Building } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

interface ModelDetailProps {
  params: Promise<{ id: string }>
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

function formatDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export default async function ModelDetail({ params }: ModelDetailProps) {
  const { id } = await params
  const model = await prisma.models.findUnique({
    where: { id },
    include: {
      manufacturers: true,
      product_lines: true,
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      individual_guitars: {
        orderBy: [{ production_date: 'desc' }],
        take: 10,
        include: {
          _count: {
            select: { notable_associations: true },
          },
        },
      },
      _count: {
        select: {
          individual_guitars: true,
          specifications: true,
          finishes: true,
          market_valuations: true,
        },
      },
    },
  })

  if (!model) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/models">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Models
          </Link>
        </Button>
      </div>

      {/* Header with model info */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              {model.name} ({model.year})
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getProductionTypeColor(model.production_type)}>
                {model.production_type || 'unknown'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span>Manufacturer:</span>
              <Link 
                href={`/manufacturers/${model.manufacturers?.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {model.manufacturers?.name || 'Unknown'}
              </Link>
            </div>
            
            {model.product_lines && (
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="h-4 w-4" />
                <span>Product Line:</span>
                <span className="font-medium">{model.product_lines.name}</span>
              </div>
            )}
            
            {model.msrp_original && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Original MSRP:</span>
                <span className="text-green-600 font-medium">
                  {formatCurrency(model.msrp_original, model.currency)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Image
          src="/images/guitars/guitar-default.jpg"
          alt="Guitar model placeholder"
          width={400}
          height={300}
        />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individual Guitars</CardTitle>
            <Guitar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model._count.individual_guitars}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specifications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model._count.specifications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finishes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model._count.finishes}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Valuations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{model._count.market_valuations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {model.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{model.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Production Details */}
      <Card>
        <CardHeader>
          <CardTitle>Production Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Production Year:</span>
                <span className="font-medium">{model.year}</span>
              </div>
              {model.production_start_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Production Start:</span>
                  <span className="font-medium">{formatDate(model.production_start_date)}</span>
                </div>
              )}
              {model.production_end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Production End:</span>
                  <span className="font-medium">{formatDate(model.production_end_date)}</span>
                </div>
              )}
              {model.estimated_production_quantity && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Production:</span>
                  <span className="font-medium">{model.estimated_production_quantity.toLocaleString()} units</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Specifications */}
        {model.specifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Specifications ({model.specifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {model.specifications.slice(0, 1).map((spec) => (
                  <div key={spec.id} className="space-y-2">
                    {spec.body_wood && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Body Wood</span>
                        <span className="font-medium text-right">{spec.body_wood}</span>
                      </div>
                    )}
                    {spec.neck_wood && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Neck Wood</span>
                        <span className="font-medium text-right">{spec.neck_wood}</span>
                      </div>
                    )}
                    {spec.fingerboard_wood && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Fingerboard Wood</span>
                        <span className="font-medium text-right">{spec.fingerboard_wood}</span>
                      </div>
                    )}
                    {spec.scale_length_inches && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Scale Length</span>
                        <span className="font-medium text-right">{Number(spec.scale_length_inches)}&quot;</span>
                      </div>
                    )}
                    {spec.num_frets && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Number of Frets</span>
                        <span className="font-medium text-right">{spec.num_frets}</span>
                      </div>
                    )}
                    {spec.pickup_configuration && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Pickup Configuration</span>
                        <span className="font-medium text-right">{spec.pickup_configuration}</span>
                      </div>
                    )}
                    {spec.bridge_type && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Bridge Type</span>
                        <span className="font-medium text-right">{spec.bridge_type}</span>
                      </div>
                    )}
                  </div>
                ))}
                {model.specifications.length > 1 && (
                  <p className="text-sm text-gray-500 pt-2">
                    And {model.specifications.length - 1} more specification record{model.specifications.length > 2 ? 's' : ''}...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finishes */}
        {model.finishes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Available Finishes ({model.finishes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {model.finishes.slice(0, 10).map((finish) => (
                  <div key={finish.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-600">{finish.finish_name}</span>
                    <span className="font-medium text-right">{finish.color_code || finish.finish_type || 'N/A'}</span>
                  </div>
                ))}
                {model.finishes.length > 10 && (
                  <p className="text-sm text-gray-500 pt-2">
                    And {model.finishes.length - 10} more finishes...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Individual Guitars */}
        {model.individual_guitars.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Guitar className="h-5 w-5" />
                Recent Individual Guitars ({model._count.individual_guitars} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {model.individual_guitars.map((guitar) => (
                  <div key={guitar.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="space-y-1">
                      <div className="font-medium">
                        {guitar.serial_number || 'No Serial Number'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {guitar.production_date ? formatDate(guitar.production_date) : 'Unknown date'}
                        {guitar._count.notable_associations > 0 && (
                          <span className="ml-2 text-blue-600">
                            • {guitar._count.notable_associations} notable association{guitar._count.notable_associations !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/guitars/${guitar.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {model._count.individual_guitars > 10 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" asChild>
                      <Link href={`/guitars?model=${model.id}`}>
                        View All {model._count.individual_guitars} Guitars
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}