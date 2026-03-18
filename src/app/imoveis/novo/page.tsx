export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { PropertyForm } from '@/components/forms/PropertyForm'

export const metadata: Metadata = {
  title: 'Anunciar Imóvel',
  description: 'Crie seu anúncio de imóvel para venda ou aluguel.',
}

export default function NovoImovelPage() {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl font-bold">Anunciar Imóvel</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os dados abaixo para publicar seu imóvel no mapa.
        </p>
      </div>
      <PropertyForm />
    </div>
  )
}
