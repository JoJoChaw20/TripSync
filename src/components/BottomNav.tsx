import type { LucideIcon } from 'lucide-react'
import { CalendarDays, Sparkles, Sun } from 'lucide-react'

export type SurfaceId = 'plan' | 'today' | 'memories'

const TABS: { id: SurfaceId; label: string; icon: LucideIcon; phase: string }[] = [
  { id: 'plan', label: 'Plan', icon: CalendarDays, phase: 'Before' },
  { id: 'today', label: 'Today', icon: Sun, phase: 'During' },
  { id: 'memories', label: 'Memories', icon: Sparkles, phase: 'After' },
]

export function BottomNav({
  current,
  onChange,
  badge,
}: {
  current: SurfaceId
  onChange: (id: SurfaceId) => void
  badge?: SurfaceId | null
}) {
  return (
    <nav
      aria-label="Trip phases"
      className="sticky bottom-0 z-30 shrink-0 border-t border-black/[0.06] bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="flex">
        {TABS.map((tab) => {
          const active = current === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-moss-dark"
            >
              <span className="relative">
                <tab.icon size={20} className={active ? 'text-moss-dark' : 'text-ink-soft/60'} />
                {badge === tab.id && !active && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-coral ring-2 ring-cream" />
                )}
              </span>
              <span className={`text-[11px] font-extrabold ${active ? 'text-moss-dark' : 'text-ink-soft/60'}`}>
                {tab.label}
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wide ${active ? 'text-moss-dark/60' : 'text-transparent'}`}>
                {tab.phase}
              </span>
              {active && <span className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-moss-dark" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
