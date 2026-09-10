import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlaneTakeoff, Clock, ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import type { ScreenProps } from './types'

const before = [
  { time: '10:00', label: 'Free morning — hotel checkout' },
  { time: '12:00', label: 'Last-minute souvenirs @ Canton Tower' },
  { time: '15:00', label: 'Head to Baiyun Airport' },
  { time: '18:00', label: 'Flight CZ3456 departs' },
]

const after = [
  { time: '10:00', label: 'Free morning — hotel checkout' },
  { time: '12:00', label: 'Last-minute souvenirs @ Canton Tower' },
  { time: '18:30', label: '🍜 Bonus: one more round at Ah Po’s Noodle House', bonus: true },
  { time: '20:00', label: 'Head to Baiyun Airport' },
  { time: '23:00', label: 'Flight CZ3456 departs (delayed)' },
]

export default function FlightDelay({ onNext }: ScreenProps) {
  const [applied, setApplied] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      <SectionLabel
        title="Unexpected Disruption — Flight Delay"
        subtitle="Not every disruption is weather. TripSync reacts the same way to flight delays, closures or transport issues — minimizing missed activities, extra cost, and backtracking."
      />

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between bg-blush/30 px-5 py-3">
          <p className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <PlaneTakeoff size={15} /> Flight CZ3456 · CAN → KUL
          </p>
          <Pill tone="blush">Live update</Pill>
        </div>
        <div className="flex items-center justify-center gap-5 px-5 py-6">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase text-ink-soft">Original</p>
            <p className="font-display text-2xl font-extrabold text-ink line-through decoration-2 opacity-50">18:00</p>
          </div>
          <ArrowRight className="text-blush-dark" />
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase text-ink-soft">Delayed</p>
            <p className="font-display text-2xl font-extrabold text-[#c85a4a]">23:00</p>
          </div>
          <Pill tone="blush">+5 hours</Pill>
        </div>
      </Card>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 flex items-start gap-3">
        <Pet emotion={applied ? 'happy' : 'scared'} size={64} bob={false} />
        <Card className="flex-1 p-4">
          <AnimatePresence mode="wait">
            {!applied ? (
              <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[15px] leading-relaxed text-ink">
                  “Your return flight just got delayed 5 hours! 😨 Good news — that's more free time, not less. I can
                  shift your airport transfer later and squeeze in one more visit to that noodle place everyone loved,
                  without touching anything else in your plan. Want me to update Day 6?”
                </p>
                <div className="mt-4">
                  <Button onClick={() => setApplied(true)}>
                    <Check size={15} /> Update Day 6
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[15px] font-semibold text-ink">
                “Done! No missed activities, no extra cost, and one bonus bowl of noodles. Safe travels! ✈️💛”
              </motion.p>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TimelineCard title="Before" items={before} muted={applied} />
        <TimelineCard title="After" items={applied ? after : before.map((b) => ({ ...b }))} highlightBonus={applied} />
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
          <ShieldCheck size={14} className="text-moss-dark" /> Goal minimized: missed activities, added cost, backtracking
        </p>
        <Button size="lg" onClick={onNext} disabled={!applied}>
          Next: Settle group expenses →
        </Button>
      </div>
    </div>
  )
}

function TimelineCard({
  title,
  items,
  muted,
  highlightBonus,
}: {
  title: string
  items: { time: string; label: string; bonus?: boolean }[]
  muted?: boolean
  highlightBonus?: boolean
}) {
  return (
    <Card className={`p-4 transition ${muted ? 'opacity-50' : ''}`}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-soft">{title} · Day 6</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold ${
              item.bonus && highlightBonus ? 'bg-sun/20 text-[#9c6a12]' : 'bg-sage-light/40 text-ink'
            }`}
          >
            <span className="flex shrink-0 items-center gap-1 font-extrabold text-moss-dark">
              <Clock size={10} /> {item.time}
            </span>
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
