'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createHistoricalEvent(data: {
  guitarId: string;
  eventType: string;
  eventTitle?: string;
  eventDescription?: string;
  eventDate?: string;
  venueName?: string;
  personName: string;
  attestorName?: string;
  attestorRelationship?: string;
  evidenceUrl?: string;
}) {
  try {
    const event = await prisma.notable_associations.create({
      data: {
        individual_guitar_id: data.guitarId,
        person_name: data.personName,
        event_type: data.eventType,
        event_title: data.eventTitle,
        event_description: data.eventDescription,
        event_date: data.eventDate ? new Date(data.eventDate) : null,
        venue_name: data.venueName,
        attestor_name: data.attestorName,
        attestor_relationship: data.attestorRelationship,
        evidence_url: data.evidenceUrl,
      }
    });
    
    revalidatePath(`/guitars/${data.guitarId}`);
    return { success: true, event };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function simulateEventAttestation(eventId: string) {
  const fakeHash = `Qm${Math.random().toString(36).substring(2, 15)}`;
  const fakeUID = `0x${Math.random().toString(16).substring(2, 18)}...`;
  
  await prisma.notable_associations.update({
    where: { id: eventId },
    data: {
      evidence_hash: fakeHash,
      attestation_uid: fakeUID,
      verification_status: 'verified'
    }
  });
  
  revalidatePath('/guitars');
  return { evidence_hash: fakeHash, attestation_uid: fakeUID };
} 