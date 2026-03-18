-- ============================================================
-- ImoveisApp - Schema Inicial
-- ============================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PERFIS (extends auth.users do Supabase)
-- ============================================================
CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    avatar_url  TEXT,
    phone       TEXT,
    whatsapp    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis são visíveis para todos"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-cria perfil ao se registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE property_type AS ENUM (
    'apartment',   -- Apartamento
    'house',       -- Casa
    'commercial',  -- Comercial
    'land',        -- Terreno
    'studio',      -- Kitnet/Studio
    'penthouse'    -- Cobertura
);

CREATE TYPE listing_type AS ENUM ('sale', 'rent');

CREATE TYPE property_status AS ENUM ('active', 'paused', 'sold', 'rented');

-- ============================================================
-- IMÓVEIS
-- ============================================================
CREATE TABLE public.properties (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Dados do anúncio
    title           TEXT NOT NULL CHECK (char_length(title) >= 5 AND char_length(title) <= 150),
    description     TEXT CHECK (char_length(description) <= 3000),
    listing_type    listing_type NOT NULL,
    property_type   property_type NOT NULL,
    status          property_status DEFAULT 'active' NOT NULL,

    -- Preços (em centavos para evitar problemas com float)
    price_cents     BIGINT NOT NULL CHECK (price_cents > 0),
    condo_fee_cents BIGINT DEFAULT 0 CHECK (condo_fee_cents >= 0),
    iptu_cents      BIGINT DEFAULT 0 CHECK (iptu_cents >= 0),

    -- Localização
    address_street      TEXT NOT NULL,
    address_number      TEXT,
    address_complement  TEXT,
    address_neighborhood TEXT,
    address_city        TEXT NOT NULL,
    address_state       CHAR(2) NOT NULL,
    address_zip         TEXT,
    address_full        TEXT,
    location            GEOGRAPHY(POINT, 4326) NOT NULL,

    -- Características
    area_m2         NUMERIC(10, 2) CHECK (area_m2 > 0),
    bedrooms        SMALLINT DEFAULT 0 CHECK (bedrooms >= 0),
    bathrooms       SMALLINT DEFAULT 0 CHECK (bathrooms >= 0),
    parking_spots   SMALLINT DEFAULT 0 CHECK (parking_spots >= 0),
    floor           SMALLINT,
    total_floors    SMALLINT,

    -- Features como flags JSONB flexível
    features        JSONB DEFAULT '{}',

    -- Fotos (array de URLs públicas do Supabase Storage)
    photo_urls      TEXT[] DEFAULT '{}',
    cover_photo_url TEXT,

    -- Timestamps
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice espacial para queries de mapa
CREATE INDEX idx_properties_location
    ON public.properties USING GIST (location);

-- Índices padrão
CREATE INDEX idx_properties_owner_id     ON public.properties (owner_id);
CREATE INDEX idx_properties_listing_type ON public.properties (listing_type);
CREATE INDEX idx_properties_city         ON public.properties (address_city);
CREATE INDEX idx_properties_status       ON public.properties (status);
CREATE INDEX idx_properties_price        ON public.properties (price_cents);
CREATE INDEX idx_properties_created_at   ON public.properties (created_at DESC);

-- Índice de busca full-text em português
CREATE INDEX idx_properties_fts ON public.properties
    USING GIN (to_tsvector('portuguese',
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(address_neighborhood, '') || ' ' ||
        COALESCE(address_city, '')
    ));

-- RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imóveis ativos são visíveis para todos"
    ON public.properties FOR SELECT
    USING (status = 'active' OR auth.uid() = owner_id);

CREATE POLICY "Usuários autenticados podem criar imóveis"
    ON public.properties FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Donos podem atualizar seus imóveis"
    ON public.properties FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Donos podem deletar seus imóveis"
    ON public.properties FOR DELETE
    USING (auth.uid() = owner_id);

-- Trigger de updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNÇÃO DE MAPA (retorna pins leves por viewport)
-- ============================================================
CREATE OR REPLACE FUNCTION get_map_properties(
    lat_min FLOAT,
    lon_min FLOAT,
    lat_max FLOAT,
    lon_max FLOAT,
    p_listing_type TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_min_price BIGINT DEFAULT NULL,
    p_max_price BIGINT DEFAULT NULL,
    p_min_bedrooms INT DEFAULT NULL
)
RETURNS TABLE (
    id              UUID,
    title           TEXT,
    listing_type    listing_type,
    property_type   property_type,
    price_cents     BIGINT,
    latitude        FLOAT,
    longitude       FLOAT,
    cover_photo_url TEXT,
    bedrooms        SMALLINT
)
LANGUAGE sql STABLE AS $$
    SELECT
        p.id,
        p.title,
        p.listing_type,
        p.property_type,
        p.price_cents,
        ST_Y(p.location::geometry) AS latitude,
        ST_X(p.location::geometry) AS longitude,
        p.cover_photo_url,
        p.bedrooms
    FROM public.properties p
    WHERE
        p.status = 'active'
        AND p.location && ST_MakeEnvelope(lon_min, lat_min, lon_max, lat_max, 4326)
        AND (p_listing_type IS NULL OR p.listing_type = p_listing_type::listing_type)
        AND (p_property_type IS NULL OR p.property_type = p_property_type::property_type)
        AND (p_min_price IS NULL OR p.price_cents >= p_min_price)
        AND (p_max_price IS NULL OR p.price_cents <= p_max_price)
        AND (p_min_bedrooms IS NULL OR p.bedrooms >= p_min_bedrooms)
    ORDER BY p.published_at DESC
    LIMIT 500;
$$;

-- ============================================================
-- FAVORITOS
-- ============================================================
CREATE TABLE public.favorites (
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, property_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários gerenciam seus próprios favoritos"
    ON public.favorites FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STORAGE (execute via Supabase Dashboard ou CLI)
-- ============================================================
-- No Supabase Dashboard > Storage > New Bucket:
--   Nome: property-photos
--   Public: true
--
-- Policies de Storage (Supabase Dashboard > Storage > Policies):
--   SELECT: allow public access (bucket_id = 'property-photos')
--   INSERT: auth.uid()::text = (storage.foldername(name))[1]
--   DELETE: auth.uid()::text = (storage.foldername(name))[1]
