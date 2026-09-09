import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Wallet, Users } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { originalItinerary, placeById, travelers, tripPlans } from '../data/mockData'
import type { ScreenProps } from './types'

const budgetBreakdown = [
  { label: 'Flights', pct: 30, color: '#8ec5d6' },
  { label: 'Accommodation', pct: 26, color: '#e7cbd7' },
  { label: 'Food', pct: 20, color: '#f6c945' },
  { label: 'Activities', pct: 16, color: '#adc485' },
  { label: 'Transport', pct: 8, color: '#d9a9bd' },
]

export default function Itinerary({ onNext }: ScreenProps) {
  const [activeDay, setActiveDay] = useState(0)
  const plan = tripPlans.find((p) => p.id === 'balanced')!
  const day = originalItinerary[activeDay]

  return (
    <div className="mx-auto max-w-6xl">
      <SectionLabel
        eyebrow="Step 5 · Before the trip"
        title="Final Itinerary — “Guangzhou 2026”"
        subtitle="Flights, hotel, restaurants, attractions and transport, organized into one shared timeline the whole group can see."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {originalItinerary.map((d, i) => (
              <button
                key={d.day}
                onClick={() => setActiveDay(i)}
                className={`flex shrink-0 flex-col items-center rounded-2xl border px-4 py-2 transition ${
                  activeDay === i ? 'border-moss-dark bg-moss-dark text-white shadow-soft' : 'border-black/10 bg-white text-ink hover:border-moss/40'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">Day {d.day}</span>
                <span className="text-sm font-extrabold">{d.date.split(', ')[1]}</span>
              </button>
            ))}
          </div>

          <motion.div key={activeDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-5">
              <p className="mb-4 font-display text-base font-extrabold text-ink">
                Day {day.day} · {day.label}
              </p>
              <div className="relative space-y-5 pl-6">
                <div className="absolute bottom-2 left-[9px] top-2 w-0.5 bg-sage" />
                {day.items.map((item, idx) => {
                  const place = placeById(item.placeId)
                  return (
                    <div key={idx} className="relative">
                      <span className="absolute -left-6 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-moss-dark bg-white" style={{ width: 18, height: 18 }} />
                      <div className="flex items-start gap-3 rounded-2xl bg-sage-light/40 p-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-soft">{place.image}</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-extrabold text-moss-dark">
                              <Clock size={11} /> {item.time}
                            </span>
                            <p className="font-bold text-ink">{place.name}</p>
                          </div>
                          {item.note && <p className="mt-0.5 text-xs text-ink-soft">{item.note}</p>}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {place.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-moss-dark">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <Users size={13} /> Travellers
            </p>
            <div className="flex flex-wrap gap-2">
              {travelers.map((t) => (
                <span key={t.id} className="flex h-8 w-8 items-center justify-center rounded-full text-base" style={{ backgroundColor: `${t.color}55` }} title={t.name}>
                  {t.emoji}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <Wallet size={13} /> Budget breakdown
            </p>
            <p className="mb-3 font-display text-xl font-extrabold text-moss-dark">RM{plan.cost.toLocaleString()} <span className="text-xs font-bold text-ink-soft">/ person</span></p>
            <div className="mb-3 flex h-3 overflow-hidden rounded-full">
              {budgetBreakdown.map((b) => (
                <div key={b.label} style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
              ))}
            </div>
            <div className="space-y-1.5">
              {budgetBreakdown.map((b) => (
                <div key={b.label} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-ink-soft">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} /> {b.label}
                  </span>
                  <span className="font-bold text-ink">{b.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <MapPin size={13} /> Saved places on this trip
            </p>
            <Pill tone="blush">8 places saved · 6 days planned</Pill>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext}>
          Start the trip → see it adapt live
        </Button>
      </div>
    </div>
  )
}
