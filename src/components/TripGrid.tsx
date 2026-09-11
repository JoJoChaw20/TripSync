import { Card } from './ui'
import { fromMin } from '../engine/buildPlan'
import type { Place, TripSummary } from '../data/mockData'
import type { PlanDay } from '../engine/types'

const START = 8 * 60 // 08:00
const END = 22 * 60 // 22:00
const SPAN = END - START
const TICKS = [8, 12, 16, 20]

const pct = (min: number) => ((min - START) / SPAN) * 100

/**
 * The whole trip on one screen — the thing a spreadsheet does well and a
 * day-at-a-time app cannot. Density, empty afternoons and late nights are
 * visible as shape, before you read a single word.
 */
export default function TripGrid({
  trip,
  days,
  places,
  onOpenDay,
}: {
  trip: TripSummary
  days: PlanDay[]
  places: Place[]
  onOpenDay: (index: number) => void
}) {
  const byId = (id: string) => places.find((p) => p.id === id)
  const multiCity = trip.legs.length > 1
  const busiest = Math.max(
    1,
    ...days.map((d) => d.items.reduce((n, i) => n + (byId(i.placeId)?.duration ?? 0), 0)),
  )

  return (
    <div className="pb-2">
      {/* hour scale, once, at the top */}
      <div className="mb-1 flex pl-[52px] pr-1">
        <div className="relative h-3 flex-1">
          {TICKS.map((h) => (
            <span
              key={h}
              className="absolute -translate-x-1/2 text-[9px] font-bold text-ink-soft"
              style={{ left: `${pct(h * 60)}%` }}
            >
              {h}:00
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {days.map((day, i) => {
          const load = day.items.reduce((n, it) => n + (byId(it.placeId)?.duration ?? 0), 0)
          const hours = Math.round((load / 60) * 10) / 10
          return (
            <button key={day.day} onClick={() => onOpenDay(i)} className="w-full text-left">
              <Card className="flex items-stretch gap-2 p-1.5 transition hover:shadow-pop">
                <div className="flex w-[44px] shrink-0 flex-col justify-center pl-1">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-ink-soft">Day</span>
                  <span className="font-display text-[15px] font-extrabold leading-none text-ink">{day.day}</span>
                  {multiCity && (
                    <span className="mt-0.5 truncate text-[8px] font-bold text-sky">{day.city}</span>
                  )}
                </div>

                <div className="relative min-w-0 flex-1 rounded-lg bg-black/[0.03] py-1.5" style={{ minHeight: 34 }}>
                  {TICKS.map((h) => (
                    <span
                      key={h}
                      className="absolute inset-y-0 w-px bg-black/[0.06]"
                      style={{ left: `${pct(h * 60)}%` }}
                    />
                  ))}

                  {day.items.length === 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink-soft/60">
                      nothing planned
                    </span>
                  )}

                  {day.items.map((item) => {
                    const place = byId(item.placeId)
                    if (!place) return null
                    const left = Math.max(0, pct(item.startMin))
                    const width = Math.max(6, (place.duration / SPAN) * 100)
                    return (
                      <span
                        key={`${item.placeId}-${item.startMin}`}
                        title={`${fromMin(item.startMin)} ${place.name}`}
                        className={`absolute top-1/2 flex -translate-y-1/2 items-center justify-center overflow-hidden rounded-md text-[11px] ${
                          place.indoor ? 'bg-sage text-moss-dark' : 'bg-sun/60 text-[#8a5f10]'
                        }`}
                        style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%`, height: 22 }}
                      >
                        {place.image}
                      </span>
                    )
                  })}
                </div>

                <div className="flex w-[34px] shrink-0 flex-col items-end justify-center pr-1">
                  <span className="text-[11px] font-extrabold tabular-nums text-ink">{hours || '—'}</span>
                  <span className="text-[8px] font-bold text-ink-soft">hrs</span>
                  <span
                    className="mt-0.5 h-0.5 rounded-full bg-moss-dark"
                    style={{ width: `${Math.max(8, (load / busiest) * 100)}%`, minWidth: 4 }}
                  />
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] font-bold text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-4 rounded bg-sage" /> indoor
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-4 rounded bg-sun/60" /> outdoor
        </span>
        <span>· tap a day to edit it</span>
      </div>
    </div>
  )
}
