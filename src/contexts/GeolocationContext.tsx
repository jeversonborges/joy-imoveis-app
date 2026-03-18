'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

interface GeolocationState {
  lat: number | null
  lng: number | null
  loading: boolean
  denied: boolean
}

const GeolocationContext = createContext<GeolocationState>({
  lat: null,
  lng: null,
  loading: true,
  denied: false,
})

export function GeolocationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: true,
    denied: false,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, loading: false }))
      return
    }

    // Pede permissão imediatamente ao abrir o app
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          denied: false,
        })
      },
      () => {
        setState({ lat: null, lng: null, loading: false, denied: true })
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }, [])

  return (
    <GeolocationContext.Provider value={state}>
      {children}
    </GeolocationContext.Provider>
  )
}

export function useGeolocation() {
  return useContext(GeolocationContext)
}
