// Tipos gerados do Supabase — simplificados para o MVP
// Para gerar automaticamente: npx supabase gen types typescript --linked

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          whatsapp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string | null
          listing_type: 'sale' | 'rent'
          property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'studio' | 'penthouse'
          status: 'active' | 'paused' | 'sold' | 'rented'
          price_cents: number
          condo_fee_cents: number
          iptu_cents: number
          address_street: string
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string
          address_state: string
          address_zip: string | null
          address_full: string | null
          area_m2: number | null
          bedrooms: number
          bathrooms: number
          parking_spots: number
          floor: number | null
          total_floors: number | null
          features: Record<string, boolean>
          photo_urls: string[]
          cover_photo_url: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description?: string | null
          listing_type: 'sale' | 'rent'
          property_type: 'apartment' | 'house' | 'commercial' | 'land' | 'studio' | 'penthouse'
          status?: 'active' | 'paused' | 'sold' | 'rented'
          price_cents: number
          condo_fee_cents?: number
          iptu_cents?: number
          address_street: string
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city: string
          address_state: string
          address_zip?: string | null
          address_full?: string | null
          area_m2?: number | null
          bedrooms?: number
          bathrooms?: number
          parking_spots?: number
          floor?: number | null
          total_floors?: number | null
          features?: Record<string, boolean>
          photo_urls?: string[]
          cover_photo_url?: string | null
          published_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      favorites: {
        Row: {
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: never
      }
    }
    Functions: {
      get_map_properties: {
        Args: {
          lat_min: number
          lon_min: number
          lat_max: number
          lon_max: number
          p_listing_type?: string | null
          p_property_type?: string | null
          p_min_price?: number | null
          p_max_price?: number | null
          p_min_bedrooms?: number | null
        }
        Returns: {
          id: string
          title: string
          listing_type: 'sale' | 'rent'
          property_type: string
          price_cents: number
          latitude: number
          longitude: number
          cover_photo_url: string | null
          bedrooms: number
        }[]
      }
    }
  }
}
