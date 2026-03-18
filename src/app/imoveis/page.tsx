'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useProperties } from '@/hooks/useProperties'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import { PropertyFiltersBar } from '@/components/property/PropertyFilters'
import type { PropertyFilters } from '@/types'

export default function ImoveisPage() {
  const [filters, setFilters] = useState<PropertyFilters>({})
  const { data: properties = [], isLoading } = useProperties(filters)

  return (
    <div>
      <PropertyFiltersBar filters={filters} onChange={setFilters} />

      <div className="container py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Carregando...' : `${properties.length} imóvel(is) encontrado(s)`}
          </p>
        </div>

        <PropertyGrid properties={properties} isLoading={isLoading} />
      </div>
    </div>
  )
}
