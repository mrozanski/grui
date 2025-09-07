import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, FileText, Guitar, DollarSign, Building, Calendar } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import { 
  getGuitarDisplayName, 
  getGuitarDisplayYear, 
  getSignificanceColor, 
  getConditionColor, 
  formatCurrency, 
  formatDate 
} from "@/lib/guitar-utils"

interface GuitarDetailProps {
  params: Promise<{ id: string }>
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

      market_valuations: {
        orderBy: { valuation_date: 'desc' },
        take: 5
      },
      _count: {
        select: {
          market_valuations: true,
          specifications: true,
        },
      },
    },
  })

  // Get the primary image for this guitar
  const primaryImage = await prisma.images.findFirst({
    where: {
      entity_type: 'individual_guitar',
      entity_id: id,
      is_primary: true,
    },
    orderBy: { display_order: 'asc' }
  })

  if (!guitar) {
    notFound()
  }

  const displayName = getGuitarDisplayName(guitar)
  const displayYear = getGuitarDisplayYear(guitar)

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
          src={primaryImage?.medium_url || primaryImage?.original_url || "/images/guitars/guitar-default.jpg"}
          alt={primaryImage?.caption || "Guitar image"}
          width={300}
          height={200}
          className="rounded-lg"
        />
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      </div>
    </div>
  )
}