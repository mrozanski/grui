/**
 * Data loading utilities for mock instrument JSON files
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { notFound } from 'next/navigation'
import type { InstrumentData, TimelineEvent } from '@/types/mock-instrument'

/**
 * Load instrument data from JSON file
 * 
 * @param id - Instrument identifier (used as filename)
 * @returns Parsed instrument data
 * @throws Calls notFound() if file doesn't exist
 */
export async function loadInstrumentData(id: string): Promise<InstrumentData> {
  try {
    const filePath = join(process.cwd(), 'mock-data', 'instrument', `${id}.json`)
    const fileContents = await readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContents) as InstrumentData
    
    // Basic validation
    if (!data.manufacturer || !data.model || !data.individual_guitar) {
      throw new Error('Invalid instrument data structure')
    }
    
    return data
  } catch (error) {
    // If file doesn't exist, show 404
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      notFound()
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Load timeline data from JSON file (optional)
 * 
 * @param id - Instrument identifier (used as filename)
 * @returns Array of timeline events, or empty array if file doesn't exist
 */
export async function loadTimelineData(id: string): Promise<TimelineEvent[]> {
  try {
    const filePath = join(process.cwd(), 'mock-data', 'instrument', `${id}-timeline.json`)
    const fileContents = await readFile(filePath, 'utf-8')
    const data = JSON.parse(fileContents) as TimelineEvent[]
    
    // Validate it's an array
    if (!Array.isArray(data)) {
      return []
    }
    
    // Validate each event has required fields
    const validEvents = data.filter(event => 
      event.date && event.title && event.description
    )
    
    return validEvents
  } catch (error) {
    // If file doesn't exist, return empty array (optional file)
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    // For other errors, return empty array to be safe
    return []
  }
}
