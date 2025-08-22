import { prisma } from "@/lib/prisma"
import { ProductLinesListClient } from "./product-lines-list-client"

async function getProductLines() {
  const [productLines, productLineImages] = await Promise.all([
    prisma.product_lines.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        introduced_year: true,
        discontinued_year: true,
        updated_at: true,
        manufacturers: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
        _count: {
          select: {
            models: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.images.findMany({
      where: {
        entity_type: 'product_line',
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

  // Create a map of product line ID to image
  const imageMap = new Map(
    productLineImages.map(image => [image.entity_id, image])
  )

  // Combine product lines with their images
  return productLines.map(productLine => ({
    ...productLine,
    image: imageMap.get(productLine.id) || null,
  }))
}

export default async function ProductLinesList() {
  const productLines = await getProductLines()
  return <ProductLinesListClient productLines={productLines} />
}