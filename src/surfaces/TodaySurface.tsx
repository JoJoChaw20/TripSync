import { motion } from 'framer-motion'
import { Clock, Cloud, CloudRain, Gamepad2, PlaneTakeoff, Sun, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { placeById, trips } from '../data/mockData'
import { fromMin } from '../engine/buildPlan'
import type { Disruption, PlanDay, ReplanResult } from '../engine/types'
import type { SheetId } from '../navigation'

const forecast = [
  { h: '9AM', icon: Sun, tone: 'text-sun-dark' },
  { h: '12PM', icon: Sun, tone: 'text-sun-dark' },
  { h: '3PM', icon: CloudRain, tone: 'text-sky', alert: true },
  { h: '6PM', icon: CloudRain, tone: 'text-sky' },
  { h: '9PM', icon: Cloud, tone: 'text-ink-soft' },
]

/**
 * Today is the live surface. Alerts land here as banners and the repair
 * opens as a sheet over it — the itinerary never disappears behind a page.
 */
export default function TodaySurface({
  tripId,
  plan,
  rain,
  storm,
  onOpenSheet,
  repair,
}: {
  tripId: string
  plan: PlanDay[]
  rain: Disruption
  storm: Disruption
  onOpenSheet: (id: SheetId, disruption?: Disruption) => void
  repair: ReplanResult | null
}) {
  const disruption = rain
  const trip = trips.find((t) => t.id === tripId)!
  const repairApplied = repair !== null
  const today = plan.find((d) => d.day === disruption.day) ?? plan[0]

  if (trip.status !== 'live') {
    return (
      <div className="pt-6 text-center">
        <p className="text-5xl">🗓️</p>
        <h1 className="mt-3 font-display text-xl font-extrabold text-ink">Not on this trip yet</h1>
        <p className="mx-auto mt-1 max-w-[26ch] text-[13px] leading-snug text-ink-soft">
          Mochi watches the weather and your bookings once {trip.name} starts.
        </p>
        <button
          onClick={() => onOpenSheet('trips')}
          className="mt-4 rounded-full bg-moss-dark px-6 py-3 text-[14px] font-extrabold text-white shadow-soft"
        >
          Switch to a live trip
        </button>
      </div>
    )
  }
  const items = today.items.map((i) => ({
    time: fromMin(i.startMin),
    placeId: i.placeId,
    note: i.note,
  }))

  return (
    <div className="pb-2">
      <div className="mb-3">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-moss-dark">
          Day {today.day} of {plan.length} · live
        </p>
        <h1 className="font-display text-xl font-extrabold text-ink">{today.city}</h1>
      </div>

      <Card className="mb-3 overflow-hidden p-0">
        <div className="flex items-center justify-between px-4 py-3">
          {forecast.map((f) => (
            <div key={f.h} className={`flex flex-col items-center gap-1 ${f.alert ? 'scale-110' : ''}`}>
              <f.icon size={f.alert ? 22 : 17} className={f.tone} />
              <span className={`text-[10px] font-bold ${f.alert ? 'text-sky' : 'text-ink-soft'}`}>{f.h}</span>
            </div>
          ))}
        </div>
      </Card>

      {!repairApplied ? (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onOpenSheet('repair', rain)}
          className="mb-3 flex w-full items-start gap-3 rounded-3xl border border-coral/40 bg-coral/10 p-3 text-left shadow-soft transition hover:shadow-pop"
        >
          <Pet emotion="aggrieved" size={46} bob={false} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] leading-snug text-ink">
              “Heavy rain from 3 PM 🌧️ — <span className="font-extrabold">Liwan Lake Park</span> won't work today.
              I found a way to keep it. Want to see?”
            </p>
            <span className="mt-1.5 inline-block rounded-full bg-coral px-3 py-1 text-[11px] font-extrabold text-white">
              See what I'd do →
            </span>
          </div>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex items-start gap-3 rounded-3xl border border-moss-dark/30 bg-sage-light/60 p-3"
        >
          <Pet emotion="happy" size={46} bob={false} />
          <p className="flex-1 text-[13px] leading-snug text-ink">“{repair?.reason}”</p>
        </motion.div>
      )}

      {/* looking ahead: the one we cannot fully rescue */}
      <button
        onClick={() => onOpenSheet('repair', storm)}
        className="mb-3 flex w-full items-start gap-3 rounded-3xl border border-sun-dark/40 bg-sun/10 p-3 text-left shadow-soft transition hover:shadow-pop"
      >
        <Pet emotion="sad" size={46} bob={false} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-ink">
            “Looking ahead — <span className="font-extrabold">storm all day Sunday</span>, your last day. I can't
            move everything this time. Want to see what I'd do?”
          </p>
          <span className="mt-1.5 inline-block rounded-full bg-sun-dark px-3 py-1 text-[11px] font-extrabold text-white">
            Sunday · see what I'd do →
          </span>
        </div>
      </button>

      <Card className="p-4">
        <p className="mb-3 font-display text-sm font-extrabold text-ink">Today's schedule</p>
        <div className="relative space-y-3.5 pl-5">
          <div className="absolute bottom-2 left-[8px] top-2 w-0.5 bg-sage" />
          {items.map((item, idx) => {
            const place = placeById(item.placeId)
            const moved = repair?.moves.some((m) => m.placeId === item.placeId) ?? false
            return (
              <motion.div key={`${item.placeId}-${idx}`} layout className="relative">
                <span
                  className={`absolute -left-5 top-2 rounded-full border-2 bg-white ${moved ? 'border-blush-dark' : 'border-moss-dark'}`}
                  style={{ width: 16, height: 16 }}
                />
                <div className={`flex items-start gap-2.5 rounded-2xl p-2.5 ${moved ? 'bg-blush/40' : 'bg-sage-light/40'}`}>
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
                  {moved && (
                    <span className="shrink-0 rounded-full bg-blush-dark px-2 py-0.5 text-[9px] font-extrabold text-white">
                      Swapped in
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <LiveChip icon={Gamepad2} label="Play a game" onClick={() => onOpenSheet('game')} />
        <LiveChip icon={Wallet} label="Expenses" onClick={() => onOpenSheet('budget')} />
        <LiveChip icon={PlaneTakeoff} label="Flight status" onClick={() => onOpenSheet('flight')} />
      </div>
    </div>
  )
}

function LiveChip({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl border border-black/10 bg-white px-1 py-2.5 text-[11px] font-bold text-ink transition hover:border-moss-dark hover:text-moss-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
    >
      <Icon size={15} className="text-moss-dark" />
      <span className="w-full truncate text-center">{label}</span>
    </button>
  )
}
