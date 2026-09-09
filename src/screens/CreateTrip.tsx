import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, CalendarRange, Wallet, Plus, Check } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { MochiNote } from '../components/MochiNote'
import { travelers, tripMeta } from '../data/mockData'
import type { ScreenProps } from './types'

function FlagCN() {
  return (
    <svg width="22" height="16" viewBox="0 0 30 20" className="shrink-0 rounded-sm shadow-sm">
      <rect width="30" height="20" fill="#DE2910" />
      <g fill="#FFDE00">
        <path d="M5 3 L6 6.5 L3 4.6 L7 4.6 L4 6.5 Z" />
        <path d="M10.5 1.5 L11 2.6 L12.2 2.6 L11.2 3.3 L11.6 4.4 L10.5 3.7 L9.4 4.4 L9.8 3.3 L8.8 2.6 L10 2.6 Z" />
        <path d="M13 4 L13.5 5.1 L14.7 5.1 L13.7 5.8 L14.1 6.9 L13 6.2 L11.9 6.9 L12.3 5.8 L11.3 5.1 L12.5 5.1 Z" />
        <path d="M13 8 L13.5 9.1 L14.7 9.1 L13.7 9.8 L14.1 10.9 L13 10.2 L11.9 10.9 L12.3 9.8 L11.3 9.1 L12.5 9.1 Z" />
        <path d="M10.5 11 L11 12.1 L12.2 12.1 L11.2 12.8 L11.6 13.9 L10.5 13.2 L9.4 13.9 L9.8 12.8 L8.8 12.1 L10 12.1 Z" />
      </g>
    </svg>
  )
}

export default function CreateTrip({ onNext, petEmotion, petMessage }: ScreenProps) {
  const [budget, setBudget] = useState(tripMeta.budgetPerPerson)
  const [created, setCreated] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      <SectionLabel
        eyebrow="Step 1 · Before the trip"
        title="Create your Smart Trip Workspace"
        subtitle="One dedicated page for destination, dates, travellers, budget, saved places, itinerary and expenses — instead of five different apps."
      />

      <MochiNote emotion={petEmotion} message={petMessage} />

      <Card className="p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <MapPin size={13} /> Destination
            </label>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-moss/30 bg-sage-light/40 px-4 py-3 font-bold text-ink">
              <FlagCN /> {tripMeta.destination}
            </div>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <CalendarRange size={13} /> Travel dates
            </label>
            <div className="rounded-2xl border-2 border-moss/30 bg-sage-light/40 px-4 py-3 font-bold text-ink">
              {tripMeta.dates}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-ink-soft">Travellers (4)</label>
          <div className="flex flex-wrap gap-2.5">
            {travelers.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white py-1.5 pl-1.5 pr-3 shadow-soft">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                  style={{ backgroundColor: `${t.color}55` }}
                >
                  {t.emoji}
                </span>
                <span className="text-sm font-bold text-ink">{t.name}</span>
              </div>
            ))}
            <button className="flex items-center gap-1.5 rounded-full border-2 border-dashed border-black/15 px-3 py-1.5 text-sm font-bold text-ink-soft hover:border-moss-dark hover:text-moss-dark">
              <Plus size={14} /> Invite
            </button>
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            <Wallet size={13} /> Budget per person
          </label>
          <div className="flex items-center gap-4 rounded-2xl border-2 border-moss/30 bg-sage-light/40 px-5 py-4">
            <input
              type="range"
              min={1000}
              max={3000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-moss/30 accent-[#8ba863]"
            />
            <span className="w-28 shrink-0 text-right font-display text-xl font-extrabold text-moss-dark">
              RM {budget.toLocaleString()}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-ink-soft">Drag to adjust — TripSync recalculates every plan &amp; recommendation live.</p>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          {!created ? (
            <Button size="lg" onClick={() => setCreated(true)}>
              <Plus size={17} /> Create Trip
            </Button>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3">
              <Pill tone="sage" className="py-1.5 text-sm">
                <Check size={14} /> “Guangzhou 2026” workspace created
              </Pill>
              <Button size="lg" onClick={onNext}>
                Next: Collect group preferences →
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  )
}
