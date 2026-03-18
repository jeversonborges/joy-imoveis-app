'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { MapView } from '@/components/map/MapView'
import { MapTopBar } from '@/components/map/MapTopBar'
import { useGeolocation } from '@/contexts/GeolocationContext'
import type { PropertyFilters } from '@/types'
import { LocateFixed } from 'lucide-react'

function GPSBanner() {
  const { loading, denied, lat } = useGeolocation()

  // GPS obtido com sucesso — sem banner
  if (lat) return null

  if (loading) return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur shadow rounded-full px-4 py-2 text-sm text-gray-600">
      <LocateFixed className="h-4 w-4 text-blue-500 animate-pulse" />
      Obtendo localização...
    </div>
  )

  if (denied) return (
    <div className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur shadow rounded-full px-4 py-2 text-sm text-gray-600 whitespace-nowrap">
      <LocateFixed className="h-4 w-4 text-gray-400" />
      <span>Localização desativada —</span>
      <button
        onClick={() => window.location.reload()}
        className="text-blue-600 font-semibold underline underline-offset-2"
      >
        Ativar GPS
      </button>
    </div>
  )

  return null
}

export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>({})

  return (
    <div className="fixed inset-0 bottom-16">
      <MapTopBar filters={filters} onFiltersChange={setFilters} />
      <div className="relative h-full w-full">
        <MapView filters={filters} className="h-full w-full" />
        <GPSBanner />
      </div>
    </div>
  )
}
