import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ListingType, PropertyType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata valor em centavos para BRL
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

// Formata valor abreviado para pins do mapa (ex: R$ 450k, R$ 1,2M)
export function formatCurrencyShort(cents: number): string {
  const value = cents / 100
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000)}k`
  }
  return formatCurrency(cents)
}

export function listingTypeLabel(type: ListingType): string {
  return type === 'sale' ? 'Venda' : 'Aluguel'
}

export function propertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    apartment: 'Apartamento',
    house: 'Casa',
    commercial: 'Comercial',
    land: 'Terreno',
    studio: 'Kitnet/Studio',
    penthouse: 'Cobertura',
  }
  return labels[type]
}

export function formatArea(m2: number | null): string {
  if (!m2) return '—'
  return `${m2.toLocaleString('pt-BR')} m²`
}

export function buildWhatsAppLink(phone: string, propertyTitle: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const message = encodeURIComponent(
    `Olá! Tenho interesse no imóvel: "${propertyTitle}". Pode me dar mais informações?`
  )
  return `https://wa.me/55${cleaned}?text=${message}`
}

export function buildAddressFull(fields: {
  address_street: string
  address_number?: string | null
  address_complement?: string | null
  address_neighborhood?: string | null
  address_city: string
  address_state: string
}): string {
  const parts = [
    fields.address_street,
    fields.address_number,
    fields.address_complement,
    fields.address_neighborhood,
    `${fields.address_city} - ${fields.address_state}`,
  ].filter(Boolean)
  return parts.join(', ')
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
