'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmButtonClientProps {
  token: string
}

export function ConfirmButtonClient({ token }: ConfirmButtonClientProps) {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/hires/${token}/confirm`, { method: 'PATCH' })
      if (res.ok) {
        setConfirmed(true)
      } else if (res.status === 404) {
        setError('Lien de confirmation invalide.')
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } catch {
      setError('Connexion impossible. Vérifiez votre réseau.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-green-800">Présence confirmée !</p>
        <p className="text-sm text-green-600 mt-1">Merci, nous vous attendons avec impatience.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
          {error}
        </div>
      )}
      <Button
        className="w-full h-12 text-base font-semibold rounded-2xl"
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Confirmation en cours…
          </span>
        ) : (
          'Confirmer ma présence'
        )}
      </Button>
    </div>
  )
}
