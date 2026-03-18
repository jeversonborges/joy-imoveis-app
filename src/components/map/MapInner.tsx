'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapProperties } from '@/hooks/useMapProperties'
import type { MapBounds, MapProperty, PropertyFilters } from '@/types'
import { formatCurrencyShort } from '@/lib/utils'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, CITY_MAP_ZOOM } from '@/lib/constants'
import { PropertyMapCard } from './PropertyMapCard'
import { useGeolocation } from '@/contexts/GeolocationContext'

// Fix ícones padrão do Leaflet com Webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface MapInnerProps {
  filters: PropertyFilters
  onPropertyClick?: (id: string) => void
}

// Componente interno que detecta mudanças de viewport
function MapEvents({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: MapBounds) => void
}) {
  const map = useMapEvents({
    moveend: () => updateBounds(map),
    zoomend: () => updateBounds(map),
    load: () => updateBounds(map),
  })

  function updateBounds(m: L.Map) {
    const b = m.getBounds()
    onBoundsChange({
      lat_min: b.getSouth(),
      lon_min: b.getWest(),
      lat_max: b.getNorth(),
      lon_max: b.getEast(),
    })
  }

  useEffect(() => {
    // Dispara imediatamente ao montar
    const b = map.getBounds()
    onBoundsChange({
      lat_min: b.getSouth(),
      lon_min: b.getWest(),
      lat_max: b.getNorth(),
      lon_max: b.getEast(),
    })
  }, [])

  return null
}

// Gerencia os markers no mapa
function PropertyMarkers({
  properties,
  selectedId,
  onSelect,
}: {
  properties: MapProperty[]
  selectedId: string | null
  onSelect: (p: MapProperty | null) => void
}) {
  const map = useMap()
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    // Remove markers existentes
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    properties.forEach((prop) => {
      const isSelected = prop.id === selectedId
      const priceLabel = formatCurrencyShort(prop.price_cents)
      const type = prop.listing_type
      const color = type === 'sale' ? '#16a34a' : '#2563eb'
      const glowColor = type === 'sale' ? 'rgba(22,163,74,0.4)' : 'rgba(37,99,235,0.4)'

      // Pin formato casinha SVG pequeno, sem foto
      const icon = L.divIcon({
        className: '',
        html: `
          <div class="map-pin-item" style="
            display:flex;
            flex-direction:column;
            align-items:center;
            cursor:pointer;
            transform: ${isSelected ? 'scale(1.18)' : 'scale(1)'};
          ">
            <div style="
              background:${color};
              border: 2px solid ${color};
              border-radius:10px 10px 10px 0;
              padding:5px 7px 4px;
              box-shadow: ${isSelected ? `0 0 0 4px ${glowColor}, 0 6px 20px ${glowColor}` : '0 3px 10px rgba(0,0,0,0.22)'};
              display:flex;
              flex-direction:column;
              align-items:center;
              gap:2px;
            ">
              <svg width="18" height="16" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L2 9h2.5v7h4v-4h3v4h4V9H18L10 2z" fill="white" fill-opacity="0.95"/>
              </svg>
              <span style="
                color:white;
                font-size:9px;
                font-weight:700;
                white-space:nowrap;
                line-height:1;
              ">${priceLabel}</span>
            </div>
            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};margin-top:-1px;"></div>
          </div>
        `,
        iconSize: [56, 52],
        iconAnchor: [28, 52],
      })

      const marker = L.marker([prop.latitude, prop.longitude], { icon })
        .addTo(map)
        .on('click', () => onSelect(prop))

      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [properties, selectedId, map])

  return null
}

function FlyToUser({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  const flew = useRef(false)

  useEffect(() => {
    if (!flew.current) {
      flew.current = true
      map.flyTo([lat, lng], CITY_MAP_ZOOM, { duration: 1.2 })
    }
  }, [lat, lng, map])

  return null
}

function UserLocationMarker({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()

  useEffect(() => {
    const icon = L.divIcon({
      className: '',
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="
            background:#2563eb;
            border-radius:50%;
            width:36px;height:36px;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 8px rgba(37,99,235,0.5);
            border:2.5px solid white;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="7" r="4" fill="white"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #2563eb;margin-top:-1px;"></div>
          <span style="
            margin-top:3px;
            background:rgba(37,99,235,0.9);
            color:white;
            font-size:9px;
            font-weight:600;
            padding:2px 6px;
            border-radius:8px;
            white-space:nowrap;
          ">Você está aqui</span>
        </div>
      `,
      iconSize: [36, 60],
      iconAnchor: [18, 42],
    })

    const marker = L.marker([lat, lng], { icon }).addTo(map)
    return () => { marker.remove() }
  }, [lat, lng, map])

  return null
}

export default function MapInner({ filters, onPropertyClick }: MapInnerProps) {
  const [bounds, setBounds] = useState<MapBounds | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<MapProperty | null>(null)
  const { lat: userLat, lng: userLng } = useGeolocation()

  // Debounce de 400ms para evitar flood de queries ao pan
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleBoundsChange = useCallback((newBounds: MapBounds) => {
    if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current)
    boundsTimerRef.current = setTimeout(() => setBounds(newBounds), 400)
  }, [])

  const { data: properties = [], isFetching } = useMapProperties(bounds, filters)

  // Centraliza na cidade do usuário se disponível
  const mapCenter: [number, number] = userLat && userLng
    ? [userLat, userLng]
    : DEFAULT_MAP_CENTER
  const mapZoom = userLat && userLng ? CITY_MAP_ZOOM : DEFAULT_MAP_ZOOM

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="map-tiles-enhanced"
        />
        <MapEvents onBoundsChange={handleBoundsChange} />
        <PropertyMarkers
          properties={properties}
          selectedId={selectedProperty?.id ?? null}
          onSelect={setSelectedProperty}
        />
        {userLat && userLng && (
          <>
            <FlyToUser lat={userLat} lng={userLng} />
            <UserLocationMarker lat={userLat} lng={userLng} />
          </>
        )}
      </MapContainer>

      {/* Loading indicator */}
      {isFetching && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur rounded-full px-3 py-1 text-xs font-medium shadow flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Carregando...
        </div>
      )}

      {/* Card deslizante do imóvel selecionado */}
      {selectedProperty && (
        <PropertyMapCard
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}
