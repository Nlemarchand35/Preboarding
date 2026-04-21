'use client'

import { useState } from 'react'

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
      <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center animate-celebration-in">
        <div className="relative inline-flex mb-4">
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-ring" />
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center relative">
            <svg className="w-7 h-7 text-green-500 animate-check-pop" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="font-bold text-gray-900 text-lg mb-1">C&apos;est confirmé !</p>
        <p className="text-sm text-gray-500 leading-relaxed">
          Votre présence est enregistrée.<br />Nous avons hâte de vous accueillir.
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <span className="w-2 h-2 bg-green-300 rounded-full animate-float-dot-1" />
          <span className="w-2 h-2 bg-blue-300 rounded-full animate-float-dot-2" />
          <span className="w-2 h-2 bg-green-300 rounded-full animate-float-dot-3" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-center text-sm text-red-600 bg-red-50 rounded-xl py-2.5 px-4">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className="w-full h-14 rounded-2xl font-semibold text-base text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70 active:scale-[0.98]"
        style={{
          background: loading
            ? '#3b82f6'
            : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.35)',
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <svg className="animate-spin h-5 w-5 text-white/80" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Confirmation…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Confirmer ma présence
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </button>
    </div>
  )
}
