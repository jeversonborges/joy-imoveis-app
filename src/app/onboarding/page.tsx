'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const supabase = createClient()
  const router = useRouter()
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Digite um número válido com DDD')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await (supabase as any).from('profiles').update({ whatsapp: digits }).eq('id', user.id)
    router.push('/')
  }

  const skip = () => router.push('/')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 rounded-2xl p-4 shadow-lg">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Seu WhatsApp
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
          Quem ver seus anúncios vai entrar em contato diretamente pelo WhatsApp.
          Adicione agora para não perder nenhuma oportunidade.
        </p>

        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Número com DDD
          </label>
          <input
            type="tel"
            placeholder="(11) 99999-9999"
            value={whatsapp}
            onChange={e => { setWhatsapp(e.target.value); setError('') }}
            className="w-full border rounded-xl px-4 py-3 text-base outline-none focus:ring-2 focus:ring-green-400 mb-1"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white font-semibold rounded-2xl py-4 shadow-lg transition-all disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Continuar'}
          {!saving && <ArrowRight className="h-5 w-5" />}
        </button>

        <button
          onClick={skip}
          className="mt-3 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          Pular por agora
        </button>
      </div>
    </div>
  )
}
