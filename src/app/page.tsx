import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

async function getData() {
  const [
    manufacturersCount,
    productLinesCount,
    modelsCount,
    guitarsCount,
    recentManufacturers,
    recentGuitars,
  ] = await Promise.all([
    prisma.manufacturers.count(),
    prisma.product_lines.count(),
    prisma.models.count(),
    prisma.individual_guitars.count(),

    prisma.manufacturers.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name: true,
        country: true,
        status: true,
      },
    }),
    prisma.individual_guitars.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        serial_number: true,
        significance_level: true,
        manufacturer_name_fallback: true,
        model_name_fallback: true,
        year_estimate: true,
        models: {
          select: {
            name: true,
            year: true,
            manufacturers: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ])

  return {
    stats: {
      manufacturersCount,
      productLinesCount,
      modelsCount,
      guitarsCount,

    },
    recentManufacturers,
    recentGuitars,
  }
}

export default async function Dashboard() {
  const data = await getData()
  return <DashboardClient data={data} />
}