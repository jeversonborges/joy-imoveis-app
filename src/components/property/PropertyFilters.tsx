'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { PropertyFilters, ListingType, PropertyType } from '@/types'
import { LISTING_TYPES, PROPERTY_TYPES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PropertyFiltersBarProps {
  filters: PropertyFilters
  onChange: (filters: PropertyFilters) => void
}

export function PropertyFiltersBar({ filters, onChange }: PropertyFiltersBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [search, setSearch] = useState(filters.search || '')

  const activeCount = [
    filters.listing_type,
    filters.property_type,
    filters.min_bedrooms,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onChange({ ...filters, search: search || undefined })
  }

  const clearFilters = () => {
    setSearch('')
    onChange({})
  }

  return (
    <div className="bg-white border-b sticky top-16 z-40">
      <div className="container py-3">
        {/* Barra principal */}
        <div className="flex items-center gap-2">
          {/* Busca */}
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, bairro, cidade..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="sm">Buscar</Button>
          </form>

          {/* Tipo de anúncio */}
          <div className="hidden md:flex rounded-lg border overflow-hidden">
            <button
              onClick={() => onChange({ ...filters, listing_type: undefined })}
              className={cn(
                'px-3 py-2 text-sm transition-colors',
                !filters.listing_type
                  ? 'bg-primary text-white'
                  : 'hover:bg-accent'
              )}
            >
              Todos
            </button>
            {LISTING_TYPES.map((lt) => (
              <button
                key={lt.value}
                onClick={() => onChange({ ...filters, listing_type: lt.value })}
                className={cn(
                  'px-3 py-2 text-sm border-l transition-colors',
                  filters.listing_type === lt.value
                    ? 'bg-primary text-white'
                    : 'hover:bg-accent'
                )}
              >
                {lt.label}
              </button>
            ))}
          </div>

          {/* Filtros avançados */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1" />
            Filtros
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </Button>

          {activeCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Tipo de imóvel */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Tipo
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={filters.property_type || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    property_type: (e.target.value as PropertyType) || undefined,
                  })
                }
              >
                <option value="">Todos</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quartos */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Quartos
              </label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={filters.min_bedrooms || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    min_bedrooms: Number(e.target.value) || undefined,
                  })
                }
              >
                <option value="">Todos</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>

            {/* Preço mínimo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Preço mín. (R$)
              </label>
              <Input
                type="number"
                placeholder="0"
                className="h-9"
                value={filters.min_price || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    min_price: Number(e.target.value) || undefined,
                  })
                }
              />
            </div>

            {/* Preço máximo */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Preço máx. (R$)
              </label>
              <Input
                type="number"
                placeholder="Sem limite"
                className="h-9"
                value={filters.max_price || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    max_price: Number(e.target.value) || undefined,
                  })
                }
              />
            </div>

            {/* Cidade */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Cidade
              </label>
              <Input
                placeholder="São Paulo, RJ..."
                className="h-9"
                value={filters.city || ''}
                onChange={(e) =>
                  onChange({ ...filters, city: e.target.value || undefined })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
