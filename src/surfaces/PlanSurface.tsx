import { useState } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import { AlertTriangle, Clock, GripVertical, Plus, Share2, Trash2, Users, Wand2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { travelers, type Place, type TripSummary } from '../data/mockData'
import { buildPlan, dayMeta, fromMin } from '../engine/buildPlan'
import { missingMeals } from '../engine/meals'
import { retimeDay, type RetimeWarning } from '../engine/replan'
import TripGrid from '../components/TripGrid'
import type { PlanDay } from '../engine/types'
import type { SheetId } from '../navigation'

/**
 * Plan is the itinerary. Preferences, discovery and sharing are drawers
 * off it, never destinations of their own.
 */
export default function PlanSurface({
  trip,
  savedPlaces,
  repairedPlan,
  pinned = {},
  preferAt = {},
  onMovePlace,
  onAddToDay,
  allPlaces,
  onRemovePlace,
  readOnly,
  onPlanChange,
  onOpenSheet,
}: {
  trip: TripSummary
  savedPlaces: Place[]
  repairedPlan?: PlanDay[] | null
  pinned?: Record<string, number>
  preferAt?: Record<string, number>
  onMovePlace: (id: string, day: number) => void
  onAddToDay: (id: string, day: number, at?: number) => void
  allPlaces: Place[]
  onRemovePlace: (id: string) => void
  readOnly: boolean
  onPlanChange: (plan: PlanDay[]) => void
  onOpenSheet: (id: SheetId, day?: number) => void
}) {
  const [activeDay, setActiveDay] = useState(trip.status === 'live' ? 1 : 0)
  const [view, setView] = useState<'day' | 'trip'>('day')
  const [warnings, setWarnings] = useState<RetimeWarning[]>([])

  const cityForDay: string[] = []
  trip.legs.forEach((leg) => {
    for (let i = 0; i < leg.days; i++) cityForDay.push(leg.city)
  })
  const multiCity = trip.legs.length > 1
  const byId = (id: string) => savedPlaces.find((p) => p.id === id)

  // Anything newly saved lands on the day the "Add to Day N" button promised,
  // and stays there.
  const built = buildPlan(trip, savedPlaces, pinned, repairedPlan, preferAt)
  const planDays = built.days
  const unplaced = built.unplaced

  const days = planDays.map((d, i) => ({
    ...dayMeta(trip, i),
    stay: d.stay,
    dayNote: d.note,
    endNote: d.endNote,
    earliest: d.earliest,
    latest: d.latest,
    items: d.items.map((it) => ({ time: fromMin(it.startMin), placeId: it.placeId, note: it.note })),
  }))

  const dayIndex = Math.min(activeDay, days.length - 1)
  const day = days[dayIndex]

  /** Dragging sets the order; the engine sets the clock. */
  function reorder(ids: string[]) {
    const { items, warnings: warn } = retimeDay(ids, byId)
    setWarnings(warn)
    onPlanChange(planDays.map((d, i) => (i === dayIndex ? { ...d, items } : d)))
  }

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

  if (trip.id !== 'gz2026' && savedPlaces.length === 0) {
    return (
      <Empty
        cover={trip.cover}
        title={trip.name}
        body={`${trip.days} days in ${trip.destination.split(',')[0]}, nothing scheduled yet. Start by saving a few places.`}
        cta={readOnly ? 'Back to my trips' : 'Add places'}
        onClick={() => onOpenSheet(readOnly ? 'trips' : 'places')}
        secondary={
          readOnly
            ? undefined
            : { label: 'Already planned elsewhere? Paste your list', onClick: () => onOpenSheet('import') }
        }
      />
    )
  }

  return (
    <div className="pb-2">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-xl font-extrabold text-ink">Your plan</h1>
          {/* whole-trip view: see the shape, the way a spreadsheet lets you */}
          <span className="flex rounded-full bg-black/[0.05] p-0.5">
            {(['day', 'trip'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold capitalize transition ${
                  view === v ? 'bg-white text-moss-dark shadow-soft' : 'text-ink-soft'
                }`}
              >
                {v}
              </button>
            ))}
          </span>
        </div>
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

      {!readOnly && !trip.legs.some((l) => l.stay) && (
        <button
          onClick={() => onOpenSheet('settings')}
          className="mb-3 flex w-full items-center gap-2 rounded-2xl border border-blush-dark/40 bg-blush/25 px-3 py-2 text-left"
        >
          <span className="text-base">🛏</span>
          <span className="min-w-0 flex-1 text-[12px] font-bold leading-snug text-[#9c5a72]">
            Booked somewhere to stay? Add it and your days will start from the right place.
          </span>
        </button>
      )}

      <div className="mb-3 grid grid-cols-4 gap-2">
        <QuickChip
          icon={Plus}
          label="Add place"
          disabled={readOnly}
          onClick={() => onOpenSheet('places', dayIndex + 1)}
        />
        <QuickChip icon={Wand2} label="Ideas" disabled={readOnly} onClick={() => onOpenSheet('suggestions')} />
        <QuickChip icon={Users} label="Group" onClick={() => onOpenSheet('group')} />
        <QuickChip icon={Share2} label="Share" onClick={() => onOpenSheet('share')} />
      </div>

      {view === 'trip' ? (
        <TripGrid
          trip={trip}
          days={planDays}
          places={savedPlaces}
          onOpenDay={(i) => {
            setActiveDay(i)
            setView('day')
          }}
        />
      ) : (
      <>
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

          {(day.dayNote || day.endNote || day.stay) && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
              {day.dayNote && (
                <span className="rounded-full bg-sky/25 px-2 py-0.5 text-[#3d6d7c]">
                  {day.dayNote} {fromMin(day.earliest ?? 480)}
                </span>
              )}
              {day.endNote && (
                <span className="rounded-full bg-sun/30 px-2 py-0.5 text-[#9c6a12]">
                  {day.endNote} {fromMin(day.latest ?? 1200)}
                </span>
              )}
              {day.stay && (
                <span className="rounded-full bg-blush/50 px-2 py-0.5 text-[#9c5a72]">🛏 {day.stay.name}</span>
              )}
            </div>
          )}

          {day.items.length === 0 ? (
            <p className="py-4 text-center text-[13px] font-semibold text-ink-soft">Nothing on this day yet.</p>
          ) : (
            <Reorder.Group
              axis="y"
              values={day.items.map((i) => i.placeId)}
              onReorder={reorder}
              className="relative flex list-none flex-col gap-3.5 pl-5"
            >
              <div className="absolute bottom-2 left-[8px] top-2 w-0.5 bg-sage" />
              {day.items.map((item) => {
                const place = byId(item.placeId)
                if (!place) return null
                const warning = warnings.find((w) => w.placeId === item.placeId)
                return (
                  <StopRow
                    key={item.placeId}
                    id={item.placeId}
                    time={item.time}
                    note={item.note}
                    place={place}
                    warning={warning?.message}
                    draggable={!readOnly}
                    dayCount={days.length}
                    currentDay={dayIndex + 1}
                    onMove={(d) => onMovePlace(item.placeId, d)}
                    onRemove={() => onRemovePlace(item.placeId)}
                  />
                )
              })}
            </Reorder.Group>
          )}

          {warnings.length > 0 && (
            <p className="mt-2 flex items-start gap-1.5 rounded-2xl bg-coral/10 px-2.5 py-2 text-[11px] font-semibold leading-snug text-[#a8452a]">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              {warnings[0].message}
            </p>
          )}

          {!readOnly && day.items.length > 1 && (
            <p className="mt-2 text-center text-[10px] font-bold text-ink-soft">
              Drag a stop to reorder — times re-flow around opening hours.
            </p>
          )}

          {!readOnly &&
            missingMeals(planDays[dayIndex], allPlaces, byId).map((m) => (
              <div key={m.meal} className="mt-2 rounded-2xl bg-sun/15 px-2.5 py-2">
                <p className="text-[11px] font-extrabold text-[#9c6a12]">
                  No {m.label.toLowerCase()} planned · {fromMin(m.from)}–{fromMin(m.to)}
                </p>
                {m.suggestions.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {m.suggestions.map((sug) => (
                      <button
                        key={sug.id}
                        onClick={() => onAddToDay(sug.id, dayIndex + 1, m.from)}
                        className="flex max-w-full items-center gap-1 truncate rounded-full bg-white px-2 py-1 text-[11px] font-bold text-ink shadow-soft transition hover:brightness-95"
                      >
                        {sug.image} {sug.name}
                        <span className="shrink-0 text-[10px] font-extrabold text-moss-dark">+</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

          {!readOnly && (
            <button
              onClick={() => onOpenSheet('places', dayIndex + 1)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-moss-dark/40 py-2.5 text-[13px] font-bold text-moss-dark transition hover:bg-sage-light/50"
            >
              <Plus size={14} /> Add to Day {dayIndex + 1}
            </button>
          )}
        </Card>
      </motion.div>

      </>
      )}

      {unplaced.length > 0 && (
        <Card className="mt-3 border-sun/50 p-3">
          <p className="mb-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#9c6a12]">
            Not scheduled yet · {unplaced.length}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unplaced.map((pl) => (
              <span key={pl.id} className="rounded-full bg-sun/20 px-2.5 py-1 text-[11px] font-bold text-[#9c6a12]">
                {pl.image} {pl.name}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-ink-soft">
            No day has room within their opening hours. Add a day, or drop something.
          </p>
        </Card>
      )}

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

/** One draggable stop. The handle is explicit so a tap still scrolls the page. */
function StopRow({
  id,
  time,
  note,
  place,
  warning,
  draggable,
  dayCount,
  currentDay,
  onMove,
  onRemove,
}: {
  id: string
  time: string
  note?: string
  place: Place
  warning?: string
  draggable: boolean
  dayCount: number
  currentDay: number
  onMove: (day: number) => void
  onRemove: () => void
}) {
  const controls = useDragControls()
  const [open, setOpen] = useState(false)
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className="relative list-none"
      whileDrag={{ scale: 1.03, zIndex: 20 }}
    >
      <span
        className={`absolute -left-5 top-2 rounded-full border-2 bg-white ${
          warning ? 'border-coral' : 'border-moss-dark'
        }`}
        style={{ width: 16, height: 16 }}
      />
      <div
        className={`flex items-start gap-2.5 rounded-2xl p-2.5 ${
          warning ? 'bg-coral/10' : 'bg-sage-light/40'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-soft">
          {place.image}
        </span>
        <button
          onClick={() => draggable && setOpen((v) => !v)}
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-moss-dark">
            <Clock size={10} /> {time}
          </span>
          <p className="text-[14px] font-bold leading-tight text-ink">{place.name}</p>
          {note && <p className="mt-0.5 text-[11px] text-ink-soft">{note}</p>}
        </button>
        {place.source === 'traveller' && !draggable && (
          <span className="shrink-0 rounded-full bg-blush/60 px-2 py-0.5 text-[9px] font-extrabold text-[#9c5a72]">
            Local pick
          </span>
        )}
        {draggable && (
          <button
            aria-label={`Reorder ${place.name}`}
            onPointerDown={(e) => controls.start(e)}
            className="-mr-1 shrink-0 cursor-grab touch-none rounded-lg p-1.5 text-ink-soft/60 transition hover:bg-black/5 hover:text-ink active:cursor-grabbing"
          >
            <GripVertical size={16} />
          </button>
        )}
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="overflow-hidden"
        >
          <div className="mt-1.5 rounded-2xl bg-white/80 p-2">
            <p className="mb-1.5 px-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">
              Move to day
            </p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  disabled={d === currentDay}
                  onClick={() => {
                    onMove(d)
                    setOpen(false)
                  }}
                  className={`h-7 w-7 rounded-lg text-[12px] font-extrabold transition ${
                    d === currentDay
                      ? 'bg-moss-dark text-white'
                      : 'bg-sage-light text-moss-dark hover:brightness-95'
                  }`}
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => {
                  onRemove()
                  setOpen(false)
                }}
                className="ml-auto flex items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-coral transition hover:bg-coral/10"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </Reorder.Item>
  )
}
