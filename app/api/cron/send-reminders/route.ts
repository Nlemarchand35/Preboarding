import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { reminderJ7, reminderJ3, reminderJ1 } from '@/lib/email-templates'
import type { ReminderType } from '@/types/database'

type ReminderDelta = 7 | 3 | 1

const REMINDER_TYPE: Record<ReminderDelta, ReminderType> = {
  7: 'j7',
  3: 'j3',
  1: 'j1',
}

function getDeltaDays(startDateStr: string): number {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const startDate = new Date(startDateStr)
  startDate.setUTCHours(0, 0, 0, 0)
  return Math.round((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function isReminderDelta(n: number): n is ReminderDelta {
  return n === 7 || n === 3 || n === 1
}

export async function GET(request: NextRequest) {
  // Auth guard
  const auth = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let sent = 0
  let skipped = 0
  let errors = 0

  // Fetch all pending hires with company name in one query
  const { data: hires, error: hiresError } = await supabase
    .from('hires')
    .select('*, companies(name)')
    .eq('status', 'pending')

  if (hiresError) {
    console.error('cron: failed to fetch hires', hiresError)
    return NextResponse.json({ error: hiresError.message }, { status: 500 })
  }

  if (!hires || hires.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, errors: 0 })
  }

  // Fetch existing reminder_logs for these hires in bulk (no N+1)
  const hireIds = hires.map((h) => h.id)
  const { data: existingLogs } = await supabase
    .from('reminder_logs')
    .select('hire_id, reminder_type')
    .in('hire_id', hireIds)
    .in('reminder_type', ['j7', 'j3', 'j1'])

  // Build a Set for O(1) deduplication lookups
  const sentSet = new Set<string>(
    (existingLogs ?? []).map((l) => `${l.hire_id}:${l.reminder_type}`)
  )

  for (const hire of hires) {
    const delta = getDeltaDays(hire.start_date)
    if (!isReminderDelta(delta)) continue

    const reminderType = REMINDER_TYPE[delta]
    const key = `${hire.id}:${reminderType}`

    // Idempotence: skip if already sent
    if (sentSet.has(key)) {
      skipped++
      continue
    }

    const companiesRaw = (hire as { companies: unknown }).companies
    const companyArr = Array.isArray(companiesRaw) ? companiesRaw : [companiesRaw]
    const companyName = (companyArr[0] as { name?: string } | null)?.name ?? 'Votre entreprise'

    const hireWithCompany = { ...hire, companyName }
    const portalUrl = `${appUrl}/onboard/${hire.token}`

    const templateFn = delta === 7 ? reminderJ7 : delta === 3 ? reminderJ3 : reminderJ1
    const { subject, html } = templateFn(hireWithCompany, portalUrl)

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: hire.candidate_email,
      subject,
      html,
    })

    if (emailError) {
      console.error(`cron: email failed for hire ${hire.id}`, emailError)
      errors++
      continue
    }

    const { error: logError } = await supabase.from('reminder_logs').insert({
      hire_id: hire.id,
      reminder_type: reminderType,
      email_id: emailData?.id ?? null,
    })

    if (logError) {
      console.error(`cron: log insert failed for hire ${hire.id}`, logError)
      errors++
      continue
    }

    sent++
  }

  return NextResponse.json({ sent, skipped, errors })
}
