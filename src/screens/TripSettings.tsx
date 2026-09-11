import { useState } from 'react'
import { BedDouble, CalendarRange, MapPin, PlaneTakeoff, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { cityCentre, places, travelers, type TripLeg, type TripSummary } from '../data/mockData'
import { dateRange, setTotalDays, totalDays as sumDays } from '../lib/trip'

const CITIES = [
  { city: 'Guangzhou', flag: '🇨🇳' },
  { city: 'Shenzhen', flag: '🇨🇳' },
  { city: 'Hong Kong', flag: '🇭🇰' },
  { city: 'Macau', flag: '🇲🇴' },
  { city: 'Penang', flag: '🇲🇾' },
  { city: 'Bangkok', flag: '🇹🇭' },
  { city: 'Da Nang', flag: '🇻🇳' },
  { city: 'Seoul', flag: '🇰🇷' },
]

/**
 * Everything the user typed stays editable, from where it's shown.
 * A spreadsheet never says no; neither should this.
 */
export default function TripSettings({
  trip,
  onSave,
  onClose,
}: {
  trip: TripSummary
  onSave: (patch: Partial<TripSummary>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(trip.name)
  const [budget, setBudget] = useState(trip.budget)
  const [people, setPeople] = useState(trip.travelerCount)
  const [legs, setLegs] = useState<TripLeg[]>(trip.legs)
  const [adding, setAdding] = useState(false)
  const [arrive, setArrive] = useState(trip.arrive)
  const [depart, setDepart] = useState(trip.depart)

  const total = sumDays(legs)

  function setStayName(i: number, name: string) {
    setLegs((ls) =>
      ls.map((l, n) => {
        if (n !== i) return l
        if (!name.trim()) return { ...l, stay: undefined }
        const base = l.stay ?? { ...cityCentre(l.city), checkIn: 900, checkOut: 720 }
        return { ...l, stay: { ...base, name } }
      }),
    )
  }

  /** No geocoder, so anchor the hotel to a place we already know the spot of. */
  function setStayNear(i: number, placeId?: string) {
    setLegs((ls) =>
      ls.map((l, n) => {
        if (n !== i || !l.stay) return l
        const pin = placeId ? places.find((pl) => pl.id === placeId) : undefined
        const at = pin ? { lat: pin.lat, lng: pin.lng } : cityCentre(l.city)
        return { ...l, stay: { ...l.stay, ...at, near: placeId } }
      }),
    )
  }

  function setLegDays(i: number, days: number) {
    setLegs((ls) => ls.map((l, n) => (n === i ? { ...l, days: Math.max(1, days) } : l)))
  }

  function save() {
    onSave({
      name: name.trim() || trip.name,
      budget,
      travelerCount: people,
      legs,
      days: total,
      arrive,
      depart,
      // Dates follow the length — they used to keep whatever they were created with.
      dates: dateRange(total),
      flag: legs[0].flag,
      destination: legs.map((l) => l.city).join(' → '),
    })
    onClose()
  }

  return (
    <div className="pb-2">
      <Section icon={CalendarRange} label="How long">
        <div className="flex items-center gap-3 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2.5">
          <Stepper value={total} onChange={(v) => setLegs((ls) => setTotalDays(ls, v))} />
          <div className="min-w-0">
            <p className="font-display text-lg font-extrabold leading-none text-moss-dark">{total} days</p>
            <p className="mt-0.5 truncate text-[11px] font-semibold text-ink-soft">{dateRange(total)}</p>
          </div>
        </div>
        {legs.length > 1 && (
          <p className="mt-1.5 pl-1 text-[11px] font-semibold text-ink-soft">
            {legs.map((l) => `${l.city} ${l.days}d`).join(' · ')} — adjust each city below
          </p>
        )}
      </Section>

      <Section icon={MapPin} label={legs.length > 1 ? `Cities · ${legs.length} stops` : 'City'}>
        <div className="flex flex-col gap-2">
          {legs.map((leg, i) => (
            <Card key={`${leg.city}-${i}`} className="p-2.5">
              <div className="flex items-center gap-2">
              <span className="text-lg">{leg.flag}</span>
              <p className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink">{leg.city}</p>
              <div className="flex shrink-0 items-center gap-1">
                <Stepper value={leg.days} onChange={(v) => setLegDays(i, v)} />
                <span className="w-8 text-[10px] font-bold text-ink-soft">days</span>
              </div>
              {legs.length > 1 && (
                <button
                  onClick={() => setLegs((ls) => ls.filter((_, n) => n !== i))}
                  aria-label={`Remove ${leg.city}`}
                  className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:bg-black/5 hover:text-coral"
                >
                  <Trash2 size={13} />
                </button>
              )}
              </div>

              {/* Where you sleep decides where every day starts. */}
              <div className="mt-2 border-t border-black/[0.06] pt-2">
                <label className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">
                  <BedDouble size={11} /> Where you're staying
                </label>
                <input
                  value={leg.stay?.name ?? ''}
                  onChange={(e) => setStayName(i, e.target.value)}
                  placeholder="Hotel or area — optional"
                  className="w-full rounded-xl border-2 border-black/10 bg-white px-2.5 py-1.5 text-[13px] font-semibold text-ink outline-none focus:border-moss-dark"
                />
                {leg.stay && (
                  <>
                    <p className="mb-1 mt-1.5 text-[10px] font-bold text-ink-soft">Nearest to</p>
                    <div className="flex flex-wrap gap-1">
                      <NearChip
                        label="City centre"
                        active={!leg.stay.near}
                        onClick={() => setStayNear(i, undefined)}
                      />
                      {places
                        .filter((pl) => pl.city === leg.city)
                        .slice(0, 5)
                        .map((pl) => (
                          <NearChip
                            key={pl.id}
                            label={`${pl.image} ${pl.name}`}
                            active={leg.stay?.near === pl.id}
                            onClick={() => setStayNear(i, pl.id)}
                          />
                        ))}
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {adding ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CITIES.filter((c) => !legs.some((l) => l.city === c.city)).map((c) => (
              <button
                key={c.city}
                onClick={() => {
                  setLegs((ls) => [...ls, { city: c.city, flag: c.flag, days: 2 }])
                  setAdding(false)
                }}
                className="rounded-2xl border-2 border-black/10 bg-white px-3 py-2 text-left text-[13px] font-extrabold text-ink transition hover:border-moss-dark"
              >
                {c.flag} {c.city}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-moss-dark/40 py-2.5 text-[13px] font-bold text-moss-dark transition hover:bg-sage-light/50"
          >
            <Plus size={14} /> Add another city
          </button>
        )}
      </Section>

      <Section icon={PlaneTakeoff} label="Flights">
        <div className="grid grid-cols-2 gap-2">
          <TimeField label="Land" value={arrive} onChange={setArrive} />
          <TimeField label="Fly home" value={depart} onChange={setDepart} />
        </div>
        <p className="mt-1.5 pl-1 text-[11px] font-semibold text-ink-soft">
          Day one starts after you land; the last day ends in time for check-in.
        </p>
      </Section>

      <Section icon={Users} label="Travellers">
        <div className="flex items-center gap-2">
          {travelers.slice(0, 4).map((t, i) => (
            <button
              key={t.id}
              onClick={() => setPeople(i + 1)}
              title={t.name}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                i < people ? 'ring-2 ring-moss-dark' : 'opacity-35'
              }`}
              style={{ backgroundColor: `${t.color}66` }}
            >
              {t.emoji}
            </button>
          ))}
          <span className="ml-1 text-[12px] font-bold text-ink-soft">{people} travelling</span>
        </div>
      </Section>

      <Section icon={Wallet} label="Budget per person">
        <input
          type="range"
          min={300}
          max={5000}
          step={100}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Budget per person in ringgit"
          className="w-full accent-[#8ba863]"
        />
        <p className="mt-1 font-display text-xl font-extrabold text-moss-dark">RM{budget.toLocaleString()}</p>
      </Section>

      <Section icon={MapPin} label="Trip name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-2xl border-2 border-black/10 bg-white px-3 py-2.5 text-[14px] font-semibold text-ink outline-none focus:border-moss-dark"
        />
      </Section>

      <Button size="lg" className="mt-2 w-full" onClick={save}>
        Save changes
      </Button>
    </div>
  )
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-sage-light px-1 py-0.5">
      <button
        onClick={() => onChange(value - 1)}
        aria-label="One day fewer"
        className="h-6 w-6 rounded-full text-[15px] font-extrabold text-moss-dark transition hover:bg-white"
      >
        −
      </button>
      <span className="w-4 text-center text-[13px] font-extrabold text-ink">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="One day more"
        className="h-6 w-6 rounded-full text-[15px] font-extrabold text-moss-dark transition hover:bg-white"
      >
        +
      </button>
    </span>
  )
}

function Section({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
        <Icon size={12} /> {label}
      </p>
      {children}
    </div>
  )
}

function NearChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`max-w-[46%] truncate rounded-full px-2 py-1 text-[10px] font-bold transition ${
        active ? 'bg-moss-dark text-white' : 'bg-sage-light text-moss-dark'
      }`}
    >
      {label}
    </button>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number
  onChange: (v: number | undefined) => void
}) {
  const text = value === undefined ? '' : `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
  return (
    <label className="flex flex-col gap-1">
      <span className="pl-0.5 text-[10px] font-bold text-ink-soft">{label}</span>
      <input
        type="time"
        value={text}
        onChange={(e) => {
          const v = e.target.value
          if (!v) return onChange(undefined)
          onChange(Number(v.slice(0, 2)) * 60 + Number(v.slice(3, 5)))
        }}
        className="rounded-xl border-2 border-black/10 bg-white px-2.5 py-2 text-[13px] font-extrabold text-ink outline-none focus:border-moss-dark"
      />
    </label>
  )
}
