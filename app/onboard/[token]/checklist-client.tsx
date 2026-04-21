'use client'

import { useState } from 'react'
import type { ChecklistItem } from '@/types/database'

interface ChecklistClientProps {
  hireId: string
  items: ChecklistItem[]
  initialDoneIds: string[]
  token: string
}

function AnimatedCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex-shrink-0 w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      style={{
        borderColor: checked ? '#2563eb' : '#d1d5db',
        backgroundColor: checked ? '#2563eb' : 'white',
        transform: checked ? 'scale(1)' : 'scale(1)',
      }}
    >
      <svg
        viewBox="0 0 12 10"
        className="w-3.5 h-3 text-white transition-all duration-200"
        style={{ opacity: checked ? 1 : 0, transform: checked ? 'scale(1)' : 'scale(0.5)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 5l3.5 3.5L11 1" />
      </svg>
    </button>
  )
}

export function ChecklistClient({ hireId, items, initialDoneIds }: ChecklistClientProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(() => new Set(initialDoneIds))
  const [pending, setPending] = useState<Set<string>>(() => new Set())

  async function handleToggle(itemId: string) {
    if (pending.has(itemId)) return

    const checked = !doneIds.has(itemId)

    // Optimistic update
    setDoneIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(itemId)
      else next.delete(itemId)
      return next
    })
    setPending((prev) => new Set(Array.from(prev).concat(itemId)))

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      if (checked) {
        await supabase.from('checklist_completions').upsert({ hire_id: hireId, item_id: itemId })
      } else {
        await supabase.from('checklist_completions').delete()
          .eq('hire_id', hireId).eq('item_id', itemId)
      }
    } catch {
      // Rollback on error
      setDoneIds((prev) => {
        const next = new Set(prev)
        if (checked) next.delete(itemId)
        else next.add(itemId)
        return next
      })
    } finally {
      setPending((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  const completedCount = doneIds.size
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = progress === 100

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with progress */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">À préparer avant J1</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors duration-300 ${
            allDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: allDone
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #3b82f6, #2563eb)',
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-50" />

      {/* Items */}
      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const isDone = doneIds.has(item.id)
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 px-5 py-3.5 transition-colors duration-150 ${
                isDone ? 'bg-gray-50/60' : 'bg-white'
              }`}
            >
              <div className="mt-0.5">
                <AnimatedCheckbox checked={isDone} onToggle={() => handleToggle(item.id)} />
              </div>
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className="flex-1 text-left min-w-0"
              >
                <span className={`text-sm leading-relaxed transition-all duration-200 block ${
                  isDone ? 'text-gray-400 line-through' : 'text-gray-700'
                }`}>
                  {item.label}
                  {item.required && !isDone && (
                    <span className="ml-1 text-blue-400 text-xs font-semibold">•</span>
                  )}
                </span>
              </button>
            </div>
          )
        })}
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="px-5 py-3.5 bg-green-50 border-t border-green-100 flex items-center gap-2.5 animate-slide-up">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 animate-check-pop">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-700">Tout est prêt pour votre arrivée !</p>
        </div>
      )}
    </div>
  )
}
