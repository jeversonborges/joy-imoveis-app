import { z } from 'zod'

export const propertySchema = z.object({
  title: z
    .string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(150, 'Título muito longo'),
  description: z
    .string()
    .max(3000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  listing_type: z.enum(['sale', 'rent'], {
    required_error: 'Selecione o tipo de anúncio',
  }),
  property_type: z.enum(
    ['apartment', 'house', 'commercial', 'land', 'studio', 'penthouse'],
    { required_error: 'Selecione o tipo de imóvel' }
  ),

  // Preço em centavos (convertido no submit)
  price: z
    .number({ required_error: 'Informe o valor' })
    .positive('Valor deve ser positivo')
    .min(1, 'Informe o valor'),
  condo_fee: z.number().min(0).optional(),
  iptu: z.number().min(0).optional(),

  // Localização
  address_street: z.string().optional().or(z.literal('')),
  address_number: z.string().optional().or(z.literal('')),
  address_complement: z.string().optional().or(z.literal('')),
  address_neighborhood: z.string().optional().or(z.literal('')),
  address_city: z.string().min(2, 'Informe a cidade'),
  address_state: z
    .string()
    .length(2, 'UF deve ter 2 caracteres')
    .toUpperCase(),
  address_zip: z.string().optional().or(z.literal('')),
  latitude: z
    .number({ required_error: 'Marque a localização no mapa' })
    .min(-90)
    .max(90),
  longitude: z
    .number({ required_error: 'Marque a localização no mapa' })
    .min(-180)
    .max(180),

  // Características
  area_m2: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  parking_spots: z.number().int().min(0).max(10).optional(),
  floor: z.number().int().optional(),
  total_floors: z.number().int().positive().optional(),

  // Features
  features: z
    .object({
      pool: z.boolean().optional(),
      gym: z.boolean().optional(),
      elevator: z.boolean().optional(),
      furnished: z.boolean().optional(),
      pet_friendly: z.boolean().optional(),
      balcony: z.boolean().optional(),
      security: z.boolean().optional(),
      playground: z.boolean().optional(),
      party_room: z.boolean().optional(),
      barbecue: z.boolean().optional(),
    })
    .optional(),

  // Fotos
  photo_urls: z.array(z.string().url()).max(10).optional(),
  cover_photo_url: z.string().url().optional().or(z.literal('')),
})

export type PropertyFormData = z.infer<typeof propertySchema>

export const profileSchema = z.object({
  full_name: z.string().min(2, 'Nome muito curto').max(100),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone inválido (somente números, 10-11 dígitos)')
    .optional()
    .or(z.literal('')),
  whatsapp: z
    .string()
    .regex(/^\d{10,11}$/, 'WhatsApp inválido (somente números, 10-11 dígitos)')
    .optional()
    .or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>
