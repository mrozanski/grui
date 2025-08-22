import { prisma } from "@/lib/prisma"
import { ModelsListClient } from "./models-list-client"

async function getModels() {
  const models = await prisma.models.findMany({
    select: {
      id: true,
      name: true,
      year: true,
      production_type: true,
      msrp_original: true,
      currency: true,
      description: true,
      updated_at: true,
      manufacturers: {
        select: {
          id: true,
          name: true,
        }
      },
      product_lines: {
        select: {
          id: true,
          name: true,
        }
      },
      _count: {
        select: {
          individual_guitars: true,
          specifications: true,
          finishes: true,
        },
      },
    },
    orderBy: [
      { name: 'asc' },
      { year: 'asc' },
    ],
  })

  // Convert Decimal values to regular numbers for serialization
  return models.map(model => ({
    ...model,
    msrp_original: model.msrp_original ? Number(model.msrp_original) : null,
  }))
}

export default async function ModelsList() {
  const models = await getModels()
  return <ModelsListClient models={models} />
}