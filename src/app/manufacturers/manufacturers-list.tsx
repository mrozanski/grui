import { prisma } from "@/lib/prisma"
import { ManufacturersListClient } from "./manufacturers-list-client"

async function getManufacturers() {
  const [manufacturers, manufacturerLogos] = await Promise.all([
    prisma.manufacturers.findMany({
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
    }),
    prisma.images.findMany({
      where: {
        entity_type: 'manufacturer',
        image_type: 'logo',
        is_primary: true,
        validation_status: 'approved',
        is_duplicate: false,
      },
      select: {
        entity_id: true,
        id: true,
        thumbnail_url: true,
        small_url: true,
        medium_url: true,
        large_url: true,
        original_url: true,
        caption: true,
      },
    }),
  ])

  // Create a map of manufacturer ID to logo
  const logoMap = new Map(
    manufacturerLogos.map(logo => [logo.entity_id, logo])
  )

  // Combine manufacturers with their logos
  return manufacturers.map(manufacturer => ({
    ...manufacturer,
    logo: logoMap.get(manufacturer.id) || null,
  }))
}

export default async function ManufacturersList() {
  const manufacturers = await getManufacturers()
  return <ManufacturersListClient manufacturers={manufacturers} />
}