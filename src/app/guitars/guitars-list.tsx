import { prisma } from "@/lib/prisma"
import { GuitarsListClient } from "./guitars-list-client"

async function getGuitars() {
  const guitars = await prisma.individual_guitars.findMany({
    select: {
      id: true,
      serial_number: true,
      production_date: true,
      significance_level: true,
      current_estimated_value: true,
      condition_rating: true,
      manufacturer_name_fallback: true,
      model_name_fallback: true,
      year_estimate: true,
      description: true,
      models: {
        select: {
          id: true,
          name: true,
          year: true,
          manufacturers: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      },
      _count: {
        select: {
          notable_associations: true,
          market_valuations: true,
        },
      },
    },
    orderBy: [
      { significance_level: 'asc' },
      { current_estimated_value: 'desc' },
      { serial_number: 'asc' }
    ],
  })

  // Convert Decimal values to regular numbers for serialization
  return guitars.map(guitar => ({
    ...guitar,
    current_estimated_value: guitar.current_estimated_value ? Number(guitar.current_estimated_value) : null,
  }))
}

export default async function GuitarsList() {
  const guitars = await getGuitars()
  return <GuitarsListClient guitars={guitars} />
}