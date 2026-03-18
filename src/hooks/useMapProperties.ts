'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { MapBounds, MapProperty, PropertyFilters } from '@/types'

export function useMapProperties(
  bounds: MapBounds | null,
  filters: PropertyFilters = {}
) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['map-properties', bounds, filters],
    queryFn: async (): Promise<MapProperty[]> => {
      if (!bounds) return []

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('get_map_properties', {
        lat_min: bounds.lat_min,
        lon_min: bounds.lon_min,
        lat_max: bounds.lat_max,
        lon_max: bounds.lon_max,
        p_listing_type: filters.listing_type ?? null,
        p_property_type: filters.property_type ?? null,
        p_min_price: filters.min_price ? filters.min_price * 100 : null,
        p_max_price: filters.max_price ? filters.max_price * 100 : null,
        p_min_bedrooms: filters.min_bedrooms ?? null,
      })

      if (error) throw error
      return (data ?? []) as MapProperty[]
    },
    enabled: !!bounds,
    staleTime: 30_000, // 30 segundos
    placeholderData: (prev) => prev, // mantém dados anteriores ao pan
  })
}
