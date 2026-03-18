'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, BedDouble, Bath, Car, Maximize2, MapPin } from 'lucide-react'
import type { Property } from '@/types'
import { formatCurrency, listingTypeLabel, propertyTypeLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorite'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property: p }: PropertyCardProps) {
  const { data: favorites = [] } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const isFavorited = favorites.includes(p.id)

  return (
    <div className="group bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Foto */}
      <Link href={`/imoveis/${p.id}`} className="block relative h-48 overflow-hidden">
        {p.cover_photo_url ? (
          <Image
            src={p.cover_photo_url}
            alt={p.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <MapPin className="h-12 w-12 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant={p.listing_type as 'sale' | 'rent'}>
            {listingTypeLabel(p.listing_type)}
          </Badge>
        </div>

        {/* Favoritar */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggleFavorite({ propertyId: p.id, isFavorited })
          }}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow hover:bg-white transition-colors"
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn('h-4 w-4 transition-colors', isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400')}
          />
        </button>
      </Link>

      {/* Info */}
      <Link href={`/imoveis/${p.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-1 flex-1">{p.title}</h3>
        </div>

        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">
            {p.address_neighborhood ? `${p.address_neighborhood}, ` : ''}
            {p.address_city} - {p.address_state}
          </span>
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {p.area_m2 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> {p.area_m2}m²
            </span>
          )}
          {p.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" /> {p.bedrooms}
            </span>
          )}
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" /> {p.bathrooms}
            </span>
          )}
          {p.parking_spots > 0 && (
            <span className="flex items-center gap-1">
              <Car className="h-3 w-3" /> {p.parking_spots}
            </span>
          )}
        </div>

        {/* Preço */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(p.price_cents)}
              {p.listing_type === 'rent' && (
                <span className="text-xs font-normal text-muted-foreground">/mês</span>
              )}
            </p>
            {p.condo_fee_cents > 0 && (
              <p className="text-xs text-muted-foreground">
                + {formatCurrency(p.condo_fee_cents)} condom.
              </p>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{propertyTypeLabel(p.property_type)}</span>
        </div>
      </Link>
    </div>
  )
}
