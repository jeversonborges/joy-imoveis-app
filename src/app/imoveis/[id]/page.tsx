export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { APP_NAME } from '@/lib/constants'
import PropertyDetailPage from '@/components/property/PropertyDetailPage'
import { Loader2 } from 'lucide-react'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Imóvel',
    openGraph: { type: 'article', siteName: APP_NAME },
  }
}

export default function PropertyPage({ params }: Props) {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PropertyDetailPage id={params.id} />
    </Suspense>
  )
}
