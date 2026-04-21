import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { reminderJ7, reminderJ3, reminderJ1 } from '@/lib/email-templates'

interface RouteParams {
  params: { token: string }
}

function getDeltaDays(startDateStr: string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const startDate = new Date(startDateStr)
  startDate.setUTCHours(0, 0, 0, 0)
  return Math.round((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  // Verify recruiter JWT
  const serverClient = createClient()
  const { data: { user }, error: authError } = await serverClient.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch hire by token
  const { data: hire, error: hireError } = await supabase
    .from('hires')
    .select('*, companies(name)')
    .eq('token', params.token)
    .single()

  if (hireError || !hire) {
    return NextResponse.json({ error: 'Embauché introuvable' }, { status: 404 })
  }

  // Verify recruiter belongs to same company
  const { data: recruiter, error: recruiterError } = await supabase
    .from('recruiters')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (recruiterError || !recruiter || recruiter.company_id !== hire.company_id) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const companiesRaw = (hire as { companies: unknown }).companies
  const companyArr = Array.isArray(companiesRaw) ? companiesRaw : [companiesRaw]
  const companyName = (companyArr[0] as { name?: string } | null)?.name ?? 'Votre entreprise'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const portalUrl = `${appUrl}/onboard/${hire.token}`
  const hireWithCompany = { ...hire, companyName }

  // Pick template based on delta (manual fallback: use closest reminder)
  const delta = getDeltaDays(hire.start_date)
  let templateFn = reminderJ7
  if (delta <= 1) templateFn = reminderJ1
  else if (delta <= 3) templateFn = reminderJ3

  const { subject, html } = templateFn(hireWithCompany, portalUrl)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: `${companyName} <onboarding@resend.dev>`,
    to: hire.candidate_email,
    subject,
    html,
  })

  if (emailError) {
    console.error('send-reminder error:', emailError)
    return NextResponse.json({ error: 'Échec envoi email' }, { status: 500 })
  }

  await supabase.from('reminder_logs').insert({
    hire_id: hire.id,
    reminder_type: 'manual',
    email_id: emailData?.id ?? null,
  })

  return NextResponse.json({ sent: true })
}
