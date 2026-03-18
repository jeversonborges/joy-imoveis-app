'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  MapPin, Moon, Droplets, ParkingCircle, Expand, Heart,
  Share2, Phone, MessageCircle, ChevronLeft, ChevronRight,
  Building, Calendar, Tag
} from 'lucide-react'
import type { Property } from '@/types'
import {
  formatCurrency, listingTypeLabel, propertyTypeLabel,
  buildWhatsAppLink, formatArea
} from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorite'
import { PROPERTY_FEATURES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/useToast'
import dynamic from 'next/dynamic'

const PropertyPinMap = dynamic(() => import('@/components/map/PropertyPinMap'), { ssr: false })

interface PropertyDetailProps {
  property: Property
  lat?: number
  lng?: number
}

export function PropertyDetail({ property: p, lat, lng }: PropertyDetailProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0)
  const { data: favorites = [] } = useFavorites()
  const { mutate: toggleFavorite } = useToggleFavorite()
  const isFavorited = favorites.includes(p.id)

  const photos = p.photo_urls.length > 0 ? p.photo_urls : []
  const hasPhotos = photos.length > 0

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: p.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast({ title: 'Link copiado!', description: 'Cole para compartilhar o imóvel.' })
    }
  }

  const prevPhoto = () => setCurrentPhoto((c) => (c > 0 ? c - 1 : photos.length - 1))
  const nextPhoto = () => setCurrentPhoto((c) => (c < photos.length - 1 ? c + 1 : 0))

  const activeFeatures = PROPERTY_FEATURES.filter(
    (f) => p.features?.[f.key as keyof typeof p.features]
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Galeria */}
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
            {hasPhotos ? (
              <>
                <div className="relative h-80 md:h-[480px]">
                  <Image
                    src={photos[currentPhoto]}
                    alt={`${p.title} - foto ${currentPhoto + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority={currentPhoto === 0}
                  />
                </div>

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            i === currentPhoto ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <MapPin className="h-16 w-16 text-gray-300" />
              </div>
            )}

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhoto(i)}
                    className={cn(
                      'relative h-16 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                      i === currentPhoto ? 'border-primary' : 'border-transparent opacity-70'
                    )}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Título e badges */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={p.listing_type as 'sale' | 'rent'}>
                    {listingTypeLabel(p.listing_type)}
                  </Badge>
                  <Badge variant="outline">{propertyTypeLabel(p.property_type)}</Badge>
                </div>
                <h1 className="text-2xl font-bold">{p.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {p.address_full || `${p.address_city} - ${p.address_state}`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleFavorite({ propertyId: p.id, isFavorited })}
                  aria-label="Favoritar"
                >
                  <Heart className={cn('h-4 w-4', isFavorited ? 'fill-red-500 text-red-500' : '')} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} aria-label="Compartilhar">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
            {p.area_m2 && (
              <div className="text-center">
                <Expand className="h-5 w-5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-semibold">{formatArea(p.area_m2)}</p>
                <p className="text-xs text-muted-foreground">Área</p>
              </div>
            )}
            {p.bedrooms > 0 && (
              <div className="text-center">
                <Moon className="h-5 w-5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-semibold">{p.bedrooms}</p>
                <p className="text-xs text-muted-foreground">
                  {p.bedrooms === 1 ? 'Quarto' : 'Quartos'}
                </p>
              </div>
            )}
            {p.bathrooms > 0 && (
              <div className="text-center">
                <Droplets className="h-5 w-5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-semibold">{p.bathrooms}</p>
                <p className="text-xs text-muted-foreground">
                  {p.bathrooms === 1 ? 'Banheiro' : 'Banheiros'}
                </p>
              </div>
            )}
            {p.parking_spots > 0 && (
              <div className="text-center">
                <ParkingCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-semibold">{p.parking_spots}</p>
                <p className="text-xs text-muted-foreground">
                  {p.parking_spots === 1 ? 'Vaga' : 'Vagas'}
                </p>
              </div>
            )}
          </div>

          {/* Descrição */}
          {p.description && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Descrição</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {p.description}
              </p>
            </div>
          )}

          {/* Features */}
          {activeFeatures.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Características</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeFeatures.map((f) => (
                  <div key={f.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                    <span>{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mini mapa */}
          {lat && lng && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Localização</h2>
              <div className="h-52 rounded-2xl overflow-hidden border shadow-sm">
                <PropertyPinMap lat={lat} lng={lng} />
              </div>
              {p.address_full && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.address_full}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Preço */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(p.price_cents)}
              </p>
              {p.listing_type === 'rent' && (
                <p className="text-sm text-muted-foreground">por mês</p>
              )}
              {p.condo_fee_cents > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  + {formatCurrency(p.condo_fee_cents)} condomínio
                </p>
              )}
              {p.iptu_cents > 0 && (
                <p className="text-sm text-muted-foreground">
                  + {formatCurrency(p.iptu_cents)} IPTU/mês
                </p>
              )}
            </div>

            {/* Detalhes extras */}
            <div className="space-y-2 text-sm border-t pt-4">
              {p.floor && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{p.floor}º andar{p.total_floors ? ` de ${p.total_floors}` : ''}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Anunciado em {new Date(p.published_at || p.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span className="font-mono text-xs">{p.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Anunciante */}
          {p.profiles && (
            <div className="bg-white border rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold mb-3">Anunciante</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={p.profiles.avatar_url ?? undefined} />
                  <AvatarFallback>{getInitials(p.profiles.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{p.profiles.full_name || 'Anunciante'}</p>
                  <p className="text-xs text-muted-foreground">Proprietário</p>
                </div>
              </div>

              {p.profiles.phone && (
                <a
                  href={`tel:+55${p.profiles.phone}`}
                  className="flex w-full items-center justify-center gap-2 border hover:bg-accent rounded-xl py-2.5 font-medium text-sm transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Botão WhatsApp flutuante no mobile */}
      <div className="lg:hidden fixed bottom-20 inset-x-0 px-4 z-40 pointer-events-none">
        {p.profiles?.whatsapp ? (
          <a
            href={buildWhatsAppLink(p.profiles.whatsapp, p.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-semibold rounded-2xl py-4 shadow-xl transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </a>
        ) : (
          <div className="pointer-events-auto flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-400 font-medium rounded-2xl py-4 shadow text-sm">
            <MessageCircle className="h-5 w-5" />
            Anunciante não informou WhatsApp
          </div>
        )}
      </div>
    </div>
  )
}
