import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck, Star, Sparkles, Users, Home as IndoorIcon, Plus, Search } from 'lucide-react'
import { Button, Card, SectionLabel, Pill , ScreenFooter } from '../components/ui'
import { MochiNote } from '../components/MochiNote'
import { placesInCities, type Place } from '../data/mockData'
import type { ScreenProps } from './types'

type Filter = 'all' | 'ai' | 'traveller'

export default function Discover({
  onNext,
  petEmotion,
  petMessage,
  savedIds,
  cities,
  extraPlaces = [],
  onToggleSave,
  onAddPlace,
  readOnly = false,
}: ScreenProps & {
  savedIds: string[]
  cities: string[]
  extraPlaces?: Place[]
  onToggleSave: (id: string) => void
  onAddPlace: (place: Place) => void
  readOnly?: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [isOutdoor, setIsOutdoor] = useState(false)

  const [city, setCity] = useState(cities[0] ?? '')

  const saved = savedIds
  // Never offer a place from a city this trip doesn't visit.
  const pool = [...extraPlaces.filter((p) => cities.includes(p.city)), ...placesInCities(cities)]
  const inCity = pool.filter((p) => p.city === city)
  const q = query.trim().toLowerCase()
  const visible = inCity
    .filter((p) => filter === 'all' || (filter === 'ai' ? p.source === 'ai' : p.source === 'traveller'))
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))

  const exactMatch = pool.some((p) => p.name.toLowerCase() === q)

  /** Nothing in the list matches what you typed, so it becomes a new place. */
  function addPlace() {
    const name = query.trim()
    if (!name) return
    const place: Place = {
      id: 'own-' + Date.now(),
      city,
      name,
      type: 'attraction',
      tags: ['Yours'],
      price: 0,
      priceLabel: 'Cost TBC',
      rating: 0,
      indoor: !isOutdoor,
      image: '📍',
      blurb: 'Added by you. Mochi will fit it around your other plans.',
      source: 'traveller',
      recommender: { name: 'You', emoji: '🙋', note: 'Added to this trip' },
    }
    onAddPlace(place)
    setQuery('')
  }



  return (
    <div className="mx-auto max-w-5xl">
      <SectionLabel
        title="Discover & Save Places"
        subtitle="AI-generated suggestions sit next to recommendations from real travellers who've actually been there. Save whatever fits — TripSync slots them into your itinerary later."
      />

      <MochiNote emotion={petEmotion} message={petMessage} />

      {cities.length > 1 && (
        <div className="mb-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cities.length}, minmax(0, 1fr))` }}>
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              className={`truncate rounded-2xl border-2 px-2 py-2 text-[12px] font-extrabold transition ${
                city === c ? 'border-moss-dark bg-moss-dark text-white' : 'border-black/10 bg-white text-ink'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {readOnly ? null : (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          addPlace()
        }}
        className="mb-3"
      >
        <div className="flex items-center gap-2 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2 focus-within:border-moss-dark">
          <Search size={15} className="shrink-0 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search, or add a place in ${city}`}
            aria-label="Search or add a place"
            className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-soft/70"
          />
          {q.length > 0 && !exactMatch && (
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1 rounded-full bg-moss-dark px-3 py-1.5 text-[12px] font-extrabold text-white"
            >
              <Plus size={12} /> Add
            </button>
          )}
        </div>
        {q.length > 0 && !exactMatch && (
          <label className="mt-2 flex items-center gap-2 pl-1 text-[12px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={isOutdoor}
              onChange={(e) => setIsOutdoor(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#8ba863]"
            />
            It is outdoors, so Mochi reschedules it when it rains
          </label>
        )}
      </form>
      )}

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

      {visible.length === 0 && (
        <p className="rounded-2xl bg-sage-light/50 px-4 py-6 text-center text-[13px] font-semibold text-ink-soft">
          {inCity.length === 0
            ? `No picks for ${city} yet — type a place above and add your own.`
            : 'Nothing saved by that name yet. Tap Add to put it on this trip.'}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => {
          const isSaved = saved.includes(p.id)
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="flex h-full flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-light text-2xl">{p.image}</div>
                  <button
                    onClick={() => onToggleSave(p.id)}
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
                  {p.rating > 0 && (
                    <>
                      <span className="flex items-center gap-0.5 text-sun-dark">
                        <Star size={12} fill="currentColor" /> {p.rating}
                      </span>
                      <span>·</span>
                    </>
                  )}
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

      <ScreenFooter>
        <Button size="lg" onClick={onNext} disabled={saved.length === 0}>
          Next: Generate AI trip plans →
        </Button>
      </ScreenFooter>
    </div>
  )
}
