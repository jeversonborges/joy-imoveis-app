'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGeolocation } from '@/contexts/GeolocationContext'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
  lat?: number
  lng?: number
  onChange: (lat: number, lng: number) => void
}

function RecenterMap({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap()
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], 16)
  }, [lat, lng, map])
  return null
}

function MapClickHandler({ onPlace }: { onPlace: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPlace(e.latlng.lat, e.latlng.lng),
  })
  return null
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const markerRef = useRef<L.Marker>(null)
  const { lat: userLat, lng: userLng, loading } = useGeolocation()

  // Centro: pin colocado > localização do usuário (já obtida no app load) > Brasil
  const center: [number, number] =
    lat && lng ? [lat, lng] :
    userLat && userLng ? [userLat, userLng] :
    [-14.235, -51.925]

  const zoom = (lat && lng) ? 16 : (userLat && userLng) ? 14 : 5

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 text-sm text-muted-foreground gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Obtendo sua localização...
      </div>
    )
  }

  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap lat={lat} lng={lng} />
      <MapClickHandler onPlace={onChange} />
      {lat && lng && (
        <Marker
          position={[lat, lng]}
          draggable
          ref={markerRef}
          eventHandlers={{
            dragend: () => {
              const pos = markerRef.current?.getLatLng()
              if (pos) onChange(pos.lat, pos.lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}
