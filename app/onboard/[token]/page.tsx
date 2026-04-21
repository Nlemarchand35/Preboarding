export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import type { ChecklistItem, ChecklistCompletion } from '@/types/database'
import { ChecklistClient } from './checklist-client'
import { ConfirmButtonClient } from './confirm-button-client'

interface OnboardPageProps {
  params: { token: string }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getDaysUntil(startDateStr: string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const start = new Date(startDateStr)
  start.setUTCHours(0, 0, 0, 0)
  return Math.round((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function CountdownPill({ days }: { days: number }) {
  if (days < 0) return null
  if (days === 0) return (
    <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      C&apos;est aujourd&apos;hui !
    </div>
  )
  if (days === 1) return (
    <div className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      C&apos;est demain !
    </div>
  )
  return (
    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
      Dans <strong>{days}</strong> jours
    </div>
  )
}

export default async function OnboardPage({ params }: OnboardPageProps) {
  const supabase = createAdminClient()

  const { data: hire, error } = await supabase
    .from('hires')
    .select('*, companies(name)')
    .eq('token', params.token)
    .single()

  if (error || !hire) notFound()

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('company_id', hire.company_id)
    .order('sort_order', { ascending: true })

  const { data: completions } = await supabase
    .from('checklist_completions')
    .select('*')
    .eq('hire_id', hire.id)

  const companiesRaw = (hire as { companies: unknown }).companies
  const companyArr = Array.isArray(companiesRaw) ? companiesRaw : [companiesRaw]
  const company = companyArr[0] as { name: string } | null

  const items: ChecklistItem[] = checklistItems ?? []
  const doneIds = new Set((completions as ChecklistCompletion[] ?? []).map((c) => c.item_id))
  const isConfirmed = hire.status === 'confirmed'
  const daysUntil = getDaysUntil(hire.start_date)
  const firstName = hire.candidate_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header ─────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 pt-10 pb-16 text-center relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute top-12 -left-6 w-24 h-24 bg-white/5 rounded-full" />

        {/* Avatar */}
        <div className="relative inline-flex mb-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white text-xl font-bold tracking-wide">
            {getInitials(hire.candidate_name)}
          </div>
          {isConfirmed && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-blue-800">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {company && (
          <p className="text-blue-200 text-xs font-medium uppercase tracking-widest mb-2">
            {company.name}
          </p>
        )}
        <h1 className="text-white text-2xl font-bold mb-3 animate-slide-up">
          Bonjour {firstName} !
        </h1>
        <CountdownPill days={daysUntil} />
      </div>

      {/* ── Main content ─────────────────────────────── */}
      <div className="max-w-sm mx-auto px-4 -mt-8 pb-36 space-y-4">

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Poste</p>
              <p className="font-semibold text-gray-900 text-sm leading-snug">{hire.position}</p>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Premier jour</p>
              <p className="font-semibold text-gray-900 text-sm leading-snug capitalize">
                {formatDate(hire.start_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        {hire.welcome_message && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">Message de votre équipe</p>
                <p className="text-sm text-gray-700 leading-relaxed">{hire.welcome_message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        {items.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <ChecklistClient
              hireId={hire.id}
              items={items}
              initialDoneIds={Array.from(doneIds)}
              token={params.token}
            />
          </div>
        )}

        {/* Already confirmed — static celebration */}
        {isConfirmed && (
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-6 text-center animate-celebration-in">
            <div className="relative inline-flex mb-4">
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse-ring" />
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center relative">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="font-bold text-gray-900 text-lg mb-1">Présence confirmée !</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Nous vous attendons avec impatience<br />
              le <span className="font-medium text-gray-700 capitalize">{formatDate(hire.start_date)}</span>.
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-float-dot-1" />
              <span className="w-2 h-2 bg-blue-300 rounded-full animate-float-dot-2" />
              <span className="w-2 h-2 bg-green-300 rounded-full animate-float-dot-3" />
            </div>
          </div>
        )}

      </div>

      {/* ── Sticky confirm button ─────────────────── */}
      {!isConfirmed && (
        <div className="fixed bottom-0 left-0 right-0 z-10 pointer-events-none">
          <div className="max-w-sm mx-auto px-4 pb-6 pt-8 pointer-events-auto"
            style={{ background: 'linear-gradient(to top, #f9fafb 65%, transparent)' }}>
            <ConfirmButtonClient token={params.token} />
          </div>
        </div>
      )}

      <p className="text-center text-xs text-gray-400 pb-4 pt-2">Propulsé par Preboarding</p>
    </div>
  )
}
