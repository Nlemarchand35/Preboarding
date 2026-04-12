import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { hire_id } = await request.json()

    if (!hire_id) {
      return NextResponse.json({ error: 'hire_id requis' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: hire, error: hireError } = await supabase
      .from('hires')
      .select('*, companies(name)')
      .eq('id', hire_id)
      .single()

    if (hireError || !hire) {
      return NextResponse.json({ error: 'Embauché introuvable' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const portalUrl = `${appUrl}/onboard/${hire.token}`
    const company = (hire as { companies: { name: string } | null }).companies
    const companyName = company?.name ?? 'Votre entreprise'

    const startDate = new Date(hire.start_date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: hire.candidate_email,
      subject: `Bienvenue chez ${companyName} — préparez votre arrivée`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue !</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;">
          <tr>
            <td style="background:#1e3a8a;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${companyName}</h1>
              <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Votre preboarding</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Bonjour ${hire.candidate_name} !</h2>
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
                Nous sommes ravis de vous accueillir dans notre équipe. Votre premier jour est prévu le
                <strong style="color:#1d4ed8;">${startDate}</strong> pour le poste de <strong>${hire.position}</strong>.
              </p>
              ${hire.welcome_message ? `
              <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin-bottom:24px;">
                <p style="margin:0;color:#1e40af;font-size:14px;line-height:1.6;">${hire.welcome_message}</p>
              </div>
              ` : ''}
              <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
                Pour vous préparer au mieux, cliquez sur le bouton ci-dessous pour accéder à votre portail de preboarding.
                Vous pourrez confirmer votre présence et compléter votre checklist d&rsquo;arrivée.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}"
                       style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
                      Accéder à mon espace preboarding →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;text-align:center;">
                Si le bouton ne fonctionne pas, copiez ce lien :<br>
                <a href="${portalUrl}" style="color:#3b82f6;word-break:break-all;">${portalUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} ${companyName} — Propulsé par Preboarding</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: 'Échec de l\'envoi email' }, { status: 500 })
    }

    // Log in reminder_logs
    await supabase.from('reminder_logs').insert({
      hire_id: hire.id,
      reminder_type: 'welcome',
      email_id: emailData?.id ?? null,
    })

    return NextResponse.json({ success: true, email_id: emailData?.id })
  } catch (err) {
    console.error('send-welcome error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
