import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Home,
  MapPin,
  Users,
  Compass,
  Wand2,
  CalendarDays,
  CloudRain,
  RefreshCw,
  PlaneTakeoff,
  Wallet,
  Star,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { StepperNav, type JourneyStep } from './components/StepperNav'
import { type PetEmotion } from './components/Pet'
import { AppIcon } from './components/AppIcon'
import { ProgressDots } from './components/ui'

import Welcome from './screens/Welcome'
import CreateTrip from './screens/CreateTrip'
import Preferences from './screens/Preferences'
import Discover from './screens/Discover'
import AIPlans from './screens/AIPlans'
import Itinerary from './screens/Itinerary'
import WeatherAlert from './screens/WeatherAlert'
import Replanning from './screens/Replanning'
import FlightDelay from './screens/FlightDelay'
import Expenses from './screens/Expenses'
import PostTrip from './screens/PostTrip'

const steps: (JourneyStep & { petEmotion: PetEmotion; petMessage: string })[] = [
  { id: 'welcome', title: 'Welcome to TripSync', short: 'Welcome', icon: Home, phase: 'Before', petEmotion: 'happy', petMessage: "Hi, I'm Mochi! I'll be your travel pet for this trip 🐰" },
  { id: 'create', title: 'Create the Trip', short: 'Create Trip', icon: MapPin, phase: 'Before', petEmotion: 'happy', petMessage: "Guangzhou sounds fun! Let's set the basics." },
  { id: 'preferences', title: 'Group Preference Sync', short: 'Preferences', icon: Users, phase: 'Before', petEmotion: 'shy', petMessage: "Everyone wants something different — let's find the overlap." },
  { id: 'discover', title: 'Discover & Save Places', short: 'Discover', icon: Compass, phase: 'Before', petEmotion: 'happy', petMessage: 'Real travellers shared some hidden gems here!' },
  { id: 'plans', title: 'AI Trip Generator', short: 'AI Plans', icon: Wand2, phase: 'Before', petEmotion: 'happy', petMessage: 'I made 3 versions of your trip — pick your favourite.' },
  { id: 'itinerary', title: 'Final Itinerary', short: 'Itinerary', icon: CalendarDays, phase: 'Before', petEmotion: 'happy', petMessage: 'Everything is locked in one shared timeline. Bon voyage!' },
  { id: 'weather', title: 'Live Trip — Weather Alert', short: 'Weather Alert', icon: CloudRain, phase: 'During', petEmotion: 'aggrieved', petMessage: 'Uh oh, I just checked the forecast for tomorrow...' },
  { id: 'replanning', title: 'Preservation-First Replanning', short: 'Replanning', icon: RefreshCw, phase: 'During', petEmotion: 'shy', petMessage: 'I found a way to keep your original plan — just reordered!' },
  { id: 'flight', title: 'Flight Delay Adaptation', short: 'Flight Delay', icon: PlaneTakeoff, phase: 'During', petEmotion: 'scared', petMessage: 'Your return flight just got delayed 5 hours!' },
  { id: 'expenses', title: 'Group Expenses', short: 'Expenses', icon: Wallet, phase: 'During', petEmotion: 'neutral', petMessage: "Let's make sure everyone pays their fair share." },
  { id: 'posttrip', title: 'Post-Trip Review', short: 'Post-Trip', icon: Star, phase: 'After', petEmotion: 'happy', petMessage: 'What a trip! Thanks for taking me along 💛' },
]

const screenComponents = [Welcome, CreateTrip, Preferences, Discover, AIPlans, Itinerary, WeatherAlert, Replanning, FlightDelay, Expenses, PostTrip]

function App() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const step = steps[index]
  const Screen = screenComponents[index]

  const phaseColor = useMemo(() => {
    if (step.phase === 'Before') return 'sage'
    if (step.phase === 'During') return 'blush'
    return 'sun'
  }, [step.phase])

  function goTo(i: number) {
    if (i < 0 || i >= steps.length) return
    setDirection(i > index ? 1 : -1)
    setIndex(i)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sage/40 blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sun/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-black/[0.05] bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <AppIcon size={34} />
            <p className="font-display text-lg font-extrabold text-ink">TripSync</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`hidden rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide sm:inline-block ${
                phaseColor === 'sage' ? 'bg-sage-light text-moss-dark' : phaseColor === 'blush' ? 'bg-blush/60 text-[#9c5a72]' : 'bg-sun/25 text-[#9c6a12]'
              }`}
            >
              {step.phase} the trip
            </span>
            <button
              onClick={() => goTo(0)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-bold text-ink-soft hover:border-moss-dark hover:text-moss-dark"
            >
              <RotateCcw size={13} /> Restart
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6">
          <StepperNav steps={steps} current={index} onJump={goTo} />
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 pb-40 pt-8 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Screen onNext={() => goTo(index + 1)} onJump={goTo} petEmotion={step.petEmotion} petMessage={step.petMessage} />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-black/[0.06] bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-ink-soft transition hover:border-moss-dark hover:text-moss-dark disabled:opacity-30"
          >
            <ArrowLeft size={15} /> <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex flex-col items-center gap-1">
            <ProgressDots total={steps.length} current={index} />
            <p className="text-[11px] font-bold text-ink-soft">
              Step {index + 1} of {steps.length} · {step.title}
            </p>
          </div>
          <button
            onClick={() => goTo(index + 1)}
            disabled={index === steps.length - 1}
            className="flex items-center gap-1.5 rounded-full bg-moss-dark px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:brightness-105 disabled:opacity-30"
          >
            <span className="hidden sm:inline">Next</span> <ArrowRight size={15} />
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
