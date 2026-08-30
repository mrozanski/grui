/**
 * Type definitions for mock instrument JSON data structures
 */

export interface ManufacturerData {
  name: string
  display_name: string
  country: string
  founded_year: number
  website: string
  status: string
  notes?: string
}

export interface ModelData {
  manufacturer_name: string
  product_line_name?: string
  name: string
  year: number
  production_type: string
  description?: string
  msrp_original?: number
  currency?: string
  specifications?: ModelSpecifications
}

export interface ModelSpecifications {
  body_wood?: string
  neck_wood?: string
  fingerboard_wood?: string
  scale_length_inches?: number
  num_frets?: number
  nut_width_inches?: number
  neck_profile?: string
  bridge_type?: string
  pickup_configuration?: string
  electronics_description?: string
  hardware_finish?: string
  body_finish?: string
  case_included?: boolean
  case_type?: string
}

export interface ModelReference {
  manufacturer_name: string
  model_name: string
  year: number
}

export interface Photo {
  source: string
  type: string
  caption?: string
  is_primary: boolean
}

export interface IndividualGuitarSpecifications {
  body_wood?: string
  neck_wood?: string
  fingerboard_wood?: string
  scale_length_inches?: number
  num_frets?: number
  neck_profile?: string
  bridge_type?: string
  pickup_configuration?: string
  electronics_description?: string
  hardware_finish?: string
  body_finish?: string
  weight_lbs?: number
  case_included?: boolean
  case_type?: string
}

export interface IndividualGuitar {
  model_reference: ModelReference
  nickname: string
  serial_number: string
  significance_level: string
  significance_notes?: string
  current_estimated_value: number
  condition_rating: string
  modifications?: string
  provenance_notes?: string
  specifications: IndividualGuitarSpecifications
  photos: Photo[]
}

export interface InstrumentData {
  manufacturer: ManufacturerData
  model: ModelData
  individual_guitar: IndividualGuitar
}

export interface TimelineEvent {
  date: string // ISO date string
  title: string
  description: string
}
