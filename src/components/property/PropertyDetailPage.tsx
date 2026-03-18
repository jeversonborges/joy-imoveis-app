'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'
import { PropertyDetail } from './PropertyDetail'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function PropertyDetailPage({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    ;(supabase as any)
      .from('properties')
      .select('*, profiles!owner_id(id, full_name, avatar_url, phone, whatsapp)')
      .eq('id', id)
      .single()
      .then(({ data, error }: any) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setProperty(data as Property)
        }
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined

  if (notFound || !property) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Imóvel não encontrado</h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Este imóvel pode ter sido removido ou o link é inválido.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/imoveis">
              <Button variant="outline">Ver imóveis</Button>
            </Link>
            <Link href="/">
              <Button>Voltar ao mapa</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <PropertyDetail property={property} lat={lat} lng={lng} />
}
