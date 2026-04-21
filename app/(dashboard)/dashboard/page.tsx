import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AddHireSheet } from './add-hire-form'
import { HiresTable } from './hires-table'
import type { Hire, ReminderLog } from '@/types/database'

export type HireWithLastLog = Hire & {
  lastLog: Pick<ReminderLog, 'reminder_type' | 'sent_at'> | null
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

  // Single query: hires + all their reminder_logs (Supabase does the join server-side)
  const { data: hiresRaw, error: hiresError } = await supabase
    .from('hires')
    .select('*, reminder_logs(reminder_type, sent_at)')
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

  const companiesRaw = (recruiter as { companies: unknown }).companies
  const companyArr = Array.isArray(companiesRaw) ? companiesRaw : [companiesRaw]
  const company = companyArr[0] as { name: string } | null

  // Extract last reminder_log per hire (server-side, no N+1)
  const hires: HireWithLastLog[] = (hiresRaw ?? []).map((h) => {
    const logs = (h as { reminder_logs: Array<{ reminder_type: string; sent_at: string }> }).reminder_logs ?? []
    const sorted = [...logs].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
    const lastLog = sorted[0]
      ? ({ reminder_type: sorted[0].reminder_type, sent_at: sorted[0].sent_at } as Pick<ReminderLog, 'reminder_type' | 'sent_at'>)
      : null

    // Destructure without reminder_logs to match Hire shape
    const { reminder_logs: _rl, ...hireFields } = h as typeof h & { reminder_logs: unknown }
    void _rl
    return { ...(hireFields as Hire), lastLog }
  })

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

      <HiresTable hires={hires} />
    </div>
  )
}
