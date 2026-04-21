'use client'

import { useState, useId } from 'react'
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
import { Plus, CheckCircle2 } from 'lucide-react'

interface AddHireSheetProps {
  companyId: string
  recruiterId: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1">{msg}</p>
}

export function AddHireSheet({ companyId, recruiterId }: AddHireSheetProps) {
  const router = useRouter()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    position: '',
    start_date: '',
    welcome_message: '',
  })

  const [fieldErrors, setFieldErrors] = useState<Partial<typeof form>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof typeof form, boolean>>>({})

  function validate(values: typeof form): Partial<typeof form> {
    const errs: Partial<typeof form> = {}
    if (!values.candidate_name.trim()) errs.candidate_name = 'Le nom est requis'
    if (!values.candidate_email.trim()) errs.candidate_email = "L'email est requis"
    else if (!EMAIL_RE.test(values.candidate_email)) errs.candidate_email = 'Format email invalide'
    if (!values.position.trim()) errs.position = 'Le poste est requis'
    if (!values.start_date) errs.start_date = 'La date J1 est requise'
    else if (new Date(values.start_date) < new Date()) errs.start_date = 'La date doit être dans le futur'
    return errs
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    const updated = { ...form, [name]: value }
    setForm(updated)
    if (touched[name as keyof typeof form]) {
      setFieldErrors(validate(updated))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setFieldErrors(validate(form))
  }

  function resetForm() {
    setForm({ candidate_name: '', candidate_email: '', candidate_phone: '', position: '', start_date: '', welcome_message: '' })
    setFieldErrors({})
    setTouched({})
    setSubmitError(null)
    setSuccess(null)
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) resetForm()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mark all as touched and validate
    setTouched({ candidate_name: true, candidate_email: true, position: true, start_date: true })
    const errs = validate(form)
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setLoading(true)
    setSubmitError(null)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: hire, error: insertError } = await supabase
      .from('hires')
      .insert({
        company_id: companyId,
        recruiter_id: recruiterId,
        candidate_name: form.candidate_name.trim(),
        candidate_email: form.candidate_email.trim().toLowerCase(),
        candidate_phone: form.candidate_phone.trim() || null,
        position: form.position.trim(),
        start_date: form.start_date,
        welcome_message: form.welcome_message.trim() || null,
      })
      .select()
      .single()

    if (insertError || !hire) {
      setSubmitError(insertError?.message ?? 'Erreur lors de la création.')
      setLoading(false)
      return
    }

    // Send welcome email (non-blocking)
    fetch('/api/send-welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hire_id: hire.id }),
    }).catch(() => null)

    setSuccess(form.candidate_name.trim())
    setLoading(false)
    router.refresh()
  }

  function handleAddAnother() {
    resetForm()
  }

  function handleClose() {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un embauché
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>Nouvel embauché</SheetTitle>
          <SheetDescription>
            L&apos;email de bienvenue avec le lien portail sera envoyé automatiquement.
          </SheetDescription>
        </SheetHeader>

        {/* Success state */}
        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 gap-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{success} est ajouté·e !</p>
              <p className="text-sm text-gray-500 mt-1">L&apos;email de bienvenue a été envoyé.</p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={handleAddAnother}>
                Ajouter un autre
              </Button>
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </div>
        ) : (
          <form id={formId} onSubmit={handleSubmit} noValidate className="mt-6 space-y-5 flex-1">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="candidate_name">Nom complet *</Label>
              <Input
                id="candidate_name"
                name="candidate_name"
                value={form.candidate_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Marie Dupont"
                className={fieldErrors.candidate_name ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              <FieldError msg={fieldErrors.candidate_name} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="candidate_email">Email *</Label>
              <Input
                id="candidate_email"
                name="candidate_email"
                type="email"
                value={form.candidate_email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="marie.dupont@email.fr"
                className={fieldErrors.candidate_email ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              <FieldError msg={fieldErrors.candidate_email} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="candidate_phone">
                Téléphone
                <span className="ml-1 text-gray-400 font-normal">(optionnel)</span>
              </Label>
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
                onBlur={handleBlur}
                placeholder="Développeur Full-stack"
                className={fieldErrors.position ? 'border-red-400 focus-visible:ring-red-400' : ''}
              />
              <FieldError msg={fieldErrors.position} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="start_date">Date de prise de poste (J1) *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.start_date ? 'border-red-400 focus-visible:ring-red-400' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              <FieldError msg={fieldErrors.start_date} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="welcome_message">
                Message d&apos;accueil
                <span className="ml-1 text-gray-400 font-normal">(optionnel)</span>
              </Label>
              <Textarea
                id="welcome_message"
                name="welcome_message"
                value={form.welcome_message}
                onChange={handleChange}
                placeholder="Bonjour Marie, nous sommes ravis de vous accueillir dans notre équipe…"
                rows={3}
              />
              <p className="text-xs text-gray-400">Apparaîtra sur le portail candidat et dans l&apos;email.</p>
            </div>

            <SheetFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
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
        )}
      </SheetContent>
    </Sheet>
  )
}
