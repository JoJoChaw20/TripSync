import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Sun, Cloud, Check, X } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import type { ScreenProps } from './types'

const hours = [
  { h: '9AM', icon: Sun, color: 'text-sun-dark' },
  { h: '12PM', icon: Sun, color: 'text-sun-dark' },
  { h: '3PM', icon: CloudRain, color: 'text-sky', flag: true },
  { h: '6PM', icon: CloudRain, color: 'text-sky' },
  { h: '9PM', icon: Cloud, color: 'text-ink-soft' },
]

export default function WeatherAlert({ onNext }: ScreenProps) {
  const [responded, setResponded] = useState<'idle' | 'accepted' | 'declined'>('idle')

  return (
    <div className="mx-auto max-w-3xl">
      <SectionLabel
        eyebrow="Step 6 · During the trip"
        title="Live Trip — Real-Time Weather Alert"
        subtitle="Day 2, 8:40 AM. Mochi checks the forecast every morning against your saved itinerary — not just the weather in general."
      />

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between bg-sage-light/60 px-5 py-3">
          <p className="text-sm font-extrabold text-ink">Day 2 · Wed, 23 Sep</p>
          <Pill tone="sky">Guangzhou forecast</Pill>
        </div>
        <div className="flex items-center justify-between px-5 py-5">
          {hours.map((h) => (
            <div key={h.h} className={`flex flex-col items-center gap-1.5 ${h.flag ? 'scale-110' : ''}`}>
              <h.icon size={h.flag ? 26 : 20} className={h.color} />
              <span className={`text-[11px] font-bold ${h.flag ? 'text-sky' : 'text-ink-soft'}`}>{h.h}</span>
              {h.flag && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-full bg-sky/20 px-2 py-0.5 text-[9px] font-extrabold text-[#3d6d7c]"
                >
                  Heavy rain
                </motion.span>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-black/[0.06] px-5 py-3 text-center text-xs font-semibold text-ink-soft">
          ⚠️ Affected plan: <span className="font-extrabold text-ink">Liwan Lake Park</span> — scheduled today, 2:00 PM
        </div>
      </Card>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 flex items-start gap-3">
        <Pet emotion={responded === 'idle' ? 'aggrieved' : responded === 'accepted' ? 'happy' : 'shy'} size={64} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-4">
          <AnimatePresence mode="wait">
            {responded === 'idle' && (
              <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[15px] leading-relaxed text-ink">
                  “Hey! 🌧️ It looks like <span className="font-extrabold">heavy rain is coming around 3 PM</span> today.
                  Your outdoor park visit might not be a good idea. Don't worry — I found a way to rearrange your
                  existing plans so you can still visit the park tomorrow. Want me to update the itinerary?”
                </p>
                <div className="mt-4 flex gap-2.5">
                  <Button onClick={() => setResponded('accepted')}>
                    <Check size={15} /> Yes, update it
                  </Button>
                  <Button variant="outline" onClick={() => setResponded('declined')}>
                    <X size={15} /> Not now
                  </Button>
                </div>
              </motion.div>
            )}
            {responded === 'accepted' && (
              <motion.div key="accepted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink">“Yay! Give me one second to rework Day 2 and Day 4 for you…”</p>
                <Pill tone="sage">✓ Accepted</Pill>
              </motion.div>
            )}
            {responded === 'declined' && (
              <motion.div key="declined" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-3">
                <p className="text-[15px] font-semibold text-ink">“Okay! I'll keep an eye on the sky and check back with you closer to 3 PM ☔”</p>
                <Pill tone="blush">Kept original plan</Pill>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={responded === 'idle'}>
          Next: See the Preservation-First replan →
        </Button>
      </div>
    </div>
  )
}
