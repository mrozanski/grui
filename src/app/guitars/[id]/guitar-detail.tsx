import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, FileText, Guitar, DollarSign, Building, Calendar, Users, Star } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"

interface GuitarDetailProps {
  params: Promise<{ id: string }>
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

function formatCurrency(amount: number | null | unknown) {
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

function formatDate(date: Date | null) {
  if (!date) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export default async function GuitarDetail({ params }: GuitarDetailProps) {
  const { id } = await params
  const guitar = await prisma.individual_guitars.findUnique({
    where: { id },
    include: {
      models: {
        include: {
          manufacturers: true,
          product_lines: true,
        }
      },
      specifications: {
        orderBy: { id: 'asc' }
      },
      finishes: {
        orderBy: { finish_name: 'asc' }
      },
      notable_associations: {
        orderBy: { period_start: 'desc' },
        take: 10
      },
      market_valuations: {
        orderBy: { valuation_date: 'desc' },
        take: 5
      },
      _count: {
        select: {
          notable_associations: true,
          market_valuations: true,
          specifications: true,
          finishes: true,
        },
      },
    },
  })

  if (!guitar) {
    notFound()
  }

  const displayName = guitar.models ? 
    `${guitar.models.manufacturers?.name || 'Unknown'} ${guitar.models.name}` :
    `${guitar.manufacturer_name_fallback || 'Unknown'} ${guitar.model_name_fallback || 'Model'}`

  const displayYear = guitar.models ? 
    guitar.models.year.toString() : 
    guitar.year_estimate || 'Unknown'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/guitars">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guitars
          </Link>
        </Button>
      </div>

      {/* Header with guitar info */}
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-light text-gray-900">
              {displayName} ({displayYear})
            </h1>
            <div className="flex items-center gap-2 mt-2">
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
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>Serial Number:</span>
              <span className="font-mono font-medium">{guitar.serial_number || 'N/A'}</span>
            </div>
            
            {guitar.models && (
              <>
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>Manufacturer:</span>
                  <Link 
                    href={`/manufacturers/${guitar.models.manufacturers?.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {guitar.models.manufacturers?.name || 'Unknown'}
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Guitar className="h-4 w-4" />
                  <span>Model:</span>
                  <Link 
                    href={`/models/${guitar.models.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {guitar.models.name}
                  </Link>
                </div>

                {guitar.models.product_lines && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Product Line:</span>
                    <span className="font-medium">{guitar.models.product_lines.name}</span>
                  </div>
                )}
              </>
            )}
            
            {guitar.production_date && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Production Date:</span>
                <span className="font-medium">{formatDate(guitar.production_date)}</span>
              </div>
            )}
            
            {guitar.current_estimated_value && (
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>Current Est. Value:</span>
                <span className="text-green-600 font-medium">
                  {formatCurrency(guitar.current_estimated_value)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Image
          src="/images/guitars/guitar-default.jpg"
          alt="Guitar placeholder"
          width={300}
          height={200}
          className="rounded-lg"
        />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notable Associations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guitar._count.notable_associations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Valuations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guitar._count.market_valuations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specifications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guitar._count.specifications}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Finishes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guitar._count.finishes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Description and significance */}
      {(guitar.description || guitar.significance_notes) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {guitar.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{guitar.description}</p>
              </CardContent>
            </Card>
          )}

          {guitar.significance_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Significance Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{guitar.significance_notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Guitar Details */}
      <Card>
        <CardHeader>
          <CardTitle>Guitar Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              {guitar.production_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Production Number:</span>
                  <span className="font-medium">{guitar.production_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Significance Level:</span>
                <Badge className={getSignificanceColor(guitar.significance_level)}>
                  {guitar.significance_level || 'notable'}
                </Badge>
              </div>
              {guitar.condition_rating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <Badge className={getConditionColor(guitar.condition_rating)}>
                    {guitar.condition_rating}
                  </Badge>
                </div>
              )}
              {guitar.last_valuation_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Valuation:</span>
                  <span className="font-medium">{formatDate(guitar.last_valuation_date)}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              {guitar.modifications && (
                <div>
                  <span className="text-gray-600 block mb-1">Modifications:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded">{guitar.modifications}</p>
                </div>
              )}
              {guitar.provenance_notes && (
                <div>
                  <span className="text-gray-600 block mb-1">Provenance Notes:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded">{guitar.provenance_notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notable Associations */}
        {guitar.notable_associations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Notable Associations ({guitar._count.notable_associations})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guitar.notable_associations.map((association) => (
                  <div key={association.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{association.person_name}</div>
                      <div className="text-sm text-gray-600">
                        {association.association_type && (
                          <span className="capitalize">{association.association_type}</span>
                        )}
                        {association.period_start && (
                          <span className="ml-2">
                            • {formatDate(association.period_start)}
                            {association.period_end && ` - ${formatDate(association.period_end)}`}
                          </span>
                        )}
                      </div>
                      {association.notable_songs && (
                        <div className="text-xs text-gray-500">Songs: {association.notable_songs}</div>
                      )}
                      {association.notable_performances && (
                        <div className="text-xs text-gray-500">Performances: {association.notable_performances}</div>
                      )}
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                ))}
                {guitar._count.notable_associations > 10 && (
                  <p className="text-sm text-gray-500 pt-2">
                    And {guitar._count.notable_associations - 10} more associations...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Valuations */}
        {guitar.market_valuations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Market Valuations ({guitar._count.market_valuations})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {guitar.market_valuations.map((valuation) => (
                  <div key={valuation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium text-green-600">
                        {valuation.sale_price ? 
                          formatCurrency(valuation.sale_price) :
                          valuation.average_estimate ? 
                            formatCurrency(valuation.average_estimate) :
                            valuation.low_estimate && valuation.high_estimate ?
                              `${formatCurrency(valuation.low_estimate)} - ${formatCurrency(valuation.high_estimate)}` :
                              'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(valuation.valuation_date)}
                        {valuation.sale_venue && (
                          <span className="ml-2">• {valuation.sale_venue}</span>
                        )}
                      </div>
                      {valuation.condition_at_valuation && (
                        <div className="text-xs text-gray-500">
                          Condition: {valuation.condition_at_valuation}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      Valuation
                    </div>
                  </div>
                ))}
                {guitar._count.market_valuations > 5 && (
                  <p className="text-sm text-gray-500 pt-2">
                    And {guitar._count.market_valuations - 5} more valuations...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        {guitar.specifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Specifications ({guitar.specifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guitar.specifications.slice(0, 1).map((spec) => (
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Finishes */}
        {guitar.finishes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Finishes ({guitar.finishes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {guitar.finishes.map((finish) => (
                  <div key={finish.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-600">{finish.finish_name}</span>
                    <span className="font-medium text-right">
                      {finish.color_code || finish.finish_type || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}