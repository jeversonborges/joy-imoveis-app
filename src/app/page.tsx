'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { MapView } from '@/components/map/MapView'
import { MapTopBar } from '@/components/map/MapTopBar'
import type { PropertyFilters } from '@/types'

export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>({})

  return (
    <div className="fixed inset-0 bottom-16">
      <MapTopBar filters={filters} onFiltersChange={setFilters} />
      <MapView filters={filters} className="h-full w-full" />
    </div>
  )
}
