import type { LucideIcon } from 'lucide-react'
import { Check } from 'lucide-react'

export interface JourneyStep {
  id: string
  title: string
  short: string
  icon: LucideIcon
  phase: 'Before' | 'During' | 'After'
}

export function StepperNav({
  steps,
  current,
  onJump,
}: {
  steps: JourneyStep[]
  current: number
  onJump: (i: number) => void
}) {
  return (
    <div className="scrollbar-hide -mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:justify-center sm:gap-2 sm:px-0">
      {steps.map((step, i) => {
        const Icon = step.icon
        const state = i === current ? 'current' : i < current ? 'done' : 'upcoming'
        return (
          <button
            key={step.id}
            onClick={() => onJump(i)}
            title={step.title}
            className={`group flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all
              ${
                state === 'current'
                  ? 'border-moss-dark bg-moss-dark text-white shadow-soft'
                  : state === 'done'
                  ? 'border-moss/40 bg-sage-light text-moss-dark hover:border-moss-dark'
                  : 'border-black/10 bg-white/60 text-ink-soft hover:border-moss/40 hover:text-ink'
              }`}
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                state === 'current' ? 'bg-white/25' : state === 'done' ? 'bg-moss-dark/15' : 'bg-black/5'
              }`}
            >
              {state === 'done' ? <Check size={12} strokeWidth={3} /> : <Icon size={12} strokeWidth={2.5} />}
            </span>
            <span className="hidden whitespace-nowrap sm:inline">{step.short}</span>
          </button>
        )
      })}
    </div>
  )
}
