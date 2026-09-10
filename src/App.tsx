import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { BottomNav, type SurfaceId } from './components/BottomNav'
import { TripBar } from './components/TripBar'
import { Sheet } from './components/Sheet'
import { SHEETS, type SheetId } from './navigation'
import { activeTrip, places, trips as seedTrips, type Place, type TripSummary } from './data/mockData'

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
import Welcome from './screens/Welcome'
import CreateTrip from './screens/CreateTrip'
import Trips from './screens/Trips'
import Share from './screens/Share'
import TripSettings from './screens/TripSettings'

const params = new URLSearchParams(window.location.search)
const READ_ONLY = params.get('view') === '1'
const START_SURFACE: SurfaceId = params.get('demo') ? 'today' : 'plan'
const START_TRIP = params.get('trip') ?? activeTrip.id
// Onboarding is a one-time gate, not a tab. ?intro=1 replays it.
const SHOW_INTRO = params.get('intro') === '1'

/** Which saved places each generated plan brings in. */
const PLAN_PLACES: Record<string, string[]> = {
  saver: ['p2', 'p3', 'p5', 'p6', 'p8'],
  balanced: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
  comfort: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
}

function App() {
  const [intro, setIntro] = useState(SHOW_INTRO)
  const [surface, setSurface] = useState<SurfaceId>(START_SURFACE)
  const [sheet, setSheet] = useState<SheetId | null>(null)
  const [repairApplied, setRepairApplied] = useState(false)

  const [tripList, setTripList] = useState<TripSummary[]>(seedTrips)
  const [tripId, setTripId] = useState(START_TRIP)
  const [ownPlaces, setOwnPlaces] = useState<Place[]>([])
  // Which places are on which trip. Guangzhou starts with everything seeded.
  const [savedByTrip, setSavedByTrip] = useState<Record<string, string[]>>({
    gz2026: places.map((p) => p.id),
  })

  const closeSheet = useCallback(() => setSheet(null), [])
  const meta = sheet ? SHEETS[sheet] : null

  const trip = tripList.find((t) => t.id === tripId) ?? tripList[0]
  const cities = trip.legs.map((l) => l.city)
  const savedIds = savedByTrip[trip.id] ?? []
  const pool = useMemo(() => [...ownPlaces, ...places], [ownPlaces])
  const savedPlaces = useMemo(
    () => savedIds.map((id) => pool.find((p) => p.id === id)).filter(Boolean) as Place[],
    [savedIds, pool],
  )

  const nextUp = useMemo(() => {
    if (trip.status !== 'live') return trip.highlight
    return repairApplied ? 'Next · 14:30 Tianhe Mall' : 'Next · 14:00 Liwan Lake Park'
  }, [trip, repairApplied])

  function toggleSave(id: string) {
    setSavedByTrip((m) => {
      const cur = m[trip.id] ?? []
      return { ...m, [trip.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
  }

  function addPlace(place: Place) {
    setOwnPlaces((a) => [place, ...a])
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
    setTripList((l) => [l[0], t, ...l.slice(1)])
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

  if (intro) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="mx-auto w-full max-w-[440px] px-4 py-6">
          <Welcome {...screenProps} onNext={() => setIntro(false)} />
        </div>
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
              <PlanSurface trip={trip} savedPlaces={savedPlaces} readOnly={READ_ONLY} onOpenSheet={setSheet} />
            )}
            {surface === 'today' && (
              <TodaySurface tripId={trip.id} onOpenSheet={setSheet} repairApplied={repairApplied} />
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
            readOnly={READ_ONLY}
          />
        )}
        {sheet === 'suggestions' && <AIPlans {...screenProps} onImport={importPlan} notes={trip.notes} />}
        {sheet === 'budget' && <Expenses {...screenProps} count={trip.travelerCount} />}
        {sheet === 'flight' && <FlightDelay {...screenProps} />}
        {sheet === 'game' && <ColorWalk onDone={closeSheet} count={trip.travelerCount} />}
        {sheet === 'repair' && (
          <Replanning
            {...screenProps}
            onNext={() => {
              setRepairApplied(true)
              closeSheet()
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

export default App
