import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { BottomNav, type SurfaceId } from './components/BottomNav'
import { TripBar } from './components/TripBar'
import { Sheet } from './components/Sheet'
import { SHEETS, type SheetId } from './navigation'
import { activeTrip, cityCentre, places, trips as seedTrips, type Place, type TripSummary } from './data/mockData'
import { buildPlan } from './engine/buildPlan'
import { findSlot } from './engine/replan'
import type { ImportedLine } from './engine/importList'
import type { Disruption, PlanDay, ReplanResult } from './engine/types'

import PlanSurface from './surfaces/PlanSurface'
import TodaySurface from './surfaces/TodaySurface'
import MemoriesSurface from './surfaces/MemoriesSurface'

import Preferences from './screens/Preferences'
import Discover from './screens/Discover'
import AIPlans from './screens/AIPlans'
import Expenses from './screens/Expenses'
import Replanning from './screens/Replanning'
import FlightDelay from './screens/FlightDelay'
import ColorWalk from './screens/ColorWalk'
import ColdStart from './screens/ColdStart'
import CreateTrip from './screens/CreateTrip'
import Trips from './screens/Trips'
import Share from './screens/Share'
import ImportList from './screens/ImportList'
import TripSettings from './screens/TripSettings'

const params = new URLSearchParams(window.location.search)
const READ_ONLY = params.get('view') === '1'
const START_SURFACE: SurfaceId = params.get('demo') ? 'today' : 'plan'
const START_TRIP = params.get('trip') ?? activeTrip.id

/** Which saved places each generated plan brings in. */
const PLAN_PLACES: Record<string, string[]> = {
  saver: ['p2', 'p3', 'p5', 'p6', 'p8'],
  balanced: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
  comfort: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
}

/** Today's problem: heavy rain over Guangzhou, 15:00–18:00 on day 2. */
const RAIN: Disruption = { kind: 'weather', day: 2, fromMin: 900, toMin: 1080, label: 'Heavy rain from 3 PM' }

/**
 * The hard one: a washout on the last full day. Nothing can move forwards
 * because there is no forwards left — this is the case where the ladder
 * reaches its bottom rung and we finally suggest somewhere new.
 */
const STORM: Disruption = { kind: 'weather', day: 6, fromMin: 480, toMin: 1320, label: 'Storm all day Sunday' }

/** Stand-in so the derivations above the cold-start return have something real. */
const NO_TRIP: TripSummary = {
  id: '__none__',
  name: '',
  flag: '',
  destination: '',
  dates: '',
  days: 1,
  legs: [{ city: '', flag: '', days: 1 }],
  travelerCount: 1,
  status: 'planning',
  budget: 0,
  cover: '',
  highlight: '',
}

