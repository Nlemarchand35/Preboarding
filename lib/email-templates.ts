import type { Hire } from '@/types/database'

interface HireWithCompanyName extends Hire {
  companyName: string
}

function emailShell(companyName: string, title: string, body: string, portalUrl: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
              ${body}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
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
</html>`
}

export function reminderJ7(hire: HireWithCompanyName, portalUrl: string): { subject: string; html: string } {
  const subject = `Votre premier jour approche — dans 7 jours chez ${hire.companyName}`

  const startDate = new Date(hire.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Bonjour ${hire.candidate_name} !</h2>
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#1e40af;font-size:15px;font-weight:600;">
        J-7 — Votre premier jour est dans 7 jours
      </p>
    </div>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Le grand jour approche ! Vous rejoignez <strong>${hire.companyName}</strong> le
      <strong style="color:#1d4ed8;">${startDate}</strong> en tant que <strong>${hire.position}</strong>.
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      C'est le bon moment pour vérifier votre checklist de préparation et confirmer votre présence
      si ce n'est pas encore fait.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;color:#166534;font-size:14px;">
        ✓ Vérifiez votre checklist d'arrivée<br>
        ✓ Confirmez votre présence<br>
        ✓ Préparez vos documents administratifs
      </p>
    </div>`

  return { subject, html: emailShell(hire.companyName, subject, body, portalUrl) }
}

export function reminderJ3(hire: HireWithCompanyName, portalUrl: string): { subject: string; html: string } {
  const subject = `Dans 3 jours, c'est votre premier jour chez ${hire.companyName}`

  const startDate = new Date(hire.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Bonjour ${hire.candidate_name} !</h2>
    <div style="background:#fefce8;border-left:4px solid #eab308;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#854d0e;font-size:15px;font-weight:600;">
        J-3 — Plus que 3 jours avant votre arrivée
      </p>
    </div>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Vous rejoignez <strong>${hire.companyName}</strong> le
      <strong style="color:#1d4ed8;">${startDate}</strong>.
      L'équipe vous attend avec impatience !
    </p>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Pensez à finaliser votre checklist avant votre premier jour et à confirmer votre présence.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:8px;">
      <p style="margin:0;color:#166534;font-size:14px;">
        ✓ Finalisez votre checklist d'arrivée<br>
        ✓ Confirmez votre présence si ce n'est pas encore fait<br>
        ✓ Notez l'adresse et les horaires de votre premier jour
      </p>
    </div>`

  return { subject, html: emailShell(hire.companyName, subject, body, portalUrl) }
}

export function reminderJ1(hire: HireWithCompanyName, portalUrl: string): { subject: string; html: string } {
  const subject = `Demain, c'est le grand jour — ${hire.companyName} vous attend !`

  const startDate = new Date(hire.start_date).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const body = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Bonjour ${hire.candidate_name} !</h2>
    <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px;margin-bottom:20px;">
      <p style="margin:0;color:#991b1b;font-size:15px;font-weight:600;">
        J-1 — Demain, c'est votre premier jour !
      </p>
    </div>
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      C'est demain ! Vous rejoignez <strong>${hire.companyName}</strong> le
      <strong style="color:#1d4ed8;">${startDate}</strong>.
      Toute l'équipe a hâte de vous accueillir.
    </p>
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      Si vous n'avez pas encore confirmé votre présence, faites-le maintenant en accédant à votre espace :
    </p>`

  return { subject, html: emailShell(hire.companyName, subject, body, portalUrl) }
}
