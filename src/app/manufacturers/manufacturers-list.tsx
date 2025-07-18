import { prisma } from "@/lib/prisma"
import { ManufacturersListClient } from "./manufacturers-list-client"

async function getManufacturers() {
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

  return manufacturers
}

export default async function ManufacturersList() {
  const manufacturers = await getManufacturers()
  return <ManufacturersListClient manufacturers={manufacturers} />
}