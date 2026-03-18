'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  X, ChevronLeft, ChevronRight, BedDouble, Bath, Car,
  Maximize2, MapPin, MessageCircle, Heart
} from 'lucide-react'
import type { MapProperty } from '@/types'
import { formatCurrency, listingTypeLabel, propertyTypeLabel } from '@/lib/utils'
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorite'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

interface PropertyMapCardProps {
  property: MapProperty
  onClose: () => void
}

export function PropertyMapCard({ property: pin, onClose }: PropertyMapCardProps) {
  const [detail, setDetail] = useState<Property | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const { data: favorites = [] } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const isFavorited = favorites.includes(pin.id)

  // Animação de entrada
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Busca detalhes completos (fotos, descrição, contato)
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('properties')
      .select('*, profiles!owner_id(id, full_name, avatar_url, phone, whatsapp)')
      .eq('id', pin.id)
      .single()
      .then(({ data }) => setDetail(data as unknown as Property))
  }, [pin.id])

  const photos = detail?.photo_urls?.length
    ? detail.photo_urls
    : pin.cover_photo_url
    ? [pin.cover_photo_url]
    : []

  const prevPhoto = () => setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1))
  const nextPhoto = () => setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0))

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-16 z-[1000] transition-transform duration-300 ease-out px-3',
        visible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-lg mx-auto">
        {/* Carrossel de fotos */}
        <div className="relative h-52 bg-gray-100">
          {photos.length > 0 ? (
            <>
              <Image
                src={photos[photoIndex]}
                alt={pin.title}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={cn(
                          'rounded-full transition-all',
                          i === photoIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-200" />
            </div>
          )}

          {/* Badge tipo */}
          <div className={cn(
            'absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full',
            pin.listing_type === 'sale'
              ? 'bg-green-500 text-white'
              : 'bg-blue-500 text-white'
          )}>
            {listingTypeLabel(pin.listing_type)}
          </div>

          {/* Botões topo direito */}
          <div className="absolute top-3 right-3 flex gap-2">
            <button
              onClick={() => toggleFavorite({ propertyId: pin.id, isFavorited })}
              className="bg-white/90 backdrop-blur rounded-full p-1.5 shadow"
            >
              <Heart className={cn('h-4 w-4', isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500')} />
            </button>
            <button
              onClick={handleClose}
              className="bg-white/90 backdrop-blur rounded-full p-1.5 shadow"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Letreiro animado da descrição */}
          {detail?.description && (
            <div className="overflow-hidden mb-1.5">
              <p className="text-xs text-muted-foreground whitespace-nowrap animate-marquee">
                {detail.description}
              </p>
            </div>
          )}

          {/* Título + preço */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-base leading-tight line-clamp-1 flex-1">
              {pin.title}
            </h3>
            <div className="text-right shrink-0">
              <p className="font-bold text-primary text-lg leading-none">
                {formatCurrency(pin.price_cents)}
              </p>
              {pin.listing_type === 'rent' && (
                <p className="text-xs text-muted-foreground">/mês</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span>{propertyTypeLabel(pin.property_type)}</span>
            {detail?.area_m2 && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3" />{detail.area_m2}m²
              </span>
            )}
            {pin.bedrooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3 w-3" />{pin.bedrooms}
              </span>
            )}
            {detail?.bathrooms ? (
              <span className="flex items-center gap-1">
                <Bath className="h-3 w-3" />{detail.bathrooms}
              </span>
            ) : null}
            {detail?.parking_spots ? (
              <span className="flex items-center gap-1">
                <Car className="h-3 w-3" />{detail.parking_spots}
              </span>
            ) : null}
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Link
              href={`/imoveis/${pin.id}?lat=${pin.latitude}&lng=${pin.longitude}`}
              className="flex-1 bg-primary text-white text-sm font-semibold rounded-xl py-2.5 text-center hover:bg-primary/90 transition-colors"
            >
              Ver detalhes
            </Link>
            {detail?.profiles?.whatsapp && (
              <a
                href={`https://wa.me/55${detail.profiles.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Vi seu imóvel "${pin.title}" no JoyNest e tenho interesse!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 flex items-center gap-1.5 text-sm font-semibold transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Zap
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
