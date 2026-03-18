# ImoveisApp — Guia de Configuração

## Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.com) (gratuita)

---

## 1. Configurar Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Anote a **URL** e **anon key** em: *Settings → API*

### 1.2 Executar migration
No painel do Supabase, abra **SQL Editor** e execute o conteúdo de:
```
supabase/migrations/0001_initial_schema.sql
```

### 1.3 Criar bucket de storage
1. Vá em **Storage → New bucket**
2. Nome: `property-photos`
3. **Public: Sim**
4. Configure as policies de acesso:

```sql
-- Qualquer um pode ver as fotos
CREATE POLICY "Public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-photos');

-- Usuários autenticados podem fazer upload na própria pasta
CREATE POLICY "Auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Donos podem deletar suas fotos
CREATE POLICY "Owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 1.4 Configurar OAuth

#### Google
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto → *APIs & Services → Credentials → OAuth 2.0 Client*
3. Authorized redirect URIs: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
4. Copie Client ID e Secret para **Supabase → Auth → Providers → Google**

#### Facebook (inclui Instagram via Meta)
1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um App → *Facebook Login for Business*
3. OAuth Redirect URI: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
4. Copie App ID e Secret para **Supabase → Auth → Providers → Facebook**
5. Para Instagram: no mesmo app, habilite *Instagram Basic Display* e adicione o scope `instagram_basic`

---

## 2. Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=ImoveisApp
NEXT_PUBLIC_NOMINATIM_USER_AGENT=imoveisapp/1.0 (seu@email.com)
```

---

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 4. Deploy (Vercel)

```bash
npm install -g vercel
vercel
```

Nas configurações do projeto na Vercel, adicione as mesmas variáveis de ambiente do `.env.local`.

Não esqueça de atualizar o **Site URL** e **Redirect URLs** no Supabase:
- *Auth → URL Configuration → Site URL*: `https://seu-app.vercel.app`
- *Auth → URL Configuration → Redirect URLs*: `https://seu-app.vercel.app/**`

---

## Estrutura do Projeto

```
src/
├── app/                    # Páginas (Next.js App Router)
│   ├── (auth)/             # Login e callback OAuth
│   ├── imoveis/            # Listagem e criação de imóveis
│   │   ├── [id]/           # Detalhe do imóvel
│   │   └── novo/           # Formulário de criação
│   ├── meus-imoveis/       # Dashboard do anunciante
│   └── page.tsx            # Home com mapa
├── components/
│   ├── forms/              # PropertyForm, PhotoUpload, AddressSearch
│   ├── layout/             # Navbar, Providers
│   ├── map/                # MapView, MapInner (Leaflet), MapPopup
│   ├── property/           # PropertyCard, PropertyDetail, Filters
│   └── ui/                 # Componentes base (Button, Badge, etc.)
├── hooks/                  # React Query hooks para Supabase
├── lib/                    # Supabase clients, utils, validations
├── middleware.ts            # Proteção de rotas autenticadas
└── types/                  # TypeScript types e Database types
supabase/
└── migrations/
    └── 0001_initial_schema.sql   # PostgreSQL + PostGIS schema
```

---

## Funcionalidades MVP

| Feature | Status |
|---------|--------|
| Mapa com todos os imóveis (OpenStreetMap) | ✅ |
| Login OAuth Google | ✅ |
| Login OAuth Facebook | ✅ |
| Login OAuth Instagram (via Meta) | ✅ |
| Criar imóvel para venda/aluguel | ✅ |
| Upload de fotos (compressão automática) | ✅ |
| Geocodificação de endereços (Nominatim) | ✅ |
| Pin arrastável no mapa | ✅ |
| Listagem com filtros (tipo, preço, quartos) | ✅ |
| Página de detalhe com galeria | ✅ |
| Contato direto por WhatsApp | ✅ |
| Favoritos com otimistic update | ✅ |
| Dashboard do anunciante | ✅ |
| Pausar/reativar/remover anúncio | ✅ |
| SEO com Open Graph | ✅ |
| RLS (segurança por usuário) | ✅ |
