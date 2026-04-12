import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { AddHireSheet } from './add-hire-form'
import type { Hire, HireStatus } from '@/types/database'

const STATUS_LABELS: Record<HireStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  no_show: 'No-show',
  cancelled: 'Annulé',
}

const STATUS_VARIANTS: Record<HireStatus, 'pending' | 'confirmed' | 'no_show' | 'cancelled'> = {
  pending: 'pending',
  confirmed: 'confirmed',
  no_show: 'no_show',
  cancelled: 'cancelled',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recruiter, error: recruiterError } = await supabase
    .from('recruiters')
    .select('company_id, full_name, companies(name)')
    .eq('id', user.id)
    .single()

  if (recruiterError || !recruiter) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Compte recruteur introuvable.</p>
        <p className="text-gray-500 text-sm mt-1">
          Veuillez contacter votre administrateur pour configurer votre accès.
        </p>
      </div>
    )
  }

  const { data: hires, error: hiresError } = await supabase
    .from('hires')
    .select('*')
    .eq('company_id', recruiter.company_id)
    .order('start_date', { ascending: true })

  if (hiresError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Erreur lors du chargement des embauches.</p>
        <p className="text-gray-500 text-sm mt-1">{hiresError.message}</p>
      </div>
    )
  }

  // Supabase join returns array — take first element
  const companiesRaw = (recruiter as { companies: unknown }).companies
  const company = Array.isArray(companiesRaw) ? (companiesRaw[0] as { name: string } | undefined) : (companiesRaw as { name: string } | null)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Embauches</h1>
          {company && (
            <p className="text-gray-500 text-sm mt-1">{company.name}</p>
          )}
        </div>
        <AddHireSheet companyId={recruiter.company_id} recruiterId={user.id} />
      </div>

      {!hires || hires.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <svg
            className="mx-auto h-12 w-12 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-500 font-medium">Aucun embauché pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">
            Ajoutez votre premier embauché pour démarrer le preboarding.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Candidat</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Poste</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date J1</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(hires as Hire[]).map((hire) => (
                <tr key={hire.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{hire.candidate_name}</div>
                    <div className="text-gray-500 text-xs">{hire.candidate_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{hire.position}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(hire.start_date)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[hire.status]}>
                      {STATUS_LABELS[hire.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/onboard/${hire.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Portail candidat →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
