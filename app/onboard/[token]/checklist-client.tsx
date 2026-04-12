'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { ChecklistItem } from '@/types/database'

interface ChecklistClientProps {
  hireId: string
  items: ChecklistItem[]
  initialDoneIds: string[]
  token: string
}

export function ChecklistClient({ hireId, items, initialDoneIds }: ChecklistClientProps) {
  const [doneIds, setDoneIds] = useState<Set<string>>(() => new Set(initialDoneIds))

  async function handleToggle(itemId: string, checked: boolean) {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    if (checked) {
      setDoneIds((prev) => new Set(Array.from(prev).concat(itemId)))
      await supabase.from('checklist_completions').upsert({
        hire_id: hireId,
        item_id: itemId,
      })
    } else {
      setDoneIds((prev) => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
      await supabase
        .from('checklist_completions')
        .delete()
        .eq('hire_id', hireId)
        .eq('item_id', itemId)
    }
  }

  const completedCount = doneIds.size
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Checklist avant J1</h2>
        <span className="text-sm text-gray-500">{completedCount}/{totalCount}</span>
      </div>

      <div className="mb-4">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <Checkbox
              id={item.id}
              checked={doneIds.has(item.id)}
              onCheckedChange={(checked) => handleToggle(item.id, Boolean(checked))}
              className="mt-0.5"
            />
            <Label
              htmlFor={item.id}
              className={`text-sm leading-relaxed cursor-pointer ${
                doneIds.has(item.id) ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {item.label}
              {item.required && (
                <span className="ml-1 text-red-500 text-xs">*</span>
              )}
            </Label>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <div className="mt-4 p-3 bg-green-50 rounded-xl text-center text-sm text-green-700 font-medium">
          Checklist complète !
        </div>
      )}
    </div>
  )
}
