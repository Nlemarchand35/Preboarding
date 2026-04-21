'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Mode = 'password' | 'magic'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]       = useState<Mode>('magic')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [sent, setSent]       = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    if (mode === 'magic') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSent(true)
      setLoading(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre boîte mail</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Un lien de connexion a été envoyé à<br />
            <strong className="text-gray-700">{email}</strong>
          </p>
          <button
            type="button"
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-6 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Utiliser une autre adresse
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -left-10 w-48 h-48 bg-white/5 rounded-full" />

        <div>
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center mb-8">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Preboarding</h1>
          <p className="text-blue-200 text-base leading-relaxed">
            Chaque candidat qui confirme sa présence,<br />c&apos;est un no-show J1 évité.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { stat: '< 2 min', label: 'Pour intégrer un candidat' },
            { stat: '−40 %', label: 'De no-show après preboarding' },
            { stat: '100 %', label: 'Mobile, sans application à installer' },
          ].map(({ stat, label }) => (
            <div key={stat} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white w-24 flex-shrink-0">{stat}</span>
              <span className="text-blue-200 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Preboarding</h1>
            <p className="text-gray-500 text-sm mt-1">Espace recruteur</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
            <p className="text-gray-500 text-sm mt-1">Accédez à votre dashboard recruteur.</p>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {(['magic', 'password'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null) }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'magic' ? '✉ Lien magique' : '🔑 Mot de passe'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
                required
                autoComplete="email"
                className="mt-1.5"
              />
            </div>

            {mode === 'password' && (
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="mt-1.5"
                />
              </div>
            )}

            <Button type="submit" className="w-full h-11 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {mode === 'magic' ? 'Envoi…' : 'Connexion…'}
                </span>
              ) : mode === 'magic' ? (
                'Recevoir le lien de connexion'
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {mode === 'magic' && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Un email avec un lien sécurisé sera envoyé — aucun mot de passe nécessaire.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
