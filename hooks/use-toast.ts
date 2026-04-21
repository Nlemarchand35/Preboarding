'use client'

import { useState, useEffect } from 'react'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

// Module-level singleton store — shared across all useToast() calls
let counter = 0
let store: ToastMessage[] = []
const listeners = new Set<(toasts: ToastMessage[]) => void>()

function notify() {
  const snapshot = [...store]
  listeners.forEach((l) => l(snapshot))
}

export function toast(msg: Omit<ToastMessage, 'id'>) {
  const id = String(++counter)
  store = [...store, { id, ...msg }]
  notify()
  setTimeout(() => {
    store = store.filter((t) => t.id !== id)
    notify()
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(store)

  useEffect(() => {
    listeners.add(setToasts)
    return () => {
      listeners.delete(setToasts)
    }
  }, [])

  return { toasts }
}
