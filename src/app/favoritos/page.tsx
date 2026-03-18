'use client'

export const dynamic = 'force-dynamic'

import { Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PropertyGrid } from '@/components/property/PropertyGrid'
import type { Property } from '@/types'

export default function FavoritosPage() {
  const supabase = createClient()

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['favorite-properties'],
    queryFn: async (): Promise<Property[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: favs } = await (supabase as any)
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)

      if (!favs?.length) return []

      const ids = favs.map((f: any) => f.property_id)
      const { data } = await (supabase as any)
        .from('properties')
        .select('*, profiles!owner_id(id, full_name, avatar_url, phone, whatsapp)')
        .in('id', ids)

      return (data ?? []) as Property[]
    },
  })

  return (
    <div className="container py-6 px-4">
      <div className="flex items-center gap-2 mb-5">
        <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        <h1 className="text-xl font-bold">Imóveis salvos</h1>
      </div>
      <PropertyGrid properties={properties} isLoading={isLoading} />
    </div>
  )
}
