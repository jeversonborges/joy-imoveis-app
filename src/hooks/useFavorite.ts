'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useFavorites() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<string[]> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id)

      return (data ?? []).map((f: any) => f.property_id as string)
    },
  })
}

export function useToggleFavorite() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      propertyId,
      isFavorited,
    }: {
      propertyId: string
      isFavorited: boolean
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Faça login para favoritar')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      if (isFavorited) {
        await db.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId)
      } else {
        await db.from('favorites').insert({ user_id: user.id, property_id: propertyId })
      }
    },
    onMutate: async ({ propertyId, isFavorited }) => {
      // Atualização otimista
      await queryClient.cancelQueries({ queryKey: ['favorites'] })
      const prev = queryClient.getQueryData<string[]>(['favorites'])
      queryClient.setQueryData<string[]>(['favorites'], (old = []) =>
        isFavorited ? old.filter((id) => id !== propertyId) : [...old, propertyId]
      )
      return { prev }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['favorites'], context?.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
