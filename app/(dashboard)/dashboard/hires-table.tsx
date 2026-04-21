'use client'

import { useState, useTransition } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import type { HireStatus, ReminderType } from '@/types/database'
import type { HireWithLastLog } from './page'

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

const REMINDER_LABELS: Record<ReminderType, string> = {
  welcome: 'Email de bienvenue',
  j7: 'J-7',
  j3: 'J-3',
  j1: 'J-1',
  manual: 'Rappel manuel',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
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

function LastLogCell({ log }: { log: HireWithLastLog['lastLog'] }) {
  if (!log) return <span className="text-gray-300">—</span>
  return (
    <span className="text-gray-500 text-xs">
      {REMINDER_LABELS[log.reminder_type as ReminderType]}{' '}
      <span className="text-gray-400">le {formatDate(log.sent_at)}</span>
    </span>
  )
}

function DaysChip({ days }: { days: number }) {
  if (days < 0) return <span className="text-xs text-gray-400">Passé</span>
  if (days === 0) return <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Aujourd&apos;hui</span>
  if (days === 1) return <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Demain</span>
  if (days <= 7) return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">J-{days}</span>
  return null
}

function ReminderButton({ hire }: { hire: HireWithLastLog }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (hire.status !== 'pending') return null

  function handleClick() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/hires/${hire.token}/send-reminder`, { method: 'POST' })
        if (res.ok) {
          setDone(true)
          toast({ title: 'Rappel envoyé', description: `Email envoyé à ${hire.candidate_name}`, variant: 'success' })
          setTimeout(() => setDone(false), 3000)
        } else if (res.status === 403) {
          toast({ title: 'Accès refusé', variant: 'destructive' })
        } else {
          toast({ title: 'Échec de l\'envoi', variant: 'destructive' })
        }
      } catch {
        toast({ title: 'Connexion impossible', variant: 'destructive' })
      }
    })
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={`text-xs h-8 transition-colors ${done ? 'border-green-300 text-green-700 bg-green-50' : ''}`}
    >
      {isPending ? (
        <span className="flex items-center gap-1.5">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Envoi…
        </span>
      ) : done ? (
        '✓ Envoyé'
      ) : (
        'Envoyer un rappel'
      )}
    </Button>
  )
}

/* ── Desktop table row ──────────────────────────────────── */
function TableRow({ hire }: { hire: HireWithLastLog }) {
  const days = getDaysUntil(hire.start_date)
  return (
    <tr className="border-b last:border-0 hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <div className="font-medium text-gray-900 text-sm">{hire.candidate_name}</div>
        <div className="text-gray-400 text-xs mt-0.5">{hire.candidate_email}</div>
      </td>
      <td className="px-4 py-3.5 text-gray-600 text-sm">{hire.position}</td>
      <td className="px-4 py-3.5">
        <div className="text-sm text-gray-700">{formatDate(hire.start_date)}</div>
        <div className="mt-0.5"><DaysChip days={days} /></div>
      </td>
      <td className="px-4 py-3.5">
        <Badge variant={STATUS_VARIANTS[hire.status]}>
          {STATUS_LABELS[hire.status]}
        </Badge>
      </td>
      <td className="px-4 py-3.5">
        <LastLogCell log={hire.lastLog} />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <a
            href={`/onboard/${hire.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-xs whitespace-nowrap transition-colors"
          >
            Portail →
          </a>
          <ReminderButton hire={hire} />
        </div>
      </td>
    </tr>
  )
}

/* ── Mobile card ────────────────────────────────────────── */
function MobileCard({ hire }: { hire: HireWithLastLog }) {
  const days = getDaysUntil(hire.start_date)
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{hire.candidate_name}</p>
          <p className="text-gray-400 text-xs truncate">{hire.candidate_email}</p>
        </div>
        <Badge variant={STATUS_VARIANTS[hire.status]} className="flex-shrink-0">
          {STATUS_LABELS[hire.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-400 mb-0.5">Poste</p>
          <p className="text-gray-700 font-medium">{hire.position}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-0.5">Premier jour</p>
          <p className="text-gray-700 font-medium">{formatDate(hire.start_date)}</p>
          <DaysChip days={days} />
        </div>
      </div>

      {hire.lastLog && (
        <div className="text-xs text-gray-400 border-t border-gray-50 pt-2">
          <LastLogCell log={hire.lastLog} />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <a
          href={`/onboard/${hire.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors"
        >
          Portail candidat →
        </a>
        {hire.status === 'pending' && <ReminderButton hire={hire} />}
      </div>
    </div>
  )
}

/* ── Inner content (shared by all tabs) ─────────────────── */
function HiresContent({ hires }: { hires: HireWithLastLog[] }) {
  if (hires.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-400 text-sm">Aucun embauché dans cette catégorie</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              {['Candidat', 'Poste', 'Date J1', 'Statut', 'Dernier rappel', 'Actions'].map((col) => (
                <th key={col} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hires.map((hire) => <TableRow key={hire.id} hire={hire} />)}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {hires.map((hire) => <MobileCard key={hire.id} hire={hire} />)}
      </div>
    </>
  )
}

/* ── Tab label with count badge ─────────────────────────── */
function TabLabel({ label, count }: { label: string; count: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {count > 0 && (
        <span className="rounded-full bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 font-semibold leading-none min-w-[18px] text-center">
          {count}
        </span>
      )}
    </span>
  )
}

/* ── Root export ─────────────────────────────────────────── */
export function HiresTable({ hires }: { hires: HireWithLastLog[] }) {
  if (hires.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium mb-1">Aucun embauché pour le moment</p>
        <p className="text-gray-400 text-sm">
          Utilisez le bouton ci-dessus pour ajouter votre premier embauché.
        </p>
      </div>
    )
  }

  const pending   = hires.filter((h) => h.status === 'pending')
  const confirmed = hires.filter((h) => h.status === 'confirmed')
  const noShow    = hires.filter((h) => h.status === 'no_show')

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4 h-auto p-1">
        <TabsTrigger value="all"><TabLabel label="Tous" count={hires.length} /></TabsTrigger>
        <TabsTrigger value="pending"><TabLabel label="En attente" count={pending.length} /></TabsTrigger>
        <TabsTrigger value="confirmed"><TabLabel label="Confirmés" count={confirmed.length} /></TabsTrigger>
        <TabsTrigger value="no_show"><TabLabel label="No-show" count={noShow.length} /></TabsTrigger>
      </TabsList>

      <TabsContent value="all"><HiresContent hires={hires} /></TabsContent>
      <TabsContent value="pending"><HiresContent hires={pending} /></TabsContent>
      <TabsContent value="confirmed"><HiresContent hires={confirmed} /></TabsContent>
      <TabsContent value="no_show"><HiresContent hires={noShow} /></TabsContent>
    </Tabs>
  )
}
