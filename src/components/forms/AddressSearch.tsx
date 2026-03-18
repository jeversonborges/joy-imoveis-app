'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { searchAddress, extractAddressFromResult } from '@/lib/geocoding'
import type { NominatimResult } from '@/types'

interface AddressSearchProps {
  onSelect: (result: {
    address_street: string
    address_number: string
    address_neighborhood: string
    address_city: string
    address_state: string
    address_zip: string
    latitude: number
    longitude: number
  }) => void
  defaultValue?: string
}

export function AddressSearch({ onSelect, defaultValue = '' }: AddressSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return }
    setIsLoading(true)
    try {
      const data = await searchAddress(q)
      setResults(data)
      setIsOpen(data.length > 0)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 500)
  }

  const handleSelect = (result: NominatimResult) => {
    const extracted = extractAddressFromResult(result)
    setQuery(result.display_name.split(',').slice(0, 3).join(','))
    setIsOpen(false)
    setResults([])
    onSelect(extracted)
  }

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {isLoading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          placeholder="Digite o endereço, bairro ou cidade..."
          className="pl-9"
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-2 px-3 py-2.5 hover:bg-accent text-left text-sm transition-colors"
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
