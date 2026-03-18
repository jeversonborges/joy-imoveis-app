'use client'

import { useState, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { NumericFormat } from 'react-number-format'
import { MapPin, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { propertySchema, type PropertyFormData } from '@/lib/validations/property'
import { useCreateProperty } from '@/hooks/useProperties'
import { useUploadPhotos } from '@/hooks/useUploadPhotos'
import { toast } from '@/hooks/useToast'
import { LISTING_TYPES, PROPERTY_TYPES, PROPERTY_FEATURES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AddressSearch } from './AddressSearch'
import { reverseGeocode } from '@/lib/geocoding'
import { PhotoUpload } from './PhotoUpload'
import { cn } from '@/lib/utils'

// Mini mapa de preview da localização
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false })

const STEPS = [
  { title: 'Tipo de Anúncio', description: 'O que você quer fazer?' },
  { title: 'Localização', description: 'Onde fica o imóvel?' },
  { title: 'Características', description: 'Detalhes do imóvel' },
  { title: 'Preço', description: 'Qual o valor?' },
  { title: 'Fotos', description: 'Adicione imagens' },
]

export function PropertyForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const { mutateAsync: createProperty } = useCreateProperty()
  const { uploadPhotos, isUploading, progress } = useUploadPhotos()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      listing_type: 'sale',
      property_type: 'apartment',
      bedrooms: 0,
      bathrooms: 0,
      parking_spots: 0,
      features: {},
      photo_urls: [],
    },
  })

  const latitude = watch('latitude' as any)
  const longitude = watch('longitude' as any)
  const photoUrls = watch('photo_urls') || []
  const listingType = watch('listing_type')

  const goNext = async () => {
    const fieldsMap: Record<number, (keyof PropertyFormData)[]> = {
      0: ['title', 'listing_type', 'property_type'],
      1: ['address_city', 'address_state', 'latitude' as any, 'longitude' as any],
      2: [],
      3: ['price'],
      4: [],
    }
    const valid = await trigger(fieldsMap[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: PropertyFormData) => {
    if (!data.latitude || !data.longitude) {
      alert('Marque a localização do imóvel no mapa.')
      setStep(1)
      return
    }

    try {
      const tempId = crypto.randomUUID()
      let finalPhotoUrls = photoUrls

      if (pendingFiles.length > 0) {
        const uploaded = await uploadPhotos(pendingFiles, tempId)
        finalPhotoUrls = [...(photoUrls || []), ...uploaded]
        setValue('photo_urls', finalPhotoUrls)
      }

      const property = await createProperty({
        ...data,
        address_street: data.address_street || '',
        photo_urls: finalPhotoUrls,
        cover_photo_url: finalPhotoUrls[0] || '',
        latitude: data.latitude as any,
        longitude: data.longitude as any,
      })

      router.push(`/imoveis/${(property as any).id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao publicar anúncio'
      toast({ title: 'Erro ao publicar', description: msg, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
                i < step ? 'bg-primary text-white' :
                i === step ? 'bg-primary text-white ring-4 ring-primary/20' :
                'bg-gray-100 text-gray-400'
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-px w-8 transition-colors', i < step ? 'bg-primary' : 'bg-gray-200')} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-xl font-bold mb-1">{STEPS[step].title}</h2>
        <p className="text-muted-foreground text-sm mb-6">{STEPS[step].description}</p>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 0: Tipo */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label>Título do anúncio *</Label>
                <Input
                  {...register('title')}
                  placeholder="Ex: Apartamento 3 quartos próximo ao metrô"
                  className="mt-1"
                />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label>Tipo do anúncio *</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {LISTING_TYPES.map((lt) => (
                    <label key={lt.value} className={cn(
                      'flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all',
                      watch('listing_type') === lt.value
                        ? 'border-primary bg-primary/5 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <input type="radio" {...register('listing_type')} value={lt.value} className="sr-only" />
                      {lt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tipo do imóvel *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                  {PROPERTY_TYPES.map((pt) => (
                    <label key={pt.value} className={cn(
                      'flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer text-sm transition-all text-center',
                      watch('property_type') === pt.value
                        ? 'border-primary bg-primary/5 font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <input type="radio" {...register('property_type')} value={pt.value} className="sr-only" />
                      {pt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Descreva o imóvel, diferenciais, proximidades..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 1: Localização */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Instrução */}
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-blue-700 text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  <strong>Clique no mapa</strong> para marcar o imóvel — ou use a busca para ir a um endereço.
                </span>
              </div>

              {/* Busca como atalho */}
              <AddressSearch
                onSelect={(result) => {
                  setValue('address_street', result.address_street)
                  setValue('address_number', result.address_number)
                  setValue('address_neighborhood', result.address_neighborhood)
                  setValue('address_city', result.address_city)
                  setValue('address_state', result.address_state)
                  setValue('address_zip', result.address_zip)
                  setValue('latitude' as any, result.latitude)
                  setValue('longitude' as any, result.longitude)
                }}
              />

              {/* Mapa sempre visível — clique coloca o pin */}
              <div className="h-72 rounded-xl overflow-hidden border shadow-sm">
                <LocationPicker
                  lat={latitude}
                  lng={longitude}
                  onChange={async (lat, lng) => {
                    setValue('latitude' as any, lat)
                    setValue('longitude' as any, lng)
                    // Geocodificação reversa: preenche campos automaticamente
                    const addr = await reverseGeocode(lat, lng)
                    if (addr) {
                      if (addr.address_street) setValue('address_street', addr.address_street)
                      if (addr.address_number) setValue('address_number', addr.address_number)
                      if (addr.address_neighborhood) setValue('address_neighborhood', addr.address_neighborhood)
                      if (addr.address_city) setValue('address_city', addr.address_city)
                      if (addr.address_state) setValue('address_state', addr.address_state)
                      if (addr.address_zip) setValue('address_zip', addr.address_zip)
                    }
                  }}
                />
              </div>

              {latitude && longitude ? (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Pin posicionado — arraste para ajustar com precisão
                </p>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  Toque no mapa para marcar a localização do imóvel
                </p>
              )}

              {/* Campos editáveis */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <Label>Logradouro *</Label>
                  <Input {...register('address_street')} className="mt-1" />
                  {errors.address_street && <p className="text-destructive text-xs mt-1">{errors.address_street.message}</p>}
                </div>
                <div>
                  <Label>Número</Label>
                  <Input {...register('address_number')} className="mt-1" />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input {...register('address_complement')} className="mt-1" />
                </div>
                <div>
                  <Label>Bairro</Label>
                  <Input {...register('address_neighborhood')} className="mt-1" />
                </div>
                <div>
                  <Label>Cidade *</Label>
                  <Input {...register('address_city')} className="mt-1" />
                  {errors.address_city && <p className="text-destructive text-xs mt-1">{errors.address_city.message}</p>}
                </div>
                <div>
                  <Label>UF *</Label>
                  <Input {...register('address_state')} maxLength={2} className="mt-1 uppercase" />
                  {errors.address_state && <p className="text-destructive text-xs mt-1">{errors.address_state.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Características */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Área (m²)</Label>
                  <Controller
                    control={control}
                    name="area_m2"
                    render={({ field }) => (
                      <NumericFormat
                        customInput={Input}
                        className="mt-1"
                        placeholder="Ex: 90"
                        decimalSeparator=","
                        thousandSeparator="."
                        decimalScale={2}
                        inputMode="decimal"
                        value={field.value ?? ''}
                        onValueChange={(v) => field.onChange(v.floatValue)}
                      />
                    )}
                  />
                </div>
                <div>
                  <Label>Andar</Label>
                  <Input type="number" inputMode="numeric" {...register('floor', { valueAsNumber: true })} className="mt-1" min={0} />
                </div>
                <div>
                  <Label>Quartos</Label>
                  <Input type="number" inputMode="numeric" {...register('bedrooms', { valueAsNumber: true })} className="mt-1" min={0} max={20} />
                </div>
                <div>
                  <Label>Banheiros</Label>
                  <Input type="number" inputMode="numeric" {...register('bathrooms', { valueAsNumber: true })} className="mt-1" min={0} max={20} />
                </div>
                <div>
                  <Label>Vagas de garagem</Label>
                  <Input type="number" inputMode="numeric" {...register('parking_spots', { valueAsNumber: true })} className="mt-1" min={0} />
                </div>
              </div>

              <div>
                <Label>Características</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PROPERTY_FEATURES.map((f) => (
                    <label key={f.key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`features.${f.key}` as any)}
                        className="rounded"
                      />
                      <span className="text-sm">{f.icon} {f.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preço */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>
                  {listingType === 'rent' ? 'Valor do aluguel *' : 'Preço de venda *'} (R$)
                </Label>
                <Controller
                  control={control}
                  name="price"
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      className="mt-1 text-lg font-bold"
                      placeholder={listingType === 'rent' ? 'Ex: 2.500' : 'Ex: 450.000'}
                      decimalSeparator=","
                      thousandSeparator="."
                      decimalScale={2}
                      prefix="R$ "
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v.floatValue)}
                    />
                  )}
                />
                {errors.price && <p className="text-destructive text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <Label>Condomínio (R$/mês)</Label>
                <Controller
                  control={control}
                  name="condo_fee"
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      className="mt-1"
                      placeholder="Opcional"
                      decimalSeparator=","
                      thousandSeparator="."
                      decimalScale={2}
                      prefix="R$ "
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v.floatValue)}
                    />
                  )}
                />
              </div>

              <div>
                <Label>IPTU (R$/mês)</Label>
                <Controller
                  control={control}
                  name="iptu"
                  render={({ field }) => (
                    <NumericFormat
                      customInput={Input}
                      className="mt-1"
                      placeholder="Opcional"
                      decimalSeparator=","
                      thousandSeparator="."
                      decimalScale={2}
                      prefix="R$ "
                      value={field.value ?? ''}
                      onValueChange={(v) => field.onChange(v.floatValue)}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Fotos */}
          {step === 4 && (
            <PhotoUpload
              value={photoUrls}
              onChange={(urls) => setValue('photo_urls', urls)}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
              isUploading={isUploading}
              progress={progress}
            />
          )}

          {/* Navegação */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => step > 0 ? setStep((s) => s - 1) : router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {step === 0 ? 'Cancelar' : 'Voltar'}
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting || isUploading}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting || isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Publicar anúncio
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
