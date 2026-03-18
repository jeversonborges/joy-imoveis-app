'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  const signIn = async (provider: 'google' | 'facebook') => {
    setLoading(provider)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        scopes: provider === 'google' ? 'email profile' : 'email,public_profile',
      },
    })
    if (error) {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(null)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between overflow-hidden bg-white px-5 py-10"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 15% 50%, rgba(219,234,254,0.45) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(224,242,254,0.35) 0%, transparent 50%),
          repeating-linear-gradient(0deg, transparent 0px, transparent 47px, rgba(37,99,235,0.04) 47px, rgba(37,99,235,0.04) 48px),
          repeating-linear-gradient(90deg, transparent 0px, transparent 47px, rgba(37,99,235,0.04) 47px, rgba(37,99,235,0.04) 48px)
        `,
      }}
    >
      {/* Contour rings decorativos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[180, 280, 380, 480].map((size, i) => (
          <div key={i}
            className="absolute rounded-full border border-blue-100/60"
            style={{
              width: size,
              height: size,
              top: '38%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[340px] relative z-10">

        {/* Logo */}
        <div className={cn(
          'flex flex-col items-center mb-12 transition-all duration-600 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        )}>
          {/* Ícone: pin GPS com casinha */}
          <div className="mb-5 relative">
            <svg viewBox="0 0 56 70" fill="none" className="w-[56px] h-[70px] drop-shadow-lg">
              {/* Sombra/halo */}
              <ellipse cx="28" cy="66" rx="10" ry="3.5" fill="rgba(37,99,235,0.12)" />
              {/* Pin body com gradiente */}
              <defs>
                <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <path
                d="M28 2C18.06 2 10 10.06 10 20c0 13.5 18 44 18 44s18-30.5 18-44C46 10.06 37.94 2 28 2z"
                fill="url(#pinGrad)"
              />
              {/* Círculo branco interno */}
              <circle cx="28" cy="20" r="11" fill="white" />
              {/* Casa dentro do pin */}
              <path d="M28 12l-7 6h2v7h10v-7h2l-7-6z" fill="#2563eb" />
              <rect x="25.5" y="20" width="5" height="5" rx="0.75" fill="white" />
            </svg>
          </div>

          <h1 className="text-[44px] font-bold tracking-[-1.5px] text-gray-900 leading-none">Joy</h1>
          <p className="text-[13px] text-gray-400 mt-3 text-center leading-snug font-medium tracking-wide">
            Seu próximo imóvel está aqui
          </p>
        </div>

        {/* Botões */}
        <div className={cn(
          'w-full transition-all duration-600 delay-100 ease-out',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        )}>
          <p className="text-center text-[10px] font-semibold tracking-[0.22em] text-gray-300 uppercase mb-5">
            Entrar com
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => signIn('google')}
              disabled={loading !== null}
              className={cn(
                'w-full flex items-center gap-3.5 px-5 py-[15px] rounded-2xl',
                'bg-white border border-gray-200 shadow-sm text-gray-700 font-medium text-[15px]',
                'hover:border-gray-300 hover:shadow-md active:scale-[0.98]',
                'transition-all duration-150',
                loading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {loading === 'google' ? <Spinner light /> : <GoogleIcon />}
              <span className="flex-1 text-left">Continuar com Google</span>
            </button>

            {/* Facebook */}
            <button
              onClick={() => signIn('facebook')}
              disabled={loading !== null}
              className={cn(
                'w-full flex items-center gap-3.5 px-5 py-[15px] rounded-2xl',
                'text-white font-medium text-[15px]',
                'hover:opacity-90 active:scale-[0.98] shadow-sm',
                'transition-all duration-150',
                loading && 'opacity-50 cursor-not-allowed'
              )}
              style={{ background: 'linear-gradient(135deg,#1877F2,#1255b8)' }}
            >
              {loading === 'facebook' ? <Spinner /> : <FacebookIcon />}
              <span className="flex-1 text-left">Continuar com Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <div className={cn(
        'relative z-10 text-center transition-all duration-600 delay-300',
        mounted ? 'opacity-100' : 'opacity-0'
      )}>
        <p className="text-[11px] text-gray-300">
          Ao continuar você aceita os{' '}
          <a href="#" className="text-gray-400 underline hover:text-gray-600 transition-colors">Termos de Uso</a>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function Spinner({ light }: { light?: boolean }) {
  return (
    <div className={cn(
      'h-5 w-5 shrink-0 animate-spin rounded-full border-2',
      light ? 'border-gray-200 border-t-gray-500' : 'border-white/30 border-t-white'
    )} />
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="white" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}
