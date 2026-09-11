import { useState } from 'react'
import { CalendarRange, MapPin, MessageSquare, Plus, Trash2, Users, Wallet } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { travelers, type TripLeg, type TripSummary } from '../data/mockData'
import { dateRange, defaultStartISO, setTotalDays, toISODate, totalDays as sumDays } from '../lib/trip'

/** Only a hint for the flag and cover art. Any city the user types is fine. */
const KNOWN: Record<string, { flag: string; cover: string }> = {
  guangzhou: { flag: '🇨🇳', cover: '🗼' },
  shenzhen: { flag: '🇨🇳', cover: '🏙️' },
  'hong kong': { flag: '🇭🇰', cover: '🌆' },
  macau: { flag: '🇲🇴', cover: '🎰' },
  penang: { flag: '🇲🇾', cover: '🦞' },
  'george town': { flag: '🇲🇾', cover: '🦞' },
  'kuala lumpur': { flag: '🇲🇾', cover: '🏙️' },
  bangkok: { flag: '🇹🇭', cover: '🍲' },
  'chiang mai': { flag: '🇹🇭', cover: '🏞️' },
  'ho chi minh city': { flag: '🇻🇳', cover: '🛵' },
  hanoi: { flag: '🇻🇳', cover: '🍜' },
  'da nang': { flag: '🇻🇳', cover: '🏖️' },
  singapore: { flag: '🇸🇬', cover: '🌴' },
  bali: { flag: '🇮🇩', cover: '🏝️' },
  jakarta: { flag: '🇮🇩', cover: '🏙️' },
  seoul: { flag: '🇰🇷', cover: '🏯' },
  busan: { flag: '🇰🇷', cover: '🌊' },
  tokyo: { flag: '🇯🇵', cover: '🗾' },
  osaka: { flag: '🇯🇵', cover: '🍢' },
  taipei: { flag: '🇹🇼', cover: '🧋' },
  manila: { flag: '🇵🇭', cover: '🌺' },
}

const SUGGESTIONS = ['Penang', 'Bangkok', 'Da Nang', 'Seoul', 'Taipei', 'Bali']

function lookup(city: string) {
  return KNOWN[city.trim().toLowerCase()] ?? { flag: '🌏', cover: '📍' }
}

/**
 * Type any city. Everything here is optional except the first destination,
 * and all of it stays editable in Trip settings afterwards.
 */