function App() {
  const [surface, setSurface] = useState<SurfaceId>(START_SURFACE)
  const [sheet, setSheet] = useState<SheetId | null>(null)
  const [repair, setRepair] = useState<ReplanResult | null>(null)
  const [active, setActive] = useState<Disruption>(RAIN)
  const [edited, setEdited] = useState<PlanDay[] | null>(null)
  const [addToDay, setAddToDay] = useState<number | undefined>(undefined)
  // placeId -> day it was added on, per trip
  const [pinnedByTrip, setPinnedByTrip] = useState<Record<string, Record<string, number>>>({})
  // placeId -> the time of day it was added for (a meal slot, say)
  const [atByTrip, setAtByTrip] = useState<Record<string, Record<string, number>>>({})
  // One override, written by the repair and by dragging stops around.
  const repairedPlan = edited ?? repair?.plan ?? null

  // Nothing is yours until you make it. ?demo=1 loads the sample trips so the
  // walkthrough starts fully loaded.
  const [tripList, setTripList] = useState<TripSummary[]>(params.get('demo') ? seedTrips : [])
  const [tripId, setTripId] = useState(START_TRIP)
  const [ownPlaces, setOwnPlaces] = useState<Place[]>([])
  // Which places are on which trip. Guangzhou starts with everything seeded.
  // The seeded trip starts with the eight places on its itinerary. Everything
  // else stays discoverable — so Discover has something to add, and the repair
  // has somewhere new to point when it runs out of options.
  const [savedByTrip, setSavedByTrip] = useState<Record<string, string[]>>({
    gz2026: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'],
  })

  const closeSheet = useCallback(() => setSheet(null), [])
  const meta = sheet ? SHEETS[sheet] : null

  const trip = tripList.find((t) => t.id === tripId) ?? tripList[0] ?? NO_TRIP
  const cities = trip.legs.map((l) => l.city)
  const savedIds = savedByTrip[trip.id] ?? []
  const pool = useMemo(() => [...ownPlaces, ...places], [ownPlaces])
  const savedPlaces = useMemo(
    () => savedIds.map((id) => pool.find((p) => p.id === id)).filter(Boolean) as Place[],
    [savedIds, pool],
  )

  const pinned = pinnedByTrip[trip.id] ?? {}
  const preferAt = atByTrip[trip.id] ?? {}
  const built = useMemo(
    () => buildPlan(trip, savedPlaces, pinned, repairedPlan, preferAt),
    [trip, savedPlaces, pinned, repairedPlan, preferAt],
  )
  const livePlan = built.days
  const repairApplied = repairedPlan !== null

  const nextUp = useMemo(() => {
    if (trip.status !== 'live') return trip.highlight
    return repairApplied ? 'Next · 14:30 Tianhe Mall' : 'Next · 14:00 Liwan Lake Park'
  }, [trip, repairApplied])

  function pin(id: string) {
    if (addToDay === undefined) return
    setPinnedByTrip((m) => ({ ...m, [trip.id]: { ...(m[trip.id] ?? {}), [id]: addToDay } }))
  }

  function toggleSave(id: string) {
    const adding = !(savedByTrip[trip.id] ?? []).includes(id)
    setSavedByTrip((m) => {
      const cur = m[trip.id] ?? []
      return { ...m, [trip.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
    if (adding) pin(id)
  }

  /** Move a stop to another day: remember the choice, then re-slot it there. */
  function movePlace(id: string, day: number) {
    setPinnedByTrip((m) => ({ ...m, [trip.id]: { ...(m[trip.id] ?? {}), [id]: day } }))
    const place = pool.find((p) => p.id === id)
    const base = (repairedPlan ?? built.days).map((d) => ({
      ...d,
      items: d.items.filter((i) => i.placeId !== id),
    }))
    const target = base.find((d) => d.day === day)
    if (place && target) {
      const slot = findSlot(target, place, (x) => pool.find((p) => p.id === x))
      target.items = [...target.items, { placeId: id, startMin: slot ?? Math.max(480, place.opens) }].sort(
        (a, b) => a.startMin - b.startMin,
      )
    }
    setEdited(base)
  }

  /** A pasted list becomes saved places, pinned to any day the list named. */
  function importLines(lines: ImportedLine[]) {
    const made: Place[] = []
    const ids: string[] = []
    const pins: Record<string, number> = {}

    lines.forEach((line, i) => {
      let id: string
      if (line.match) {
        id = line.match.id
      } else {
        id = `own-${Date.now()}-${i}`
        made.push({
          id,
          city: cities[0],
          ...cityCentre(cities[0]),
          name: line.name,
          type: 'attraction',
          tags: [],
          price: 0,
          priceLabel: 'Free',
          rating: 0,
          indoor: true,
          opens: 540,
          closes: 1200,
          duration: 90,
          addedBy: 't1',
          image: '📍',
          blurb: line.note ?? 'Imported from your list.',
          source: 'traveller',
          recommender: { name: 'You', emoji: '🙋', note: line.note ?? 'From your list' },
        })
      }
      ids.push(id)
      if (line.day) pins[id] = line.day
    })

    if (made.length) setOwnPlaces((a) => [...made, ...a])
    setSavedByTrip((m) => ({ ...m, [trip.id]: [...new Set([...(m[trip.id] ?? []), ...ids])] }))
    setPinnedByTrip((m) => ({ ...m, [trip.id]: { ...(m[trip.id] ?? {}), ...pins } }))
    closeSheet()
  }

  /** Put an existing place onto a specific day — used by the meal prompts. */
  function addToDayDirect(id: string, day: number, at?: number) {
    setSavedByTrip((m) => ({ ...m, [trip.id]: [...new Set([...(m[trip.id] ?? []), id])] }))
    setPinnedByTrip((m) => ({ ...m, [trip.id]: { ...(m[trip.id] ?? {}), [id]: day } }))
    if (at !== undefined) setAtByTrip((m) => ({ ...m, [trip.id]: { ...(m[trip.id] ?? {}), [id]: at } }))
    setEdited(null)
  }

  function addPlace(place: Place) {
    setOwnPlaces((a) => [place, ...a])
    pin(place.id)
    setSavedByTrip((m) => ({ ...m, [trip.id]: [place.id, ...(m[trip.id] ?? [])] }))
  }

  function updateTrip(patch: Partial<TripSummary>) {
    setTripList((l) => l.map((t) => (t.id === trip.id ? { ...t, ...patch } : t)))
  }

  function importPlan(planId: string) {
    // Only import places that are actually in a city on this trip.
    const ids = (PLAN_PLACES[planId] ?? []).filter((id) =>
      cities.some((c) => c.toLowerCase() === (places.find((p) => p.id === id)?.city ?? '').toLowerCase()),
    )
    setSavedByTrip((m) => ({ ...m, [trip.id]: ids }))
  }

  function createTrip(t: TripSummary) {
    // Keep the live trip first, but there may not be one yet.
    setTripList((l) => (l.length === 0 ? [t] : [l[0], t, ...l.slice(1)]))
    setSavedByTrip((m) => ({ ...m, [t.id]: [] }))
    setTripId(t.id)
    setSurface('plan')
    setSheet('places')
  }

  // Screens written for the old linear tour still expect these props.
  const screenProps = {
    onNext: closeSheet,
    onJump: closeSheet,
    petEmotion: meta?.pet ?? ('happy' as const),
    petMessage: meta?.petMessage ?? '',
  }

  if (tripList.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto flex min-h-screen w-full max-w-[440px] flex-col border-black/[0.06] bg-cream/60 px-4 py-6 sm:border-x">
          <ColdStart
            onNew={() => setSheet('newtrip')}
            onPaste={() => setSheet('import')}
            onSample={() => {
              setTripList(seedTrips)
              setTripId(activeTrip.id)
            }}
          />
        </div>

        <Sheet open={sheet !== null} title={meta?.title ?? ''} subtitle={meta?.subtitle} onClose={closeSheet}>
          {sheet === 'newtrip' && <CreateTrip onCreate={createTrip} />}
          {sheet === 'import' && (
            <ImportList
              places={places}
              cities={[]}
              onImport={() => {
                // Nothing to import into yet — make the trip first.
                setSheet('newtrip')
              }}
            />
          )}
        </Sheet>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sage/40 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-blush/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[440px] flex-col border-black/[0.06] bg-cream/60 sm:border-x">
        {READ_ONLY && (
          <div className="flex shrink-0 items-center justify-center gap-2 bg-sky/25 py-1.5 text-[11px] font-extrabold text-[#3d6d7c]">
            <span className="flex items-center gap-1.5">
              <Eye size={12} /> Shared with you · view only
            </span>
            <button
              onClick={() => {
                window.location.href = window.location.pathname
              }}
              className="rounded-full bg-white/70 px-2.5 py-0.5 font-extrabold text-[#3d6d7c] transition hover:bg-white"
            >
              Open my trips
            </button>
          </div>
        )}

        <TripBar
          trip={trip}
          tripCount={tripList.length}
          nextUp={nextUp}
          onOpenTrips={() => setSheet('trips')}
          onOpenBudget={() => setSheet('settings')}
        />

        <main className="flex-1 px-4 pb-6 pt-4">
          {/* No AnimatePresence here: a bottom-nav tap should feel instant,
              and mode="wait" would block the new surface behind an exit. */}
          <motion.div
            key={surface + trip.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
          >
            {surface === 'plan' && (
              <PlanSurface
                trip={trip}
                savedPlaces={savedPlaces}
                repairedPlan={repairedPlan}
                pinned={pinned}
                preferAt={preferAt}
                onMovePlace={movePlace}
                onAddToDay={addToDayDirect}
                allPlaces={pool}
                onRemovePlace={toggleSave}
                readOnly={READ_ONLY}
                onPlanChange={setEdited}
                onOpenSheet={(id, day) => {
                  setAddToDay(day)
                  setSheet(id)
                }}
              />
            )}
            {surface === 'today' && (
              <TodaySurface
                tripId={trip.id}
                plan={livePlan}
                rain={RAIN}
                storm={STORM}
                onOpenSheet={(id, d) => {
                  if (d) setActive(d)
                  setSheet(id)
                }}
                repair={repair}
              />
            )}
            {surface === 'memories' && (
              <MemoriesSurface
                trip={trip}
                trips={tripList}
                onOpenTrip={(id) => setTripId(id)}
                onOpenSheet={setSheet}
              />
            )}
          </motion.div>
        </main>

        <BottomNav
          current={surface}
          onChange={setSurface}
          badge={!repairApplied && trip.status === 'live' && surface !== 'today' ? 'today' : null}
        />
      </div>

      <Sheet open={sheet !== null} title={meta?.title ?? ''} subtitle={meta?.subtitle} onClose={closeSheet}>
        {sheet === 'trips' && (
          <Trips
            currentId={trip.id}
            trips={tripList}
            readOnly={READ_ONLY}
            onOpen={(id) => {
              setTripId(id)
              setSurface('plan')
              closeSheet()
            }}
            onNewTrip={() => setSheet('newtrip')}
          />
        )}
        {sheet === 'newtrip' && <CreateTrip onCreate={createTrip} />}
        {sheet === 'share' && <Share trip={trip} />}
        {sheet === 'import' && <ImportList places={pool} cities={cities} onImport={importLines} />}
        {sheet === 'settings' && <TripSettings trip={trip} onSave={updateTrip} onClose={closeSheet} />}
        {sheet === 'group' && <Preferences {...screenProps} count={trip.travelerCount} />}
        {sheet === 'places' && (
          <Discover
            {...screenProps}
            savedIds={savedIds}
            cities={cities}
            extraPlaces={ownPlaces}
            onToggleSave={toggleSave}
            onAddPlace={addPlace}
            onImport={() => setSheet('import')}
            readOnly={READ_ONLY}
          />
        )}
        {sheet === 'suggestions' && <AIPlans {...screenProps} onImport={importPlan} notes={trip.notes} />}
        {sheet === 'budget' && <Expenses {...screenProps} count={trip.travelerCount} />}
        {sheet === 'flight' && <FlightDelay {...screenProps} />}
        {sheet === 'game' && <ColorWalk onDone={closeSheet} count={trip.travelerCount} />}
        {sheet === 'repair' && (
          <Replanning
            plan={built.days}
            disruption={active}
            places={pool}
            onApply={(result: ReplanResult) => {
              setRepair(result)
              setEdited(null)
              closeSheet()
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

export default App
