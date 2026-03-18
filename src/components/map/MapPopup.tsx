'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, BedDouble, MapPin } from 'lucide-react'
import type { MapProperty } from '@/types'
import { formatCurrency, listingTypeLabel, propertyTypeLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface MapPopupProps {
  property: MapProperty
  onClose: () => void
  onViewDetail?: () => void
}

export function MapPopup({ property, onClose, onViewDetail }: MapPopupProps) {
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Foto */}
      <div className="relative h-36">
        {property.cover_photo_url ? (
          <Image
            src={property.cover_photo_url}
            alt={property.title}
            fill
            className="object-cover"
            sizes="288px"
          />
        ) : (
          <div className="h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-gray-300" />
          </div>
        )}
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow hover:bg-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {/* Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant={property.listing_type as 'sale' | 'rent'}>
            {listingTypeLabel(property.listing_type)}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm line-clamp-1">{property.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {propertyTypeLabel(property.property_type)}
          {property.bedrooms > 0 && (
            <span className="ml-2 inline-flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {property.bedrooms}
            </span>
          )}
        </p>
        <p className="text-base font-bold text-primary mt-1">
          {formatCurrency(property.price_cents)}
          {property.listing_type === 'rent' && (
            <span className="text-xs font-normal text-muted-foreground">/mês</span>
          )}
        </p>

        <Link
          href={`/imoveis/${property.id}`}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-2 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
          onClick={onViewDetail}
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  )
}