export default function CreateTrip({ onCreate }: { onCreate: (trip: TripSummary) => void }) {
  const [draft, setDraft] = useState('')
  const [legs, setLegs] = useState<TripLeg[]>([])
  const [people, setPeople] = useState(2)
  const [budget, setBudget] = useState(1200)
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  // Pre-filled so the field is never empty, but it is the user's to change.
  const [start, setStart] = useState(defaultStartISO())

  const total = sumDays(legs)

  function addCity(city: string) {
    const clean = city.trim()
    if (!clean || legs.some((l) => l.city.toLowerCase() === clean.toLowerCase())) return
    setLegs((ls) => [...ls, { city: clean, ...lookup(clean), days: 3 } as TripLeg])
    setDraft('')
  }

  function setDays(i: number, days: number) {
    setLegs((ls) => ls.map((l, n) => (n === i ? { ...l, days: Math.max(1, Math.min(30, days)) } : l)))
  }

  function submit() {
    if (legs.length === 0) return
    const first = lookup(legs[0].city)
    onCreate({
      id: 'trip-' + Date.now(),
      name: name.trim() || legs.map((l) => l.city).join(' + '),
      flag: legs[0].flag ?? first.flag,
      destination: legs.map((l) => l.city).join(' → '),
      dates: dateRange(total, start),
      startDate: start,
      days: total,
      legs,
      travelerCount: people,
      status: 'planning',
      budget,
      cover: first.cover,
      highlight: notes.trim() || 'Nothing saved yet',
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="pb-2">
      <div className="mb-4 flex items-start gap-3">
        <Pet emotion="happy" size={50} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “Just tell me where. Everything else you can skip now and change later.”
          </p>
        </Card>
      </div>

      <Field icon={MapPin} label="Where to" required>
        <div className="flex items-center gap-2 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2 focus-within:border-moss-dark">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCity(draft)
              }
            }}
            placeholder="Type any city…"
            aria-label="Add a city"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/70"
          />
          {draft.trim() && (
            <button
              onClick={() => addCity(draft)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-moss-dark px-3 py-1.5 text-[12px] font-extrabold text-white"
            >
              <Plus size={12} /> Add
            </button>
          )}
        </div>

        {legs.length === 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((c) => (
              <button
                key={c}
                onClick={() => addCity(c)}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12px] font-bold text-ink-soft transition hover:border-moss-dark hover:text-moss-dark"
              >
                {lookup(c).flag} {c}
              </button>
            ))}
          </div>
        )}

        {legs.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {legs.map((leg, i) => (
              <Card key={leg.city} className="flex items-center gap-2 p-2.5">
                <span className="text-lg">{leg.flag}</span>
                <p className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-ink">{leg.city}</p>
                <Stepper value={leg.days} onChange={(v) => setDays(i, v)} />
                <span className="w-7 shrink-0 text-[10px] font-bold text-ink-soft">days</span>
                <button
                  onClick={() => setLegs((ls) => ls.filter((_, n) => n !== i))}
                  aria-label={`Remove ${leg.city}`}
                  className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:bg-black/5 hover:text-coral"
                >
                  <Trash2 size={13} />
                </button>
              </Card>
            ))}
          </div>
        )}
      </Field>

      {legs.length > 0 && (
        <Field icon={CalendarRange} label="When">
          <label className="mb-2 flex items-center gap-3 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2.5 focus-within:border-moss-dark">
            <span className="shrink-0 text-[12px] font-extrabold text-ink-soft">Starts</span>
            <input
              type="date"
              value={start}
              min={toISODate(new Date())}
              onChange={(e) => setStart(e.target.value || defaultStartISO())}
              aria-label="First day of the trip"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-extrabold text-ink outline-none"
            />
          </label>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2.5">
            <Stepper value={total} onChange={(v) => setLegs((ls) => setTotalDays(ls, v))} />
            <div className="min-w-0">
              <p className="font-display text-lg font-extrabold leading-none text-moss-dark">{total} days</p>
              <p className="mt-0.5 truncate text-[11px] font-semibold text-ink-soft">{dateRange(total, start)}</p>
            </div>
          </div>
          {legs.length > 1 && (
            <p className="mt-1.5 pl-1 text-[11px] font-semibold text-ink-soft">
              {legs.map((l) => `${l.city} ${l.days}d`).join(' · ')} — adjust each city above
            </p>
          )}
        </Field>
      )}

      <Field icon={Users} label="Who's coming">
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
      </Field>

      <Field icon={Wallet} label="Budget per person">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-extrabold text-ink-soft">RM</span>
          <input
            type="number"
            min={0}
            step={50}
            value={budget}
            onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
            aria-label="Budget per person in ringgit"
            className="w-28 rounded-xl border-2 border-black/10 bg-white px-2.5 py-1.5 text-[14px] font-extrabold text-ink outline-none focus:border-moss-dark"
          />
          <input
            type="range"
            min={200}
            max={6000}
            step={100}
            value={Math.min(6000, budget)}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Budget slider"
            className="min-w-0 flex-1 accent-[#8ba863]"
          />
        </div>
      </Field>

      <Field icon={MessageSquare} label="Anything Mochi should know">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. mostly food, hate early mornings, my mum is coming so nothing with lots of stairs"
          className="w-full resize-none rounded-2xl border-2 border-black/10 bg-white px-3 py-2.5 text-[13px] font-semibold leading-snug text-ink outline-none focus:border-moss-dark placeholder:font-normal placeholder:text-ink-soft/70"
        />
        <p className="mt-1 pl-1 text-[11px] font-semibold text-ink-soft">
          This is what the suggestions are built from. You can change it any time.
        </p>
      </Field>

      <Field icon={MapPin} label="Trip name (optional)">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={legs.map((l) => l.city).join(' + ') || 'My trip'}
          className="w-full rounded-2xl border-2 border-black/10 bg-white px-3 py-2.5 text-[14px] font-semibold text-ink outline-none focus:border-moss-dark"
        />
      </Field>

      <Button size="lg" className="w-full" onClick={submit} disabled={legs.length === 0}>
        {legs.length === 0 ? 'Add a city to continue' : `Create ${total}-day trip`}
      </Button>
    </div>
  )
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-sage-light px-1 py-0.5">
      <button
        onClick={() => onChange(value - 1)}
        aria-label="One day fewer"
        className="h-6 w-6 rounded-full text-[15px] font-extrabold text-moss-dark transition hover:bg-white"
      >
        −
      </button>
      <input
        value={value}
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 1)}
        aria-label="Days in this city"
        className="w-6 bg-transparent text-center text-[13px] font-extrabold text-ink outline-none"
      />
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

function Field({
  icon: Icon,
  label,
  required,
  children,
}: {
  icon: typeof MapPin
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
        <Icon size={12} /> {label}
        {!required && <span className="font-bold normal-case tracking-normal opacity-70">· optional</span>}
      </p>
      {children}
    </div>
  )
}
