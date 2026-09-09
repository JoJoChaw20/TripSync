import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Star, Sparkles, Users, Home as IndoorIcon } from 'lucide-react'
import { Button, Card, SectionLabel, Pill } from '../components/ui'
import { places } from '../data/mockData'
import type { ScreenProps } from './types'

type Filter = 'all' | 'ai' | 'traveller'

export default function Discover({ onNext }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [saved, setSaved] = useState<string[]>(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])

  const visible = places.filter((p) => filter === 'all' || (filter === 'ai' ? p.source === 'ai' : p.source === 'traveller'))

  function toggleSave(id: string) {
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <SectionLabel
        eyebrow="Step 3 · Before the trip"
        title="Discover & Save Places"
        subtitle="AI-generated suggestions sit next to recommendations from real travellers who've actually been there. Save whatever fits — TripSync slots them into your itinerary later."
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              ['all', 'All places'],
              ['ai', '🤖 AI picks'],
              ['traveller', '🌟 Traveller picks'],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                filter === key ? 'bg-moss-dark text-white shadow-soft' : 'bg-white text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Pill tone="blush">{saved.length} places saved to trip</Pill>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => {
          const isSaved = saved.includes(p.id)
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light text-2xl">{p.image}</div>
                  <button
                    onClick={() => toggleSave(p.id)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                      isSaved ? 'bg-blush text-[#9c5a72]' : 'bg-black/5 text-ink-soft hover:bg-black/10'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                  </button>
                </div>

                <p className="mt-3 font-display text-[15px] font-extrabold leading-tight text-ink">{p.name}</p>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-soft">{p.blurb}</p>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-ink-soft">
                  <span className="flex items-center gap-0.5 text-sun-dark">
                    <Star size={12} fill="currentColor" /> {p.rating}
                  </span>
                  <span>·</span>
                  <span>{p.priceLabel}</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">{p.indoor ? <IndoorIcon size={11} /> : '☀️'} {p.indoor ? 'Indoor' : 'Outdoor'}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-sage-light px-2 py-0.5 text-[10px] font-bold text-moss-dark">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-3">
                  {p.source === 'ai' ? (
                    <div className="flex items-center gap-1.5 rounded-xl bg-sky/15 px-2.5 py-1.5 text-[11px] font-bold text-[#3d6d7c]">
                      <Sparkles size={12} /> AI recommended for your group
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl bg-sun/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#9c6a12]">
                      <Users size={12} className="shrink-0" />
                      <span>
                        <span className="font-extrabold">
                          {p.recommender?.emoji} {p.recommender?.name}
                        </span>{' '}
                        — “{p.recommender?.note}”
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={onNext} disabled={saved.length === 0}>
          Next: Generate AI trip plans →
        </Button>
      </div>
    </div>
  )
}
