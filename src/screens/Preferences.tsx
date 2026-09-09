import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Unlock, Sparkles } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { MochiNote } from '../components/MochiNote'
import { travelers, allInterests } from '../data/mockData'
import type { ScreenProps } from './types'

export default function Preferences({ onNext, petEmotion, petMessage }: ScreenProps) {
  const [revealed, setRevealed] = useState<string[]>([])
  const allRevealed = revealed.length === travelers.length

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    allInterests.forEach((i) => map.set(i, 0))
    travelers
      .filter((t) => revealed.includes(t.id))
      .forEach((t) => t.preferences.forEach((p) => map.set(p, (map.get(p) ?? 0) + 1)))
    return map
  }, [revealed])

  const maxCount = Math.max(1, ...Array.from(counts.values()))

  return (
    <div className="mx-auto max-w-4xl">
      <SectionLabel
        eyebrow="Step 2 · Before the trip"
        title="Group Preference Sync & Consensus Engine"
        subtitle="Each traveller privately submits interests, budget and priorities. Tap a friend to reveal their private input — TripSync's AI finds the overlap so nobody has to argue."
      />

      <MochiNote emotion={petEmotion} message={petMessage} />

      <div className="grid gap-4 sm:grid-cols-4">
        {travelers.map((t) => {
          const isOpen = revealed.includes(t.id)
          return (
            <button
              key={t.id}
              onClick={() => setRevealed((r) => (r.includes(t.id) ? r : [...r, t.id]))}
              className="text-left"
            >
              <Card className={`h-full p-4 transition-all ${isOpen ? 'ring-2 ring-moss-dark/40' : 'hover:-translate-y-0.5'}`}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: `${t.color}55` }}
                  >
                    {t.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-ink">{t.name}</p>
                    <p className="flex items-center gap-1 text-[11px] font-bold text-ink-soft">
                      {isOpen ? <Unlock size={11} /> : <Lock size={11} />}
                      {isOpen ? 'Revealed' : 'Private input'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex min-h-[30px] flex-wrap gap-1.5">
                  {isOpen ? (
                    t.preferences.map((p) => (
                      <motion.span
                        key={p}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-full bg-blush/50 px-2.5 py-1 text-[11px] font-bold text-[#9c5a72]"
                      >
                        {p}
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-[11px] italic text-ink-soft/70">Tap to reveal ✨</span>
                  )}
                </div>
              </Card>
            </button>
          )
        })}
      </div>

      <Card className="mt-6 p-6">
        <p className="mb-4 flex items-center gap-2 font-display text-base font-extrabold text-ink">
          <Sparkles size={16} className="text-moss-dark" /> AI Consensus — group interest overlap
        </p>
        <div className="space-y-3">
          {allInterests.map((interest) => {
            const c = counts.get(interest) ?? 0
            return (
              <div key={interest} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm font-bold text-ink">{interest}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-moss to-moss-dark"
                    initial={{ width: 0 }}
                    animate={{ width: `${(c / maxCount) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-extrabold text-ink-soft">{c}/4</span>
              </div>
            )
          })}
        </div>

        {allRevealed && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-sage-light/60 px-4 py-3">
            <p className="text-sm text-moss-dark">
              <span className="font-extrabold">Everyone revealed!</span> Food, Culture &amp; Shopping all have strong
              support — TripSync will balance the itinerary across all three.
            </p>
            <Pill tone="sage">Consensus ready</Pill>
          </motion.div>
        )}
      </Card>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={!allRevealed}>
          Next: Discover places to save →
        </Button>
      </div>
    </div>
  )
}
