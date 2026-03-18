'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Home, Settings, MessageCircle, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SBUser } from '@supabase/supabase-js'
import type { Profile } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'

export default function PerfilPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<SBUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      ;(supabase as any).from('profiles').select('*').eq('id', data.user.id).single()
        .then(({ data: p }: any) => {
          setProfile(p)
          setWhatsapp(p?.whatsapp ?? '')
        })
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const saveWhatsapp = async () => {
    if (!user) return
    setSaving(true)
    const digits = whatsapp.replace(/\D/g, '')
    await (supabase as any).from('profiles').update({ whatsapp: digits }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!user) return null

  const name = profile?.full_name ?? user.user_metadata?.full_name ?? 'Usuário'
  const avatar = profile?.avatar_url ?? user.user_metadata?.avatar_url

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <Avatar className="h-20 w-20 mb-3">
          <AvatarImage src={avatar} />
          <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">{name}</h1>
        <p className="text-muted-foreground text-sm">{user.email}</p>
      </div>

      {/* WhatsApp */}
      <div className="bg-white rounded-2xl border shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="h-5 w-5 text-green-500" />
          <span className="font-semibold">WhatsApp para contato</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Seu número aparece nos anúncios para compradores/inquilinos entrarem em contato.
        </p>
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={e => setWhatsapp(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
          />
          <button
            onClick={saveWhatsapp}
            disabled={saving}
            className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saved ? <Check className="h-4 w-4" /> : saving ? '...' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border divide-y overflow-hidden shadow-sm">
        <Link href="/meus-imoveis" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
          <Home className="h-5 w-5 text-primary" />
          <span className="font-medium">Meus anúncios</span>
        </Link>
        <Link href="/imoveis/novo" className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
          <Settings className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Novo anúncio</span>
        </Link>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}
