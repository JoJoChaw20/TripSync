import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, Share2, Users, Wand2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { originalItinerary, travelers, type Place, type TripSummary } from '../data/mockData'
import type { SheetId } from '../navigation'

const SLOTS = ['09:30', '12:30', '15:00', '19:00']

/**
 * Plan is the itinerary. Preferences, discovery and sharing are drawers
 * off it, never destinations of their own.
 */
export default function PlanSurface({
  trip,
  savedPlaces,
  readOnly,
  onOpenSheet,
}: {
  trip: TripSummary
  savedPlaces: Place[]
  readOnly: boolean
  onOpenSheet: (id: SheetId) => void
}) {
  const [activeDay, setActiveDay] = useState(trip.status === 'live' ? 1 : 0)

  // Which city each day belongs to, straight from the legs.
  const cityForDay: string[] = []
  trip.legs.forEach((leg) => {
    for (let i = 0; i < leg.days; i++) cityForDay.push(leg.city)
  })
  const multiCity = trip.legs.length > 1
  const seeded = trip.id === 'gz2026'

  // Guangzhou keeps its hand-built days; anything the user adds later is
  // slotted into a day in ITS OWN city, never dumped on the next free day.
  const base = Array.from({ length: Math.max(1, trip.days) }, (_, i) => {
    const hand = seeded ? originalItinerary[i] : undefined
    return {
      label: hand?.label ?? `Day ${i + 1}`,
      chip: hand?.date ?? `Day ${i + 1}`,
      items: (hand?.items ?? []).map((it) => ({ time: it.time, placeId: it.placeId, note: it.note })),
    }
  })

  const alreadyPlaced = new Set(base.flatMap((d) => d.items.map((it) => it.placeId)))

  trip.legs.forEach((leg) => {
    const dayIdx = cityForDay.map((c, i) => (c === leg.city ? i : -1)).filter((i) => i >= 0)
    if (dayIdx.length === 0) return
    const loose = savedPlaces.filter((pl) => pl.city === leg.city && !alreadyPlaced.has(pl.id))
    loose.forEach((pl, n) => {
      const target = base[dayIdx[n % dayIdx.length]]
      target.items.push({ time: SLOTS[target.items.length % SLOTS.length], placeId: pl.id, note: undefined })
    })
  })

  const days = base.map((d) => ({
    ...d,
    items: [...d.items].sort((a, b) => a.time.localeCompare(b.time)),
  }))

  const day = days[Math.min(activeDay, days.length - 1)]
  const byId = (id: string) => savedPlaces.find((p) => p.id === id)

  if (trip.status === 'past') {
    return (
      <Empty
        cover={trip.cover}
        title={trip.name}
        body="This trip is done. Its plan and photos live in Memories."
        cta="Back to my trips"
        onClick={() => onOpenSheet('trips')}
      />
    )
  }

  if (!seeded && savedPlaces.length === 0) {
    return (
      <Empty
        cover={trip.cover}
        title={trip.name}
        body={`${trip.days} days in ${trip.destination.split(',')[0]}, nothing scheduled yet. Start by saving a few places.`}
        cta={readOnly ? 'Back to my trips' : 'Add places'}
        onClick={() => onOpenSheet(readOnly ? 'trips' : 'places')}
        secondary={readOnly ? undefined : { label: 'Or get ideas from Mochi', onClick: () => onOpenSheet('suggestions') }}
      />
    )
  }

  return (
    <div className="pb-2">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-extrabold text-ink">Your plan</h1>
        <div className="flex -space-x-1.5">
          {travelers.slice(0, trip.travelerCount).map((t) => (
            <button
              key={t.id}
              onClick={() => onOpenSheet('group')}
              title={t.name}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm ring-2 ring-cream transition hover:scale-110"
              style={{ backgroundColor: `${t.color}66` }}
            >
              {t.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid grid-cols-4 gap-2">
        <QuickChip icon={Plus} label="Add place" disabled={readOnly} onClick={() => onOpenSheet('places')} />
        <QuickChip icon={Wand2} label="Ideas" disabled={readOnly} onClick={() => onOpenSheet('suggestions')} />
        <QuickChip icon={Users} label="Group" onClick={() => onOpenSheet('group')} />
        <QuickChip icon={Share2} label="Share" onClick={() => onOpenSheet('share')} />
      </div>

      {/* Every day fits the viewport — a sliced scroll row reads as broken. */}
      <div className={`mb-4 grid gap-1.5 ${days.length > 6 ? 'grid-cols-7' : days.length > 5 ? 'grid-cols-6' : 'grid-cols-5'}`}>
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            aria-label={d.chip}
            className={`flex flex-col items-center rounded-xl border py-1.5 transition ${
              activeDay === i
                ? 'border-moss-dark bg-moss-dark text-white shadow-soft'
                : 'border-black/10 bg-white text-ink'
            }`}
          >
            <span className="text-[8px] font-bold uppercase tracking-wide opacity-70">
              {d.chip.includes(',') ? d.chip.split(',')[0] : 'Day'}
            </span>
            <span className="text-[14px] font-extrabold leading-tight">{d.chip.includes(',') ? d.chip.split(' ')[1] : i + 1}</span>
          </button>
        ))}
      </div>

      <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4">
          <p className="mb-3 font-display text-sm font-extrabold text-ink">
            {day.label === `Day ${activeDay + 1}` ? day.label : `Day ${activeDay + 1} · ${day.label}`}
            {multiCity && cityForDay[activeDay] && (
              <span className="ml-2 rounded-full bg-sky/25 px-2 py-0.5 text-[10px] font-extrabold text-[#3d6d7c]">
                {cityForDay[activeDay]}
              </span>
            )}
          </p>

          {day.items.length === 0 ? (
            <p className="py-4 text-center text-[13px] font-semibold text-ink-soft">Nothing on this day yet.</p>
          ) : (
            <div className="relative space-y-3.5 pl-5">
              <div className="absolute bottom-2 left-[8px] top-2 w-0.5 bg-sage" />
              {day.items.map((item, idx) => {
                const place = byId(item.placeId)
                if (!place) return null
                return (
                  <div key={`${item.placeId}-${idx}`} className="relative">
                    <span
                      className="absolute -left-5 top-2 rounded-full border-2 border-moss-dark bg-white"
                      style={{ width: 16, height: 16 }}
                    />
                    <div className="flex items-start gap-2.5 rounded-2xl bg-sage-light/40 p-2.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-soft">
                        {place.image}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="flex items-center gap-1 text-[11px] font-extrabold text-moss-dark">
                          <Clock size={10} /> {item.time}
                        </span>
                        <p className="text-[14px] font-bold leading-tight text-ink">{place.name}</p>
                        {item.note && <p className="mt-0.5 text-[11px] text-ink-soft">{item.note}</p>}
                      </div>
                      {place.recommender?.name === 'You' ? (
                        <span className="shrink-0 rounded-full bg-sun/40 px-2 py-0.5 text-[9px] font-extrabold text-[#9c6a12]">
                          Yours
                        </span>
                      ) : place.source === 'traveller' ? (
                        <span className="shrink-0 rounded-full bg-blush/60 px-2 py-0.5 text-[9px] font-extrabold text-[#9c5a72]">
                          Local pick
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!readOnly && (
            <button
              onClick={() => onOpenSheet('places')}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-moss-dark/40 py-2.5 text-[13px] font-bold text-moss-dark transition hover:bg-sage-light/50"
            >
              <Plus size={14} /> Add to Day {activeDay + 1}
            </button>
          )}
        </Card>
      </motion.div>

      {!readOnly && (
        <button
          onClick={() => onOpenSheet('suggestions')}
          className="mt-3 flex w-full items-center gap-3 rounded-3xl border border-black/[0.06] bg-white/80 p-3 text-left shadow-soft transition hover:shadow-pop"
        >
          <Pet emotion="happy" size={40} bob={false} />
          <p className="flex-1 text-[13px] leading-snug text-ink">
            “Want a head start? I drafted three versions of this trip — you can take one and change anything.”
          </p>
        </button>
      )}
    </div>
  )
}

function Empty({
  cover,
  title,
  body,
  cta,
  onClick,
  secondary,
}: {
  cover: string
  title: string
  body: string
  cta: string
  onClick: () => void
  secondary?: { label: string; onClick: () => void }
}) {
  return (
    <div className="pt-6 text-center">
      <p className="text-5xl">{cover}</p>
      <h1 className="mt-3 font-display text-xl font-extrabold text-ink">{title}</h1>
      <p className="mx-auto mt-1 max-w-[28ch] text-[13px] leading-snug text-ink-soft">{body}</p>
      <button
        onClick={onClick}
        className="mt-4 rounded-full bg-moss-dark px-6 py-3 text-[14px] font-extrabold text-white shadow-soft"
      >
        {cta}
      </button>
      {secondary && (
        <button
          onClick={secondary.onClick}
          className="mt-3 block w-full text-[13px] font-bold text-moss-dark underline decoration-dotted underline-offset-4"
        >
          {secondary.label}
        </button>
      )}
    </div>
  )
}

function QuickChip({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 rounded-2xl border border-black/10 bg-white px-1 py-2.5 text-[11px] font-bold text-ink transition hover:border-moss-dark hover:text-moss-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark disabled:opacity-35 disabled:hover:border-black/10"
    >
      <Icon size={15} className="text-moss-dark" />
      <span className="w-full truncate text-center">{label}</span>
    </button>
  )
}
