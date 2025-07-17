import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, MapPin, Calendar } from "lucide-react"

export default async function ManufacturersList() {
  const manufacturers = await prisma.manufacturers.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      founded_year: true,
      website: true,
      status: true,
      notes: true,
      _count: {
        select: {
          models: true,
          product_lines: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light text-gray-900">Guitar Manufacturers</h1>
        <p className="mt-2 text-gray-600">
          Explore the companies that have shaped the electric guitar industry
        </p>
      </div>

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

      {manufacturers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No manufacturers found.</p>
        </div>
      )}
    </div>
  )
}