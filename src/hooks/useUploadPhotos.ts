'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { STORAGE_BUCKET, MAX_PHOTO_SIZE_BYTES, ACCEPTED_IMAGE_TYPES } from '@/lib/constants'
import { toast } from '@/hooks/useToast'

interface UploadProgress {
  [filename: string]: number // 0-100
}

interface UseUploadPhotosReturn {
  uploadPhotos: (files: File[], propertyId: string) => Promise<string[]>
  isUploading: boolean
  progress: UploadProgress
  error: string | null
}

export function useUploadPhotos(): UseUploadPhotosReturn {
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress>({})
  const [error, setError] = useState<string | null>(null)

  const uploadPhotos = useCallback(
    async (files: File[], propertyId: string): Promise<string[]> => {
      setIsUploading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsUploading(false)
        throw new Error('Não autenticado')
      }

      // Valida arquivos
      const invalidFiles = files.filter(
        (f) => !ACCEPTED_IMAGE_TYPES.includes(f.type) || f.size > MAX_PHOTO_SIZE_BYTES
      )
      if (invalidFiles.length > 0) {
        const msg = `${invalidFiles.length} arquivo(s) inválido(s). Use JPEG, PNG ou WebP até 5MB.`
        setError(msg)
        setIsUploading(false)
        toast({ title: 'Arquivo inválido', description: msg, variant: 'destructive' })
        throw new Error(msg)
      }

      const urls: string[] = []

      for (const file of files) {
        setProgress((p) => ({ ...p, [file.name]: 10 }))

        try {
          // Comprime a imagem antes do upload
          let compressed: File = file
          try {
            compressed = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1400,
              useWebWorker: false,
              onProgress: (pct) => {
                setProgress((p) => ({ ...p, [file.name]: Math.floor(pct * 0.5) }))
              },
            })
          } catch {
            // Se a compressão falhar, usa o arquivo original
            compressed = file
          }

          setProgress((p) => ({ ...p, [file.name]: 55 }))

          // Caminho: {user_id}/{property_id}/{timestamp}-{filename}
          const ext = file.name.split('.').pop() || 'jpg'
          const path = `${user.id}/${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(path, compressed, {
              contentType: compressed.type,
              upsert: false,
            })

          if (uploadError) throw new Error(`Upload falhou: ${uploadError.message}`)

          setProgress((p) => ({ ...p, [file.name]: 90 }))

          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(path)

          urls.push(urlData.publicUrl)
          setProgress((p) => ({ ...p, [file.name]: 100 }))
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Erro ao enviar foto'
          setError(msg)
          toast({ title: 'Erro no upload', description: msg, variant: 'destructive' })
        }
      }

      setIsUploading(false)
      return urls
    },
    [supabase]
  )

  return { uploadPhotos, isUploading, progress, error }
}
