import type { NominatimResult } from '@/types'
import { NOMINATIM_BASE_URL } from './constants'

const USER_AGENT =
  process.env.NEXT_PUBLIC_NOMINATIM_USER_AGENT ||
  'imoveisapp/1.0 (contact@imoveisapp.com.br)'

export async function searchAddress(query: string): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return []

  const params = new URLSearchParams({
    q: `${query}, Brasil`,
    format: 'json',
    limit: '5',
    countrycodes: 'br',
    addressdetails: '1',
  })

  const res = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': USER_AGENT,
    },
  })

  if (!res.ok) throw new Error('Erro ao buscar endereço')

  return res.json()
}

// Geocodificação reversa: coordenadas → endereço
export async function reverseGeocode(lat: number, lng: number) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
  })

  const res = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': USER_AGENT,
    },
  })

  if (!res.ok) return null
  const result: NominatimResult = await res.json()
  return extractAddressFromResult(result)
}

export function extractAddressFromResult(result: NominatimResult) {
  const a = result.address
  return {
    address_street: a.road || '',
    address_number: a.house_number || '',
    address_neighborhood: a.neighbourhood || a.suburb || '',
    address_city: a.city || a.town || a.village || '',
    address_state: getStateAbbr(a.state || ''),
    address_zip: a.postcode || '',
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
  }
}

// Converte nome do estado para UF
function getStateAbbr(stateName: string): string {
  const states: Record<string, string> = {
    Acre: 'AC',
    Alagoas: 'AL',
    Amapá: 'AP',
    Amazonas: 'AM',
    Bahia: 'BA',
    Ceará: 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    Goiás: 'GO',
    Maranhão: 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    Pará: 'PA',
    Paraíba: 'PB',
    Paraná: 'PR',
    Pernambuco: 'PE',
    Piauí: 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    Rondônia: 'RO',
    Roraima: 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    Sergipe: 'SE',
    Tocantins: 'TO',
  }
  return states[stateName] || stateName.substring(0, 2).toUpperCase()
}
