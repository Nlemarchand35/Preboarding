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

function LastLogCell({ log }: { log: HireWithLastLog['lastLog'] }) {
  if (!log) return <span className="text-gray-400">—</span>
  return (
    <span className="text-gray-600 text-xs">
      {REMINDER_LABELS[log.reminder_type as ReminderType]} le {formatDate(log.sent_at)}
    </span>
  )
}

function ReminderButton({ hire }: { hire: HireWithLastLog }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (hire.status !== 'pending') return null

  async function handleClick() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/hires/${hire.token}/send-reminder`, { method: 'POST' })
        if (res.ok) {
          setDone(true)
          toast({ title: 'Rappel envoyé', description: `Email envoyé à ${hire.candidate_email}`, variant: 'success' })
          setTimeout(() => setDone(false), 3000)
        } else if (res.status === 403) {
          toast({ title: 'Accès refusé', variant: 'destructive' })
        } else {
          toast({ title: 'Erreur lors de l\'envoi', variant: 'destructive' })
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
      className={done ? 'border-green-300 text-green-700' : ''}
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

function HiresTableContent({ hires }: { hires: HireWithLastLog[] }) {
  if (hires.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border">
        <p className="text-gray-500 font-medium">Aucun embauché dans cette catégorie</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Candidat</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Poste</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Date J1</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Statut</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Dernier rappel</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {hires.map((hire) => (
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
                <LastLogCell log={hire.lastLog} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <a
                    href={`/onboard/${hire.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs whitespace-nowrap"
                  >
                    Portail →
                  </a>
                  <ReminderButton hire={hire} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface HiresTableProps {
  hires: HireWithLastLog[]
}

export function HiresTable({ hires }: HiresTableProps) {
  if (hires.length === 0) {
    return (
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
    )
  }

  const pending = hires.filter((h) => h.status === 'pending')
  const confirmed = hires.filter((h) => h.status === 'confirmed')
  const noShow = hires.filter((h) => h.status === 'no_show')

  function tabLabel(label: string, count: number) {
    return (
      <span className="flex items-center gap-1.5">
        {label}
        <span className="rounded-full bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 font-medium leading-none">
          {count}
        </span>
      </span>
    )
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="mb-4">
        <TabsTrigger value="all">{tabLabel('Tous', hires.length)}</TabsTrigger>
        <TabsTrigger value="pending">{tabLabel('En attente', pending.length)}</TabsTrigger>
        <TabsTrigger value="confirmed">{tabLabel('Confirmés', confirmed.length)}</TabsTrigger>
        <TabsTrigger value="no_show">{tabLabel('No-show', noShow.length)}</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <HiresTableContent hires={hires} />
      </TabsContent>
      <TabsContent value="pending">
        <HiresTableContent hires={pending} />
      </TabsContent>
      <TabsContent value="confirmed">
        <HiresTableContent hires={confirmed} />
      </TabsContent>
      <TabsContent value="no_show">
        <HiresTableContent hires={noShow} />
      </TabsContent>
    </Tabs>
  )
}
