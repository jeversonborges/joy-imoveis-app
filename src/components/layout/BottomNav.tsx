'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Search, PlusCircle, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',              icon: Map,        label: 'Mapa'      },
  { href: '/imoveis',       icon: Search,     label: 'Buscar'    },
  { href: '/imoveis/novo',  icon: PlusCircle, label: 'Anunciar', highlight: true },
  { href: '/favoritos',     icon: Heart,      label: 'Salvos'    },
  { href: '/perfil',        icon: User,       label: 'Perfil'    },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ href, icon: Icon, label, highlight }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                highlight
                  ? 'text-primary'
                  : active
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon
                className={cn(
                  'transition-all',
                  highlight ? 'h-7 w-7 text-primary' : 'h-5 w-5',
                  active && !highlight && 'scale-110'
                )}
                strokeWidth={active || highlight ? 2.5 : 1.8}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
