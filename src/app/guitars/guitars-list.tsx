import { prisma } from "@/lib/prisma"
import { GuitarsListClient } from "./guitars-list-client"

async function getGuitars() {
  const guitars = await prisma.individual_guitars.findMany({
    select: {
      id: true,
      serial_number: true,
      nickname: true,
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
              display_name: true,
            }
          }
        }
      },
      _count: {
        select: {
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

  // Get images for all guitars in a separate query for better performance
  const guitarIds = guitars.map(g => g.id)
  const images = await prisma.images.findMany({
    where: {
      entity_type: 'individual_guitar',
      entity_id: { in: guitarIds },
      image_type: { in: ['gallery', 'primary', 'body_front', 'headstock'] }
    },
    select: {
      entity_id: true,
      image_type: true,
      thumbnail_url: true,
      small_url: true,
      medium_url: true,
      original_url: true,
      caption: true,
      display_order: true,
    },
    orderBy: [
      { entity_id: 'asc' },
      { display_order: 'asc' }
    ]
  })

  // Group images by guitar ID
  const imagesByGuitar = images.reduce((acc, image) => {
    if (!acc[image.entity_id]) {
      acc[image.entity_id] = []
    }
    acc[image.entity_id].push(image)
    return acc
  }, {} as Record<string, typeof images>)

  // Convert Decimal values to regular numbers for serialization and add images
  return guitars.map(guitar => ({
    ...guitar,
    current_estimated_value: guitar.current_estimated_value ? Number(guitar.current_estimated_value) : null,
    images: imagesByGuitar[guitar.id] || [],
  }))
}

export default async function GuitarsList() {
  const guitars = await getGuitars()
  return <GuitarsListClient guitars={guitars} />
}