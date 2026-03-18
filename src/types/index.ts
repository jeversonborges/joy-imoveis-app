export type ListingType = 'sale' | 'rent'
export type PropertyType =
  | 'apartment'
  | 'house'
  | 'commercial'
  | 'land'
  | 'studio'
  | 'penthouse'
export type PropertyStatus = 'active' | 'paused' | 'sold' | 'rented'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  whatsapp: string | null
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  owner_id: string
  title: string
  description: string | null
  listing_type: ListingType
  property_type: PropertyType
  status: PropertyStatus
  price_cents: number
  condo_fee_cents: number
  iptu_cents: number
  address_street: string
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string
  address_state: string
  address_zip: string | null
  address_full: string | null
  latitude?: number
  longitude?: number
  area_m2: number | null
  bedrooms: number
  bathrooms: number
  parking_spots: number
  floor: number | null
  total_floors: number | null
  features: PropertyFeatures
  photo_urls: string[]
  cover_photo_url: string | null
  created_at: string
  updated_at: string
  published_at: string | null
  // Joined
  profiles?: Profile
}

export interface PropertyFeatures {
  pool?: boolean
  gym?: boolean
  elevator?: boolean
  furnished?: boolean
  pet_friendly?: boolean
  balcony?: boolean
  security?: boolean
  playground?: boolean
  party_room?: boolean
  barbecue?: boolean
}

// Tipo leve para pins do mapa
export interface MapProperty {
  id: string
  title: string
  listing_type: ListingType
  property_type: PropertyType
  price_cents: number
  latitude: number
  longitude: number
  cover_photo_url: string | null
  bedrooms: number
}

export interface Favorite {
  user_id: string
  property_id: string
  created_at: string
}

// Filtros usados no mapa e na listagem
export interface PropertyFilters {
  listing_type?: ListingType
  property_type?: PropertyType
  min_price?: number
  max_price?: number
  min_bedrooms?: number
  city?: string
  search?: string
}

// Bounds do mapa (viewport)
export interface MapBounds {
  lat_min: number
  lon_min: number
  lat_max: number
  lon_max: number
}

// Resultado de geocodificação Nominatim
export interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    neighbourhood?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}
