'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import type { PropertyFilters, ListingType } from '@/types'
import { cn } from '@/lib/utils'

interface MapTopBarProps {
  filters?: PropertyFilters
  onFiltersChange?: (f: PropertyFilters) => void
}

export function MapTopBar({ filters = {}, onFiltersChange }: MapTopBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const setType = (type: ListingType | undefined) => {
    onFiltersChange?.({ ...filters, listing_type: type })
  }

  return (
    <div className="absolute top-0 inset-x-0 z-[999] p-3 flex flex-col gap-2">
      {/* Barra de busca */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur rounded-2xl shadow-lg px-4 h-12 border border-white/50">
          <Search className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="text-gray-400 text-sm flex-1">{APP_NAME} — buscar por cidade...</span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'h-12 w-12 rounded-2xl shadow-lg flex items-center justify-center transition-colors',
            showFilters ? 'bg-primary text-white' : 'bg-white/95 backdrop-blur text-gray-600'
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Filtros rápidos (tipo) */}
      <div className="flex gap-2">
        {[
          { label: 'Todos', value: undefined },
          { label: 'Venda', value: 'sale' as ListingType },
          { label: 'Aluguel', value: 'rent' as ListingType },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setType(opt.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium shadow transition-all',
              filters.listing_type === opt.value || (!filters.listing_type && !opt.value)
                ? 'bg-primary text-white shadow-md'
                : 'bg-white/90 backdrop-blur text-gray-700'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
