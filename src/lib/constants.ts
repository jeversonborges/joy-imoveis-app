import type { ListingType, PropertyType } from '@/types'

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'ImoveisApp'

// Centro padrão do mapa (Brasil)
export const DEFAULT_MAP_CENTER: [number, number] = [-14.235, -51.9253]
export const DEFAULT_MAP_ZOOM = 5
export const CITY_MAP_ZOOM = 13

export const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'sale', label: 'Venda' },
  { value: 'rent', label: 'Aluguel' },
]

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'land', label: 'Terreno' },
  { value: 'studio', label: 'Kitnet/Studio' },
  { value: 'penthouse', label: 'Cobertura' },
]

export const BEDROOM_OPTIONS = [
  { value: '0', label: 'Studio' },
  { value: '1', label: '1 quarto' },
  { value: '2', label: '2 quartos' },
  { value: '3', label: '3 quartos' },
  { value: '4', label: '4+ quartos' },
]

export const PROPERTY_FEATURES: { key: string; label: string; icon: string }[] = [
  { key: 'pool', label: 'Piscina', icon: '🏊' },
  { key: 'gym', label: 'Academia', icon: '🏋️' },
  { key: 'elevator', label: 'Elevador', icon: '🛗' },
  { key: 'furnished', label: 'Mobiliado', icon: '🛋️' },
  { key: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' },
  { key: 'balcony', label: 'Varanda', icon: '🌿' },
  { key: 'security', label: 'Segurança 24h', icon: '🔒' },
  { key: 'playground', label: 'Playground', icon: '🎠' },
  { key: 'party_room', label: 'Salão de Festas', icon: '🎉' },
  { key: 'barbecue', label: 'Churrasqueira', icon: '🔥' },
]

export const MAX_PHOTOS = 10
export const MAX_PHOTO_SIZE_MB = 5
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const SALE_PRICE_RANGES = [
  { label: 'Até R$ 200k', min: 0, max: 20000000 },
  { label: 'R$ 200k - 500k', min: 20000000, max: 50000000 },
  { label: 'R$ 500k - 1M', min: 50000000, max: 100000000 },
  { label: 'R$ 1M - 2M', min: 100000000, max: 200000000 },
  { label: 'Acima de R$ 2M', min: 200000000, max: undefined },
]

export const RENT_PRICE_RANGES = [
  { label: 'Até R$ 1.500', min: 0, max: 150000 },
  { label: 'R$ 1.500 - 3.000', min: 150000, max: 300000 },
  { label: 'R$ 3.000 - 6.000', min: 300000, max: 600000 },
  { label: 'R$ 6.000 - 10.000', min: 600000, max: 1000000 },
  { label: 'Acima de R$ 10.000', min: 1000000, max: undefined },
]

// Supabase Storage bucket
export const STORAGE_BUCKET = 'property-photos'

// Nominatim
export const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org'
