import { motion } from 'framer-motion'
import { Sparkles, Users2, CloudSun, Heart } from 'lucide-react'
import { Pet } from '../components/Pet'
import { Button, Card, Pill } from '../components/ui'
import type { ScreenProps } from './types'

const highlights = [
  { icon: Users2, title: 'Plan together', text: 'One shared workspace instead of scattered chats & apps.' },
  { icon: Sparkles, title: 'AI + real travellers', text: 'AI-optimized plans, backed by people who actually went.' },
  { icon: CloudSun, title: 'Adapts in real time', text: 'Rain, closures & delays get rerouted — not just cancelled.' },
]

export default function Welcome({ onNext }: ScreenProps) {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-5 pt-4">
        <Pill tone="blush">🐰 Meet Mochi — your AI Travel Pet</Pill>
        <h1 className="font-display max-w-3xl text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
          Plan the trip you want. <br className="hidden sm:block" />
          Let it adapt when life happens.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-ink-soft">
          TripSync is a collaborative travel workspace for groups — AI-optimized itineraries, recommendations from
          real travellers, and a Preservation-First replanning engine that protects your original plans when the
          weather (or the world) doesn't cooperate.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button size="lg" onClick={onNext}>
            <Sparkles size={17} /> Walk through the demo journey
          </Button>
        </div>
        <p className="text-xs font-semibold text-ink-soft">
          Following <span className="text-moss-dark">“4 Friends Going to Guangzhou”</span> — a real example from our
          product spec.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 rounded-full bg-sage/50 blur-2xl" />
        <Pet emotion="happy" size={180} />
      </motion.div>

      <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
        {highlights.map((h, i) => (
          <motion.div key={h.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
            <Card className="flex h-full flex-col items-start gap-2 p-5 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-light text-moss-dark">
                <h.icon size={18} />
              </span>
              <p className="font-display text-base font-extrabold text-ink">{h.title}</p>
              <p className="text-sm leading-snug text-ink-soft">{h.text}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="flex max-w-2xl items-center gap-3 px-5 py-4 text-left">
        <Heart className="shrink-0 text-blush-dark" size={20} />
        <p className="text-sm text-ink-soft">
          <span className="font-bold text-ink">Design note —</span> colors follow the brand's pink/green palette
          (<code className="rounded bg-black/5 px-1">#adc485 · #d6e7b9 · #fcf9e6 · #e7cbd7</code>) and Mochi's 6
          reference emotions (happy, sad, angry, aggrieved, shy, scared) recur throughout the journey.
        </p>
      </Card>
    </div>
  )
}
