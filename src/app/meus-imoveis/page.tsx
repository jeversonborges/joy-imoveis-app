'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { Plus, Eye, Pause, Play, Trash2, MapPin, BedDouble } from 'lucide-react'
import { useMyProperties, useUpdatePropertyStatus, useDeleteProperty } from '@/hooks/useProperties'
import { formatCurrency, listingTypeLabel, propertyTypeLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo',
  paused: 'Pausado',
  sold: 'Vendido',
  rented: 'Alugado',
}

export default function MeusImoveisPage() {
  const { data: properties = [], isLoading } = useMyProperties()
  const { mutate: updateStatus } = useUpdatePropertyStatus()
  const { mutate: deleteProperty } = useDeleteProperty()

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Tem certeza que deseja remover "${title}"?`)) {
      deleteProperty(id)
    }
  }

  return (
    <div className="container py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meus Imóveis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus anúncios
          </p>
        </div>
        <Link href="/imoveis/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo anúncio
          </Button>
        </Link>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border p-4 flex gap-4">
              <Skeleton className="h-24 w-32 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-semibold mb-2">Nenhum anúncio ainda</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Crie seu primeiro anúncio e apareça no mapa para milhares de pessoas.
          </p>
          <Link href="/imoveis/novo">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Criar primeiro anúncio
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4">
              {/* Foto */}
              <div className="relative h-24 w-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {p.cover_photo_url ? (
                  <Image src={p.cover_photo_url} alt={p.title} fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={p.listing_type as 'sale' | 'rent'} className="text-xs">
                        {listingTypeLabel(p.listing_type)}
                      </Badge>
                      <Badge variant={p.status as any} className="text-xs">
                        {STATUS_LABELS[p.status]}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-1 truncate">{p.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {p.address_city} - {p.address_state}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span>{propertyTypeLabel(p.property_type)}</span>
                      {p.bedrooms > 0 && (
                        <span className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5" /> {p.bedrooms}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="font-bold text-primary shrink-0">
                    {formatCurrency(p.price_cents)}
                  </p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col gap-2 shrink-0">
                <Link href={`/imoveis/${p.id}`}>
                  <Button variant="ghost" size="icon" title="Ver anúncio">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>

                {p.status === 'active' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Pausar"
                    onClick={() => updateStatus({ id: p.id, status: 'paused' })}
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                ) : p.status === 'paused' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Reativar"
                    onClick={() => updateStatus({ id: p.id, status: 'active' })}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  size="icon"
                  title="Remover"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(p.id, p.title)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
