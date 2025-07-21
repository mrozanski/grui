import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, FileText, Guitar, Calendar, Factory } from "lucide-react"
import Image from "next/image"

interface ProductLineDetailProps {
  params: Promise<{ id: string }>
}

export default async function ProductLineDetail({ params }: ProductLineDetailProps) {
  const { id } = await params
  const [productLine, primaryImage] = await Promise.all([
    prisma.product_lines.findUnique({
      where: { id },
      include: {
        manufacturers: true,
        models: {
          orderBy: [{ year: 'desc' }, { name: 'asc' }],
          include: {
            _count: {
              select: { individual_guitars: true },
            },
          },
        },
        _count: {
          select: {
            models: true,
          },
        },
      },
    }),
    prisma.images.findFirst({
      where: {
        entity_type: 'product_line',
        entity_id: id,
        is_primary: true,
      },
      orderBy: { display_order: 'asc' }
    })
  ])

  if (!productLine) {
    notFound()
  }

  const getStatusColor = (introduced: number | null, discontinued: number | null) => {
    if (!discontinued) return 'bg-green-100 text-green-800' // Active
    return 'bg-red-100 text-red-800' // Discontinued
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/product-lines">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product Lines
          </Button>
        </Link>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {primaryImage ? (
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={primaryImage.medium_url || primaryImage.small_url || primaryImage.original_url}
                    alt={primaryImage.caption || `${productLine.name} image`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ) : (
                <Package className="h-24 w-24 text-gray-400 flex-shrink-0" />
              )}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{productLine.name}</CardTitle>
                  <Badge className={getStatusColor(productLine.introduced_year, productLine.discontinued_year)}>
                    {getStatusText(productLine.introduced_year, productLine.discontinued_year)}
                  </Badge>
                </div>
                <CardDescription className="text-lg">
                  Product Line by {productLine.manufacturers?.name || 'Unknown Manufacturer'}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Factory className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Manufacturer</p>
                <p className="text-sm text-gray-600">
                  {productLine.manufacturers ? (
                    <Link 
                      href={`/manufacturers/${productLine.manufacturers.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {productLine.manufacturers.name}
                    </Link>
                  ) : (
                    'Unknown'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Production Period</p>
                <p className="text-sm text-gray-600">
                  {getProductionYears(productLine.introduced_year, productLine.discontinued_year)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Models</p>
                <p className="text-sm text-gray-600">
                  {productLine._count.models} model{productLine._count.models !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Guitar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Individual Guitars</p>
                <p className="text-sm text-gray-600">
                  {productLine.models.reduce((total, model) => total + model._count.individual_guitars, 0)} guitar{productLine.models.reduce((total, model) => total + model._count.individual_guitars, 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {productLine.description && (
            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{productLine.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Models */}
      {productLine.models.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Models in this Product Line</CardTitle>
            <CardDescription>
              {productLine.models.length} model{productLine.models.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {productLine.models.map((model) => (
                <Link key={model.id} href={`/models/${model.id}`}>
                  <Card className="transition-shadow hover:shadow-lg h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{model.name}</CardTitle>
                          <CardDescription>
                            {model.year ? `${model.year}` : 'Year unknown'}
                          </CardDescription>
                        </div>
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {model.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {model.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {model._count.individual_guitars} individual guitar{model._count.individual_guitars !== 1 ? 's' : ''}
                        </p>
                        {model.msrp_original && (
                          <p className="text-sm text-gray-500">
                            Original MSRP: ${model.msrp_original.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}