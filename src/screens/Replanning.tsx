import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ListChecks, Shuffle, Target, ArrowRight, Star, MapPinned } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import { placeById } from '../data/mockData'
import type { ScreenProps } from './types'

const processSteps = [
  { icon: Search, label: 'Detect the problem', desc: 'Heavy rain forecast at 3 PM' },
  { icon: ListChecks, label: 'Identify affected activity', desc: 'Liwan Lake Park (outdoor)' },
  { icon: Shuffle, label: 'Rearrange saved places first', desc: 'Swap with Day 4’s indoor mall' },
  { icon: Target, label: 'Preserve original goals', desc: 'Every saved place still gets visited' },
]

const nearbyAlternatives = [
  { name: 'Grandview Mall Aquarium', tag: 'Indoor · Culture', price: 'RM45', rating: 4.5, icon: '🐠' },
  { name: 'Guangzhou Opera House Tour', tag: 'Indoor · Culture', price: 'RM30', rating: 4.6, icon: '🎭' },
  { name: 'Redtory Art District', tag: 'Indoor · Culture', price: 'Free', rating: 4.4, icon: '🎨' },
]

export default function Replanning({ onNext }: ScreenProps) {
  const [branch, setBranch] = useState<'rearranged' | 'nofit'>('rearranged')

  const day2Before = ['p2', 'p5', 'p4']
  const day2After = ['p2', 'p4', 'p6']
  const day4Before = ['p6', 'p7']
  const day4After = ['p5', 'p7']

  return (
    <div className="mx-auto max-w-5xl">
      <SectionLabel
        eyebrow="Step 7 · During the trip — the core engine"
        title="Preservation-First AI Replanning"
        subtitle="Instead of jumping straight to a new recommendation, TripSync checks whether your own saved places can absorb the disruption first."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {processSteps.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="h-full p-4">
              <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-moss-dark">
                <s.icon size={15} />
              </span>
              <p className="text-xs font-extrabold text-ink">
                {i + 1}. {s.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{s.desc}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setBranch('rearranged')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${branch === 'rearranged' ? 'bg-moss-dark text-white' : 'bg-white text-ink-soft'}`}
        >
          ✅ What actually happened
        </button>
        <button
          onClick={() => setBranch('nofit')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${branch === 'nofit' ? 'bg-moss-dark text-white' : 'bg-white text-ink-soft'}`}
        >
          🤔 What if nothing fit? (bonus scenario)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {branch === 'rearranged' ? (
          <motion.div key="rearranged" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <DayCompare title="Day 2 · Wed 23 Sep" before={day2Before} after={day2After} swappedOut="p5" swappedIn="p6" />
              <DayCompare title="Day 4 · Fri 25 Sep" before={day4Before} after={day4After} swappedOut="p6" swappedIn="p5" />
            </div>

            <div className="mt-5 flex items-start gap-3">
              <Pet emotion="shy" size={56} bob={false} />
              <Card className="flex-1 p-4">
                <p className="text-sm leading-relaxed text-ink">
                  “Your saved <span className="font-extrabold">Tianhe Sportcenter Mall</span> visit was already indoor —
                  I moved it into today's rainy slot, and pushed <span className="font-extrabold">Liwan Lake Park</span> to
                  Friday morning instead, when it's sunny again. You still get to visit every place you originally
                  picked — just on better days.”
                </p>
              </Card>
            </div>
          </motion.div>
        ) : (
          <motion.div key="nofit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
            <div className="flex items-start gap-3">
              <Pet emotion="aggrieved" size={56} bob={false} />
              <Card className="flex-1 p-4">
                <p className="text-sm leading-relaxed text-ink">
                  “Hmm… 🥺 imagine every indoor place you'd saved was already visited this trip. Your saved places
                  don't have a good indoor option left for this afternoon. I found three nearby places that match your
                  group's interests and budget instead. Want to check them out?”
                </p>
              </Card>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {nearbyAlternatives.map((a) => (
                <Card key={a.name} className="p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun/20 text-xl">{a.icon}</div>
                  <p className="mt-2 text-sm font-extrabold text-ink">{a.name}</p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-bold text-ink-soft">
                    <span className="flex items-center gap-0.5 text-sun-dark">
                      <Star size={11} fill="currentColor" /> {a.rating}
                    </span>
                    <span>·</span>
                    <span>{a.price}</span>
                  </div>
                  <Pill tone="sky" className="mt-2">
                    <MapPinned size={10} /> {a.tag}
                  </Pill>
                </Card>
              ))}
            </div>
            <p className="mt-3 text-center text-xs font-semibold text-ink-soft">
              Only reached when Steps 1–4 can't preserve the plan — the fallback, never the first move.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={onNext}>
          Next: An unexpected flight delay →
        </Button>
      </div>
    </div>
  )
}

function DayCompare({
  title,
  before,
  after,
  swappedOut,
  swappedIn,
}: {
  title: string
  before: string[]
  after: string[]
  swappedOut: string
  swappedIn: string
}) {
  return (
    <Card className="p-4">
      <p className="mb-3 font-display text-sm font-extrabold text-ink">{title}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="space-y-1.5">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">Before</p>
          {before.map((id) => (
            <PlaceChip key={id} id={id} dim={id === swappedOut} />
          ))}
        </div>
        <ArrowRight size={16} className="text-moss-dark" />
        <div className="space-y-1.5">
          <p className="text-center text-[10px] font-extrabold uppercase tracking-wide text-ink-soft">After</p>
          {after.map((id) => (
            <PlaceChip key={id} id={id} highlight={id === swappedIn} />
          ))}
        </div>
      </div>
    </Card>
  )
}

function PlaceChip({ id, highlight, dim }: { id: string; highlight?: boolean; dim?: boolean }) {
  const place = placeById(id)
  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${
        highlight ? 'bg-blush/50 text-[#9c5a72] ring-1 ring-blush-dark/40' : dim ? 'bg-black/[0.03] text-ink-soft/60 line-through' : 'bg-sage-light/50 text-ink'
      }`}
    >
      <span>{place.image}</span>
      <span className="truncate">{place.name}</span>
    </div>
  )
}
