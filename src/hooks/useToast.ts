'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastId = 0

// Store global simples — para produção use um lib como sonner
const listeners: Array<(toasts: Toast[]) => void> = []
let globalToasts: Toast[] = []

function notify(toasts: Toast[]) {
  globalToasts = toasts
  listeners.forEach((l) => l(toasts))
}

export function toast(options: Omit<Toast, 'id'> & { duration?: number }) {
  const id = String(++toastId)
  const newToast: Toast = { id, ...options }
  notify([...globalToasts, newToast])

  setTimeout(() => {
    notify(globalToasts.filter((t) => t.id !== id))
  }, options.duration ?? 4000)

  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts)

  // Sincroniza com o store global
  useState(() => {
    listeners.push(setToasts)
    return () => {
      const idx = listeners.indexOf(setToasts)
      if (idx !== -1) listeners.splice(idx, 1)
    }
  })

  const dismiss = useCallback((id: string) => {
    notify(globalToasts.filter((t) => t.id !== id))
  }, [])

  return { toasts, dismiss, toast }
}
