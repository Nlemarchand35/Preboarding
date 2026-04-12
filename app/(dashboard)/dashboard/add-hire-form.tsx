'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Plus } from 'lucide-react'

interface AddHireSheetProps {
  companyId: string
  recruiterId: string
}

export function AddHireSheet({ companyId, recruiterId }: AddHireSheetProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    position: '',
    start_date: '',
    welcome_message: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: hire, error: insertError } = await supabase
      .from('hires')
      .insert({
        company_id: companyId,
        recruiter_id: recruiterId,
        candidate_name: form.candidate_name,
        candidate_email: form.candidate_email,
        candidate_phone: form.candidate_phone || null,
        position: form.position,
        start_date: form.start_date,
        welcome_message: form.welcome_message || null,
      })
      .select()
      .single()

    if (insertError || !hire) {
      setError(insertError?.message ?? 'Erreur lors de la création.')
      setLoading(false)
      return
    }

    // Send welcome email
    try {
      await fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hire_id: hire.id }),
      })
    } catch {
      // Non-blocking: email failure shouldn't block the hire creation
    }

    setOpen(false)
    setForm({
      candidate_name: '',
      candidate_email: '',
      candidate_phone: '',
      position: '',
      start_date: '',
      welcome_message: '',
    })
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un embauché
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nouvel embauché</SheetTitle>
          <SheetDescription>
            Renseignez les informations du candidat pour démarrer son preboarding.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="candidate_name">Nom du candidat *</Label>
            <Input
              id="candidate_name"
              name="candidate_name"
              value={form.candidate_name}
              onChange={handleChange}
              placeholder="Marie Dupont"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="candidate_email">Email *</Label>
            <Input
              id="candidate_email"
              name="candidate_email"
              type="email"
              value={form.candidate_email}
              onChange={handleChange}
              placeholder="marie.dupont@email.fr"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="candidate_phone">Téléphone</Label>
            <Input
              id="candidate_phone"
              name="candidate_phone"
              type="tel"
              value={form.candidate_phone}
              onChange={handleChange}
              placeholder="06 00 00 00 00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="position">Poste *</Label>
            <Input
              id="position"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Développeur Full-stack"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="start_date">Date de prise de poste (J1) *</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="welcome_message">Message d&apos;accueil personnalisé</Label>
            <Textarea
              id="welcome_message"
              name="welcome_message"
              value={form.welcome_message}
              onChange={handleChange}
              placeholder="Bonjour Marie, nous sommes ravis de vous accueillir dans notre équipe…"
              rows={4}
            />
          </div>

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Création…
                </span>
              ) : (
                'Créer et envoyer l\'email'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
