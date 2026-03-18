'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Property, PropertyFilters } from '@/types'
import type { PropertyFormData } from '@/lib/validations/property'
import { buildAddressFull } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

// ─── Listagem ─────────────────────────────────────────────
export function useProperties(filters: PropertyFilters = {}) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async (): Promise<Property[]> => {
      let query = (supabase as any)
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .order('published_at', { ascending: false })

      if (filters.listing_type) query = query.eq('listing_type', filters.listing_type)
      if (filters.property_type) query = query.eq('property_type', filters.property_type)
      if (filters.city) query = query.ilike('address_city', `%${filters.city}%`)
      if (filters.min_price) query = query.gte('price_cents', filters.min_price * 100)
      if (filters.max_price) query = query.lte('price_cents', filters.max_price * 100)
      if (filters.min_bedrooms) query = query.gte('bedrooms', filters.min_bedrooms)
      if (filters.search) {
        query = query.textSearch(
          'title',
          filters.search.split(' ').join(' & '),
          { config: 'portuguese' }
        )
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return (data ?? []) as unknown as Property[]
    },
    staleTime: 60_000,
  })
}

// ─── Imóvel individual ────────────────────────────────────
export function useProperty(id: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['property', id],
    queryFn: async (): Promise<Property | null> => {
      if (!id) return null
      const { data, error } = await (supabase as any)
        .from('properties')
        .select('*, profiles!owner_id(id, full_name, avatar_url, phone, whatsapp)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as unknown as Property
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
  })
}

// ─── Meus imóveis ─────────────────────────────────────────
export function useMyProperties() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['my-properties'],
    queryFn: async (): Promise<Property[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data ?? []) as unknown as Property[]
    },
  })
}

// ─── Criar imóvel ─────────────────────────────────────────
export function useCreateProperty() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      formData: PropertyFormData & { latitude: number; longitude: number }
    ) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const addressFull = buildAddressFull(formData)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('properties').insert({
        owner_id: user.id,
        title: formData.title,
        description: formData.description || null,
        listing_type: formData.listing_type,
        property_type: formData.property_type,
        price_cents: Math.round(formData.price * 100),
        condo_fee_cents: formData.condo_fee ? Math.round(formData.condo_fee * 100) : 0,
        iptu_cents: formData.iptu ? Math.round(formData.iptu * 100) : 0,
        address_street: formData.address_street,
        address_number: formData.address_number || null,
        address_complement: formData.address_complement || null,
        address_neighborhood: formData.address_neighborhood || null,
        address_city: formData.address_city,
        address_state: formData.address_state,
        address_zip: formData.address_zip || null,
        address_full: addressFull,
        // PostGIS aceita WKT: 'POINT(lon lat)'
        location: `POINT(${formData.longitude} ${formData.latitude})`,
        area_m2: formData.area_m2 ?? null,
        bedrooms: formData.bedrooms ?? 0,
        bathrooms: formData.bathrooms ?? 0,
        parking_spots: formData.parking_spots ?? 0,
        floor: formData.floor ?? null,
        features: formData.features ?? {},
        photo_urls: formData.photo_urls ?? [],
        cover_photo_url: formData.cover_photo_url || formData.photo_urls?.[0] || null,
      }).select().single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['my-properties'] })
      queryClient.invalidateQueries({ queryKey: ['map-properties'] })
      toast({ title: 'Imóvel publicado!', description: 'Seu anúncio já está no ar.' })
    },
    onError: (error) => {
      toast({
        title: 'Erro ao publicar',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// ─── Atualizar status ─────────────────────────────────────
export function useUpdatePropertyStatus() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: 'active' | 'paused' | 'sold' | 'rented'
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('properties')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      toast({ title: 'Status atualizado!' })
    },
  })
}

// ─── Deletar imóvel ───────────────────────────────────────
export function useDeleteProperty() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
      queryClient.invalidateQueries({ queryKey: ['map-properties'] })
      toast({ title: 'Imóvel removido!' })
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' })
    },
  })
}
