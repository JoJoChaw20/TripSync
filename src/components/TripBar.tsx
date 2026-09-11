import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { AppIcon } from './AppIcon'
import { tripPlans, type TripSummary } from '../data/mockData'

/**
 * Persistent trip strip. The trip name is the workspace switcher — the three
 * things people used to navigate away to check (budget, what's next, which
 * trip) all live here permanently.
 */
export function TripBar({
  trip,
  tripCount,
  nextUp,
  onOpenTrips,
  onOpenBudget,
  onHome,
}: {
  trip: TripSummary
  tripCount: number
  nextUp: string
  onOpenTrips: () => void
  onOpenBudget: () => void
  /** Only set while the sample is all that's loaded — see App. */
  onHome?: () => void
}) {
  const plan = tripPlans.find((p) => p.id === 'balanced')!
  const committed = trip.status === 'live' ? plan.cost : (trip.spent ?? 0)
  const pct = Math.min(100, Math.round((committed / trip.budget) * 100))

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-black/[0.06] bg-cream/90 backdrop-blur-md">
      <div className="flex items-center gap-2.5 px-4 pb-2 pt-3">
        {/* You came in through Mochi, so Mochi is the way back out. Only
            while there is nothing of your own to lose. */}
        {onHome ? (
          <button
            onClick={onHome}
            aria-label="Back to start"
            title="Back to start"
            className="shrink-0 rounded-full transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
          >
            <AppIcon size={30} />
          </button>
        ) : (
          <AppIcon size={30} />
        )}
        <button
          onClick={onOpenTrips}
          aria-label="Switch trip"
          className="min-w-0 flex-1 rounded-xl px-1 py-0.5 text-left transition hover:bg-black/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
        >
          <p className="flex items-center gap-1 truncate font-display text-[15px] font-extrabold leading-tight text-ink">
            {trip.flag} {trip.name}
            <ChevronDown size={14} className="shrink-0 text-moss-dark" />
          </p>
          <p className="truncate text-[11px] font-semibold text-ink-soft">
            {trip.dates} · {trip.travelerCount} travellers · {tripCount} {tripCount === 1 ? 'trip' : 'trips'}
          </p>
        </button>
        <button
          onClick={onOpenBudget}
          aria-label="Trip settings"
          className="flex shrink-0 items-center gap-1 rounded-full bg-sage-light px-2.5 py-1.5 text-[11px] font-extrabold text-moss-dark transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
        >
          <SlidersHorizontal size={12} />
          RM{committed.toLocaleString()}
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="h-1 overflow-hidden rounded-full bg-black/[0.07]">
          <div
            className={`h-full rounded-full transition-all ${pct > 95 ? 'bg-coral' : 'bg-moss-dark'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-ink-soft">
          <span>
            {pct}% of RM{trip.budget.toLocaleString()} budget
          </span>
          <span className="truncate pl-3">{nextUp}</span>
        </div>
      </div>
    </header>
  )
}
