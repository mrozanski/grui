import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MapPin, Calendar, Package, FileText, ArrowLeft } from "lucide-react"

interface ManufacturerDetailProps {
  params: Promise<{ id: string }>
}

export default async function ManufacturerDetail({ params }: ManufacturerDetailProps) {
  const { id } = await params
  const manufacturer = await prisma.manufacturers.findUnique({
    where: { id },
    include: {
      product_lines: {
        orderBy: { introduced_year: 'asc' },
        include: {
          _count: {
            select: { models: true },
          },
        },
      },
      models: {
        orderBy: [{ year: 'desc' }, { name: 'asc' }],
        take: 10,
        include: {
          product_lines: true,
          _count: {
            select: { individual_guitars: true },
          },
        },
      },
      _count: {
        select: {
          models: true,
          product_lines: true,
        },
      },
    },
  })

  if (!manufacturer) {
    notFound()
  }

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/manufacturers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manufacturers
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-light text-gray-700">
              {manufacturer.name}
            </h1>
            <Badge className={getStatusColor(manufacturer.status)}>
              {manufacturer.status || 'unknown'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            {manufacturer.country && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {manufacturer.country}
              </div>
            )}
            {manufacturer.founded_year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Founded {manufacturer.founded_year}
              </div>
            )}
            {manufacturer.website && (
              <a
                href={manufacturer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Lines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manufacturer._count.product_lines}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manufacturer._count.models}</div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {manufacturer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>About {manufacturer.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{manufacturer.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Product Lines */}
        <Card>
          <CardHeader>
            <CardTitle>Product Lines</CardTitle>
            <CardDescription>
              Guitar series and collections from {manufacturer.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manufacturer.product_lines.map((line) => (
                <Link
                  key={line.id}
                  href={`/product-lines/${line.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{line.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {line.introduced_year && (
                        <span>Introduced {line.introduced_year}</span>
                      )}
                      {line.introduced_year && line.discontinued_year && <span>•</span>}
                      {line.discontinued_year && (
                        <span>Discontinued {line.discontinued_year}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {line._count.models} models
                  </Badge>
                </Link>
              ))}
              
              {manufacturer.product_lines.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No product lines found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Models */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Models</CardTitle>
                <CardDescription>
                  Latest guitar models from {manufacturer.name}
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/models?manufacturer=${manufacturer.id}`}>
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manufacturer.models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{model.name} ({model.year})</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {model.product_lines && (
                        <span>{model.product_lines.name}</span>
                      )}
                      {model.msrp_original && (
                        <>
                          <span>•</span>
                          <span>
                            ${model.msrp_original.toString()} {model.currency}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {model._count.individual_guitars} guitars
                  </Badge>
                </Link>
              ))}
              
              {manufacturer.models.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No models found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}