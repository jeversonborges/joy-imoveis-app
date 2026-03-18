'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { PropertyFilters } from '@/types'

// Leaflet usa window/document — NUNCA pode ser importado no servidor
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <Skeleton className="h-full w-full" />
    </div>
  ),
})

interface MapViewProps {
  filters?: PropertyFilters
  className?: string
  onPropertyClick?: (id: string) => void
}

export function MapView({ filters = {}, className, onPropertyClick }: MapViewProps) {
  return (
    <div className={className}>
      <MapInner filters={filters} onPropertyClick={onPropertyClick} />
    </div>
  )
}
