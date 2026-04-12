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

export default async function OnboardPage({ params }: OnboardPageProps) {
  const supabase = createAdminClient()

  const { data: hire, error } = await supabase
    .from('hires')
    .select('*, companies(name)')
    .eq('token', params.token)
    .single()

  if (error || !hire) {
    notFound()
  }

  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('company_id', hire.company_id)
    .order('sort_order', { ascending: true })

  const { data: completions } = await supabase
    .from('checklist_completions')
    .select('*')
    .eq('hire_id', hire.id)

  const company = (hire as { companies: { name: string } | null }).companies
  const items: ChecklistItem[] = checklistItems ?? []
  const doneIds = new Set((completions as ChecklistCompletion[] ?? []).map((c) => c.item_id))
  const isConfirmed = hire.status === 'confirmed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          {company && (
            <p className="text-blue-600 font-medium text-sm mb-1">{company.name}</p>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, {hire.candidate_name.split(' ')[0]} !
          </h1>
          <p className="text-gray-500 text-sm mt-2">Votre preboarding commence ici.</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Poste</p>
                <p className="font-semibold text-gray-900">{hire.position}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Premier jour</p>
                <p className="font-semibold text-gray-900 capitalize">{formatDate(hire.start_date)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome message */}
        {hire.welcome_message && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-2">Message de votre équipe</p>
            <p className="text-sm text-blue-700 leading-relaxed">{hire.welcome_message}</p>
          </div>
        )}

        {/* Checklist */}
        {items.length > 0 && (
          <ChecklistClient
            hireId={hire.id}
            items={items}
            initialDoneIds={Array.from(doneIds)}
            token={params.token}
          />
        )}

        {/* Confirmation */}
        {isConfirmed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-green-800">Présence confirmée !</p>
            <p className="text-sm text-green-600 mt-1">
              Nous vous attendons avec impatience le {formatDate(hire.start_date)}.
            </p>
          </div>
        ) : (
          <ConfirmButtonClient token={params.token} />
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Propulsé par Preboarding
        </p>
      </div>
    </div>
  )
}
