import { motion } from 'framer-motion'
import { Sparkles, Users2, CloudSun } from 'lucide-react'
import { AppIcon } from '../components/AppIcon'
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
            <Sparkles size={17} /> Open my trips
          </Button>
        </div>
        <p className="text-xs font-semibold text-ink-soft">
          Plan · Today · Memories — three screens, and Mochi watches the rest.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
        className="relative"
      >
        <div className="absolute inset-0 -z-10 rounded-full bg-sage/50 blur-2xl" />
        <AppIcon size={180} />
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
    </div>
  )
}
