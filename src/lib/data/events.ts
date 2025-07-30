import { prisma } from '@/lib/prisma'

export async function getGuitarEvents(guitarId: string) {
  return await prisma.notable_associations.findMany({
    where: { individual_guitar_id: guitarId },
    orderBy: { event_date: 'asc' }
  });
}

export async function getGuitarWithEvents(guitarId: string) {
  return await prisma.individual_guitars.findUnique({
    where: { id: guitarId },
    include: {
      models: {
        include: { manufacturers: true }
      },
      notable_associations: {
        orderBy: { event_date: 'asc' }
      }
    }
  });
} 