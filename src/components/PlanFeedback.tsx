import { useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import { Pet } from './Pet'

export const TWEAKS = [
  { id: 'cheaper', label: 'Cheaper' },
  { id: 'food', label: 'More food' },
  { id: 'walk', label: 'Less walking' },
  { id: 'culture', label: 'More culture' },
  { id: 'slow', label: 'Slower pace' },
  { id: 'night', label: 'More nightlife' },
] as const

export type TweakId = (typeof TWEAKS)[number]['id']

/**
 * The refinement loop. Without a way to answer back, a generated plan is a
 * vending machine — you either take what fell out or you leave.
 */
export function PlanFeedback({
  active,
  note,
  onToggle,
  onNote,
  onApply,
}: {
  active: TweakId[]
  note: string
  onToggle: (id: TweakId) => void
  onNote: (v: string) => void
  onApply: () => void
}) {
  const [open, setOpen] = useState(false)
  const dirty = active.length > 0 || note.trim().length > 0

  return (
    <div className="mt-4 rounded-3xl border border-black/[0.06] bg-white/80 p-3 shadow-soft">
      <div className="flex items-start gap-2.5">
        <Pet emotion="shy" size={40} bob={false} />
        <p className="flex-1 pt-1 text-[13px] leading-snug text-ink">
          “Not quite right? Tell me what to change.”
        </p>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {TWEAKS.map((t) => {
          const on = active.includes(t.id)
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              aria-pressed={on}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition ${
                on ? 'bg-moss-dark text-white' : 'border border-black/10 bg-white text-ink-soft hover:text-ink'
              }`}
            >
              {t.label}
              {on && <X size={11} />}
            </button>
          )
        })}
      </div>

      {open ? (
        <textarea
          autoFocus
          value={note}
          onChange={(e) => onNote(e.target.value)}
          rows={2}
          placeholder="Or say it in your own words — “skip the tower, it's a tourist trap”"
          className="mt-2.5 w-full resize-none rounded-2xl border-2 border-black/10 bg-white px-3 py-2 text-[13px] font-semibold leading-snug text-ink outline-none focus:border-moss-dark placeholder:font-normal placeholder:text-ink-soft/70"
        />
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 pl-1 text-[12px] font-bold text-moss-dark underline decoration-dotted underline-offset-2"
        >
          Or type it yourself
        </button>
      )}

      <button
        onClick={onApply}
        disabled={!dirty}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-moss-dark py-2.5 text-[13px] font-extrabold text-white transition hover:brightness-105 disabled:opacity-35"
      >
        <RefreshCw size={14} /> Redo the plans with this
      </button>
    </div>
  )
}
