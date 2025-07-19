"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, Guitar, Package, FileText, Users } from "lucide-react"
import Link from "next/link"

interface Manufacturer {
  id: string
  name: string
  country: string | null
  status: string | null
}

interface Guitar {
  id: string
  serial_number: string | null
  significance_level: string | null
  models: {
    name: string
    manufacturers: {
      name: string
    } | null
  } | null
}

interface DashboardData {
  stats: {
    manufacturersCount: number
    productLinesCount: number
    modelsCount: number
    guitarsCount: number
    associationsCount: number
  }
  recentManufacturers: Manufacturer[]
  recentGuitars: Guitar[]
}

interface DashboardClientProps {
  data: DashboardData
}

export function DashboardClient({ data }: DashboardClientProps) {
  const { stats, recentManufacturers, recentGuitars } = data

  const statsConfig = [
    {
      title: "Manufacturers",
      value: stats.manufacturersCount.toLocaleString(),
      icon: Factory,
      href: "/manufacturers",
      description: "Guitar companies tracked",
    },
    {
      title: "Product Lines", 
      value: stats.productLinesCount.toLocaleString(),
      icon: Package,
      href: "/product-lines",
      description: "Guitar series and collections",
    },
    {
      title: "Models",
      value: stats.modelsCount.toLocaleString(), 
      icon: FileText,
      href: "/models",
      description: "Guitar models catalogued",
    },
    {
      title: "Individual Guitars",
      value: stats.guitarsCount.toLocaleString(),
      icon: Guitar,
      href: "/guitars", 
      description: "Specific instruments tracked",
    },
    {
      title: "Notable Associations",
      value: stats.associationsCount.toLocaleString(),
      icon: Users,
      href: "/associations",
      description: "Famous players and owners",
    },
  ]

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of the guitar registry database
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statsConfig.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Manufacturers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Manufacturers</CardTitle>
            <CardDescription>
              Latest manufacturers added to the registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentManufacturers.map((manufacturer) => (
                <Link
                  key={manufacturer.id}
                  href={`/manufacturers/${manufacturer.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{manufacturer.name}</p>
                    <p className="text-sm text-gray-500">{manufacturer.country}</p>
                  </div>
                  <Badge className={getStatusColor(manufacturer.status)}>
                    {manufacturer.status || 'unknown'}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Guitars */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Guitars</CardTitle>
            <CardDescription>
              Latest individual guitars added to the registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGuitars.map((guitar) => (
                <Link
                  key={guitar.id}
                  href={`/guitars/${guitar.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">
                      {guitar.models?.manufacturers?.name || 'Unknown'} {guitar.models?.name || 'Unknown Model'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {guitar.serial_number ? `S/N: ${guitar.serial_number}` : 'No serial number'}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {guitar.significance_level || 'notable'}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}