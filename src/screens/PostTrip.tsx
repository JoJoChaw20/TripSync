import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingDown, Share2, Brain } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import type { TripSummary } from '../data/mockData'

const memories = ['🗼', '🍜', '🏛️', '🛍️', '🏮', '🌳']
const learnedProfile = ['Loves local food over tourist restaurants', 'Prefers public transport', 'Enjoys less-crowded attractions', 'Responsive to indoor backup plans']

export default function PostTrip({ trip }: { trip: TripSummary }) {
  const [rating, setRating] = useState(Math.round(trip.rating ?? 5))
  const [shared, setShared] = useState(false)

  return (
    <div className="pb-2">
      <SectionLabel
        title={`${trip.name} — how it went`}
        subtitle="Close the loop — record real spending, rate the trip, share the local gem you found, and let TripSync learn for next time."
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="flex flex-col items-center p-5 text-center">
          <TrendingDown className="mb-1 text-moss-dark" size={20} />
          <p className="text-2xl font-extrabold text-moss-dark">RM{(trip.spent ?? 0).toLocaleString()}</p>
          <p className="text-xs font-semibold text-ink-soft">actual spend, vs RM{trip.budget.toLocaleString()} budgeted</p>
        </Card>
        <Card className="flex flex-col items-center p-5 text-center">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-ink-soft">Trip rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star size={22} className={n <= rating ? 'fill-sun text-sun-dark' : 'text-black/15'} />
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs font-semibold text-ink-soft">{rating}.0 / 5</p>
        </Card>
        <Card className="flex flex-col items-center p-5 text-center">
          <Pet emotion="happy" size={56} bob={false} />
          <p className="mt-1 text-xs font-semibold text-ink-soft">“Thanks for taking me along!” 💛</p>
        </Card>
      </div>

      <Card className="mt-5 p-5">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-soft">Favourite memories</p>
        <div className="flex flex-wrap gap-3">
          {memories.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-light text-3xl shadow-soft"
            >
              {m}
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            <Share2 size={13} /> Share with the community
          </p>
          <div className="flex items-center gap-3 rounded-2xl bg-sage-light/40 p-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl">🍜</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">Ah Po's Noodle House</p>
              <p className="text-[11px] text-ink-soft">“Went twice in 3 days. Ask for extra chili oil!”</p>
            </div>
          </div>
          <Button className="mt-3 w-full" variant={shared ? 'secondary' : 'primary'} onClick={() => setShared(true)} disabled={shared}>
            {shared ? 'Shared to TripSync community ✓' : 'Share this recommendation'}
          </Button>
        </Card>

        <Card className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
            <Brain size={13} /> Updated Personal Travel Profile
          </p>
          <div className="flex flex-wrap gap-1.5">
            {learnedProfile.map((p) => (
              <Pill key={p} tone="sky">
                {p}
              </Pill>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-snug text-ink-soft">
            TripSync remembers these for the next trip's AI recommendations.
          </p>
        </Card>
      </div>

    </div>
  )
}
