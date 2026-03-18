'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// SVGs minimalistas customizados — estética moderna, traço fino
function IconCompass({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
}

function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 L20 20" strokeWidth={active ? 2.5 : 2} />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconBookmark({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
    </svg>
  )
}

function IconProfile({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.15 : 0} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/',             label: 'Mapa',     renderIcon: (a: boolean) => <IconCompass active={a} /> },
  { href: '/imoveis',      label: 'Buscar',   renderIcon: (a: boolean) => <IconSearch active={a} /> },
  { href: '/imoveis/novo', label: 'Anunciar', renderIcon: () => <IconPlus />, highlight: true },
  { href: '/favoritos',    label: 'Salvos',   renderIcon: (a: boolean) => <IconBookmark active={a} /> },
  { href: '/perfil',       label: 'Perfil',   renderIcon: (a: boolean) => <IconProfile active={a} /> },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-100 safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, renderIcon, label, highlight }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all',
                highlight
                  ? 'text-white'
                  : active
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-500'
              )}
            >
              {highlight ? (
                <div className="bg-primary rounded-2xl w-12 h-10 flex items-center justify-center shadow-md shadow-primary/30 -mt-4">
                  {renderIcon(false)}
                </div>
              ) : (
                <div className={cn(
                  'w-10 h-7 flex items-center justify-center rounded-xl transition-all',
                  active && 'bg-primary/10'
                )}>
                  {renderIcon(active)}
                </div>
              )}
              <span className={cn(highlight && 'text-primary mt-0.5')}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
