'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { MAX_PHOTOS, ACCEPTED_IMAGE_TYPES, MAX_PHOTO_SIZE_MB } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PhotoUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  pendingFiles: File[]
  onPendingFilesChange: (files: File[]) => void
  isUploading?: boolean
  progress?: Record<string, number>
}

export function PhotoUpload({
  value,
  onChange,
  pendingFiles,
  onPendingFilesChange,
  isUploading,
  progress = {},
}: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const files = Array.from(newFiles)
      const total = value.length + pendingFiles.length + files.length

      if (total > MAX_PHOTOS) {
        alert(`Máximo de ${MAX_PHOTOS} fotos permitido`)
        return
      }

      const valid = files.filter((f) => {
        if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) return false
        if (f.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) return false
        return true
      })

      const newPreviews = valid.map((f) => ({
        file: f,
        url: URL.createObjectURL(f),
      }))

      setPreviews((p) => [...p, ...newPreviews])
      onPendingFilesChange([...pendingFiles, ...valid])
    },
    [value, pendingFiles, onPendingFilesChange]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const removeUploaded = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const removePending = (index: number) => {
    URL.revokeObjectURL(previews[index]?.url)
    setPreviews((p) => p.filter((_, i) => i !== index))
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index))
  }

  const setCover = (url: string) => {
    onChange([url, ...value.filter((u) => u !== url)])
  }

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <label
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'relative flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all',
          dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        )}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          disabled={value.length + pendingFiles.length >= MAX_PHOTOS}
        />
        <Upload className={cn('h-8 w-8 mb-2', dragOver ? 'text-primary' : 'text-gray-300')} />
        <p className="text-sm font-medium text-gray-600">
          Arraste fotos ou clique para selecionar
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPEG, PNG ou WebP · Até {MAX_PHOTO_SIZE_MB}MB · Máx. {MAX_PHOTOS} fotos
        </p>
      </label>

      {/* Grid de fotos */}
      {(value.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {/* Fotos já enviadas */}
          {value.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border">
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <div className="absolute bottom-0 inset-x-0 bg-primary text-white text-center text-xs py-0.5">
                  Capa
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setCover(url)}
                    className="bg-white/90 text-xs rounded px-1.5 py-0.5 font-medium"
                  >
                    Capa
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeUploaded(i)}
                  className="bg-white/90 rounded-full p-0.5"
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          {/* Fotos pendentes (aguardando upload) */}
          {previews.map((p, i) => {
            const prog = progress[p.file.name]
            return (
              <div key={p.url} className="relative group aspect-square rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="w-full h-full object-cover" />

                {/* Progress overlay */}
                {isUploading && prog !== undefined && prog < 100 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                    <span className="text-white text-xs">{prog}%</span>
                  </div>
                )}

                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => removePending(i)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-white/90 rounded-full p-0.5"
                  >
                    <X className="h-3.5 w-3.5 text-red-500" />
                  </button>
                )}

                {/* Pending indicator */}
                {!isUploading && (
                  <div className="absolute bottom-0 inset-x-0 bg-yellow-500/90 text-white text-center text-xs py-0.5">
                    Pendente
                  </div>
                )}
              </div>
            )
          })}

          {/* Slot adicionar */}
          {value.length + previews.length < MAX_PHOTOS && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all">
              <input
                type="file"
                multiple
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className="hidden"
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
              <ImageIcon className="h-6 w-6 text-gray-300" />
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length + pendingFiles.length}/{MAX_PHOTOS} fotos · A primeira foto será a capa
      </p>
    </div>
  )
}
