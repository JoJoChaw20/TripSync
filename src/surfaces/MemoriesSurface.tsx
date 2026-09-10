import { Star } from 'lucide-react'
import { Card } from '../components/ui'
import { Pet } from '../components/Pet'
import PostTrip from '../screens/PostTrip'
import type { TripSummary } from '../data/mockData'
import type { SheetId } from '../navigation'

/**
 * Memories shows the review for a finished trip. While a trip is still
 * ahead, it shows the ones you've already taken instead of pretending
 * this one is over.
 */
export default function MemoriesSurface({
  trip,
  trips,
  onOpenTrip,
  onOpenSheet,
}: {
  trip: TripSummary
  trips: TripSummary[]
  onOpenTrip: (id: string) => void
  onOpenSheet: (id: SheetId) => void
}) {
  if (trip.status === 'past') {
    return <PostTrip trip={trip} />
  }

  const past = trips.filter((t) => t.status === 'past')

  return (
    <div className="pb-2">
      <div className="mb-4 flex items-start gap-3">
        <Pet emotion="shy" size={50} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “{trip.name} hasn't happened yet — I'll fill this in once you're back. Here's what we've already done.”
          </p>
        </Card>
      </div>

      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">Trips you've taken</p>
      <div className="flex flex-col gap-2">
        {past.map((t) => (
          <button key={t.id} onClick={() => onOpenTrip(t.id)} className="text-left">
            <Card className="flex items-center gap-3 p-3 transition hover:shadow-pop">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-xl">
                {t.cover}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-extrabold leading-tight text-ink">
                  {t.flag} {t.name}
                </p>
                <p className="truncate text-[11px] font-semibold text-ink-soft">{t.dates}</p>
                <p className="mt-0.5 truncate text-[11px] text-ink-soft">{t.highlight}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-sun-dark">
                  <Star size={10} fill="currentColor" /> {t.rating}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    (t.spent ?? 0) > t.budget ? 'text-coral' : 'text-ink-soft'
                  }`}
                >
                  RM{t.spent?.toLocaleString()} / {t.budget.toLocaleString()}
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      <button
        onClick={() => onOpenSheet('trips')}
        className="mt-4 w-full text-[13px] font-bold text-moss-dark underline decoration-dotted underline-offset-4"
      >
        See all trips
      </button>
    </div>
  )
}
