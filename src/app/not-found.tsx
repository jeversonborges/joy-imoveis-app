import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mx-auto mb-6">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          A página que você está procurando não existe ou o link é inválido.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/imoveis">
            <Button variant="outline">Ver imóveis</Button>
          </Link>
          <Link href="/">
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
