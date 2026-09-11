import { CheckCircle2, Home, Plus, Star, Users } from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { type TripSummary } from '../data/mockData'

const GROUPS: { key: TripSummary['status']; label: string }[] = [
  { key: 'live', label: 'Happening now' },
  { key: 'planning', label: 'Planning' },
  { key: 'past', label: 'Been there' },
]

/**
 * The workspace holds every trip. Only one is open at a time — switching
 * happens here rather than in a tab, so the phase nav stays three-wide.
 */
export default function Trips({
  currentId,
  trips,
  readOnly,
  onOpen,
  onNewTrip,
  onLeaveSample,
}: {
  currentId: string
  trips: TripSummary[]
  readOnly?: boolean
  onOpen: (id: string) => void
  onNewTrip: () => void
  /** Only set while the sample is the only thing loaded — see App. */
  onLeaveSample?: () => void
}) {
  return (
    <div className="pb-2">
      {!readOnly && (
      <button
        onClick={onNewTrip}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-moss-dark py-3 text-[14px] font-extrabold text-white shadow-soft transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
      >
        <Plus size={16} /> Start a new trip
      </button>
      )}

      {GROUPS.map((group) => {
        const rows = trips.filter((t) => t.status === group.key)
        if (rows.length === 0) return null
        return (
          <section key={group.key} className="mb-4">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
              {group.label}
            </p>
            <div className="flex flex-col gap-2">
              {rows.map((trip) => {
                const active = trip.id === currentId
                return (
                  <button key={trip.id} onClick={() => onOpen(trip.id)} className="text-left">
                    <Card
                      className={`flex items-center gap-3 p-3 transition ${
                        active ? 'ring-2 ring-moss-dark' : 'hover:shadow-pop'
                      }`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-xl">
                        {trip.cover}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 truncate text-[14px] font-extrabold leading-tight text-ink">
                          {trip.flag} {trip.name}
                          {active && <CheckCircle2 size={13} className="shrink-0 text-moss-dark" />}
                        </p>
                        <p className="truncate text-[11px] font-semibold text-ink-soft">
                          {trip.dates} ·{' '}
                          <span className="inline-flex items-center gap-0.5">
                            <Users size={9} /> {trip.travelerCount}
                          </span>
                        </p>
                        <p className="mt-1 truncate text-[11px] text-ink-soft">{trip.highlight}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {trip.status === 'live' && <Pill tone="blush">Live</Pill>}
                        {trip.status === 'planning' && <Pill tone="sun">Draft</Pill>}
                        {trip.status === 'past' && (
                          <>
                            <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-sun-dark">
                              <Star size={10} fill="currentColor" /> {trip.rating}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                (trip.spent ?? 0) > trip.budget ? 'text-coral' : 'text-ink-soft'
                              }`}
                            >
                              RM{trip.spent?.toLocaleString()} / {trip.budget.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </Card>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}

      <p className="mt-1 text-center text-[11px] font-semibold text-ink-soft">
        Every trip keeps its own places, budget and group.
      </p>

      {/* You came in to look around; you should be able to leave the same way. */}
      {onLeaveSample && (
        <button
          onClick={onLeaveSample}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-black/[0.08] py-2.5 text-[12px] font-extrabold text-ink-soft transition hover:bg-black/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
        >
          <Home size={13} /> Leave the sample and start your own
        </button>
      )}
    </div>
  )
}
