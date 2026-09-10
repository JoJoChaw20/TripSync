import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Check, Eye } from 'lucide-react'
import { Button, Card, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import { travelers } from '../data/mockData'

const PALETTE = [
  { id: 'red', label: 'Red', hex: '#ef8b74', shape: 'Circle' },
  { id: 'yellow', label: 'Yellow', hex: '#f6c945', shape: 'Triangle' },
  { id: 'green', label: 'Green', hex: '#adc485', shape: 'Square' },
  { id: 'blue', label: 'Blue', hex: '#8ec5d6', shape: 'Star' },
]

/**
 * Colour Walk — a 30-minute group game the pet offers when a disruption
 * leaves a gap. Each traveller takes a colour and photographs it around
 * the city; the shots land in Memories afterwards.
 *
 * Accessibility: the same game runs on shapes instead of colours, so it
 * works for colour-blind travellers. One toggle, same rules.
 */
export default function ColorWalk({ onDone, count = 4 }: { onDone: () => void; count?: number }) {
  const [byShape, setByShape] = useState(false)
  const [assigned, setAssigned] = useState(false)

  return (
    <div className="pb-2">
      <div className="mb-3 flex items-start gap-3">
        <Pet emotion="happy" size={52} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “The rain buys you two free hours 🌧️ Everyone takes one {byShape ? 'shape' : 'colour'}, we walk, and we
            photograph everything we spot. Most finds wins dinner choice.”
          </p>
        </Card>
      </div>

      <button
        onClick={() => setByShape((v) => !v)}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-3.5 py-2.5 text-left transition hover:border-moss-dark"
      >
        <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
          <Eye size={14} className="text-moss-dark" />
          Play by {byShape ? 'shapes' : 'colours'}
        </span>
        <span className="text-[11px] font-bold text-ink-soft">
          {byShape ? 'Colour-blind friendly' : 'Switch to shapes'}
        </span>
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        {travelers.slice(0, count).map((t, i) => {
          const pick = PALETTE[i]
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: assigned ? i * 0.08 : 0 }}
            >
              <Card className="flex items-center gap-2.5 p-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                  style={{ backgroundColor: assigned ? pick.hex : `${t.color}55` }}
                >
                  {t.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-extrabold text-ink">{t.name}</p>
                  <p className="text-[11px] font-bold text-ink-soft">
                    {assigned ? (byShape ? pick.shape : pick.label) : 'Waiting…'}
                  </p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {!assigned ? (
        <Button className="mt-4 w-full" size="lg" onClick={() => setAssigned(true)}>
          Deal everyone a {byShape ? 'shape' : 'colour'}
        </Button>
      ) : (
        <>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-sage-light/60 px-3.5 py-2.5">
            <span className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
              <Camera size={13} className="text-moss-dark" /> Photos land in Memories
            </span>
            <Pill tone="sage">30 min</Pill>
          </div>
          <Button className="mt-3 w-full" size="lg" onClick={onDone}>
            <Check size={15} /> Start the walk
          </Button>
        </>
      )}
    </div>
  )
}
