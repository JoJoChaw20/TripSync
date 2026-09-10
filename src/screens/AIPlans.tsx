import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, TrendingUp } from 'lucide-react'
import { Button, Card, SectionLabel, ScoreRing, Pill , ScreenFooter } from '../components/ui'
import { MochiNote } from '../components/MochiNote'
import { tripPlans, type TripPlan } from '../data/mockData'
import { PlanFeedback, type TweakId } from '../components/PlanFeedback'
import type { ScreenProps } from './types'

const scoreLabels: Record<string, string> = {
  budgetFit: 'Budget fit',
  groupSatisfaction: 'Group satisfaction',
  preferenceMatch: 'Preference match',
  efficiency: 'Travel efficiency',
  convenience: 'Convenience',
  feasibility: 'Schedule feasibility',
}

export default function AIPlans({
  onNext,
  petEmotion,
  petMessage,
  onImport,
}: ScreenProps & { onImport?: (planId: string) => void; notes?: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [tweaks, setTweaks] = useState<TweakId[]>([])
  const [note, setNote] = useState('')
  const [applied, setApplied] = useState<{ tweaks: TweakId[]; note: string } | null>(null)

  const plans = applied ? tripPlans.map((p) => adjust(p, applied.tweaks)) : tripPlans

  return (
    <div className="mx-auto max-w-6xl">
      <SectionLabel
        title="AI Trip Generator"
        subtitle="Instead of one forced itinerary, TripSync proposes several — each scored on budget fit, group satisfaction, preference match, efficiency, convenience and feasibility."
      />

      <MochiNote emotion={petEmotion} message={petMessage} />

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const isSelected = selected === plan.id
          return (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card
                className={`relative flex h-full flex-col p-5 transition-all ${
                  isSelected ? 'ring-2 ring-moss-dark' : plan.recommended ? 'ring-1 ring-blush-dark/50' : ''
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-5 flex items-center gap-1 rounded-full bg-blush-dark px-3 py-1 text-[11px] font-extrabold text-white shadow-soft">
                    <Sparkles size={11} /> Group favourite
                  </span>
                )}
                <div className="flex items-start justify-between gap-2 pt-2">
                  <div>
                    <p className="font-display text-lg font-extrabold text-ink">{plan.name}</p>
                    <p className="mt-0.5 text-2xl font-extrabold text-moss-dark">
                      RM{plan.cost.toLocaleString()} <span className="text-xs font-bold text-ink-soft">/person</span>
                    </p>
                  </div>
                  <ScoreRing value={plan.groupScore} />
                </div>

                <p className="mt-3 text-[13px] leading-snug text-ink-soft">{plan.highlight}</p>

                <div className="mt-4 space-y-2 border-t border-black/[0.06] pt-4">
                  {Object.entries(plan.scores).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-32 shrink-0 text-[11px] font-semibold text-ink-soft">{scoreLabels[key]}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                        <div
                          className="h-full rounded-full bg-moss"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="w-7 shrink-0 text-right text-[11px] font-bold text-ink-soft">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <Button
                    variant={isSelected ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => setSelected(plan.id)}
                  >
                    {isSelected ? (
                      <>
                        <Check size={15} /> Selected by group
                      </>
                    ) : (
                      'Select this plan'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light text-moss-dark">
                <TrendingUp size={18} />
              </span>
              <p className="text-sm text-ink">
                The group picked <span className="font-extrabold">{plans.find((p) => p.id === selected)?.name}</span> — TripSync is
                assembling flights, hotel, restaurants and attractions into one shared itinerary.
              </p>
            </div>
            <Pill tone="sage">Nothing is locked — change any of it after</Pill>
          </Card>
          <Button
            size="lg"
            className="mt-3 w-full"
            onClick={() => {
              onImport?.(selected)
              onNext()
            }}
          >
            <Check size={16} /> Add these places to my trip
          </Button>
        </motion.div>
      )}

      {applied && (
        <p className="mt-3 rounded-2xl bg-sage-light/60 px-3 py-2 text-[12px] font-bold text-moss-dark">
          Redone for: {applied.tweaks.join(', ') || 'your notes'}
          {applied.note.trim() && ` · “${applied.note.trim()}”`}
        </p>
      )}

      <PlanFeedback
        active={tweaks}
        note={note}
        onToggle={(id) => setTweaks((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))}
        onNote={setNote}
        onApply={() => {
          setApplied({ tweaks, note })
          setSelected(null)
        }}
      />

      <ScreenFooter>
        <Button size="lg" onClick={onNext} disabled={!selected}>
          Next: View final itinerary →
        </Button>
      </ScreenFooter>
    </div>
  )
}


/**
 * Deterministic stand-in for a model: each tweak nudges the scores and cost
 * the way a real regeneration would. Swap the body for a call when there is one.
 * ponytail: rules, not a model — the seam is this function alone.
 */
function adjust(plan: TripPlan, tweaks: TweakId[]): TripPlan {
  const s = { ...plan.scores }
  let cost = plan.cost
  const notes: string[] = []

  if (tweaks.includes('cheaper')) {
    cost = Math.round(cost * 0.82)
    s.budgetFit = Math.min(99, s.budgetFit + 8)
    s.convenience = Math.max(40, s.convenience - 6)
    notes.push('cheaper stays')
  }
  if (tweaks.includes('food')) {
    s.preferenceMatch = Math.min(99, s.preferenceMatch + 5)
    notes.push('more food stops')
  }
  if (tweaks.includes('walk')) {
    s.efficiency = Math.min(99, s.efficiency + 6)
    s.convenience = Math.min(99, s.convenience + 5)
    cost = Math.round(cost * 1.04)
    notes.push('shorter walks')
  }
  if (tweaks.includes('culture')) {
    s.preferenceMatch = Math.min(99, s.preferenceMatch + 4)
    notes.push('more culture')
  }
  if (tweaks.includes('slow')) {
    s.feasibility = Math.min(99, s.feasibility + 6)
    s.groupSatisfaction = Math.min(99, s.groupSatisfaction + 3)
    notes.push('fewer stops a day')
  }
  if (tweaks.includes('night')) {
    s.groupSatisfaction = Math.min(99, s.groupSatisfaction + 4)
    cost = Math.round(cost * 1.06)
    notes.push('later evenings')
  }

  const vals = Object.values(s)
  return {
    ...plan,
    cost,
    costPerPerson: cost,
    scores: s,
    // The headline score is the mean of its parts, so the numbers agree.
    groupScore: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    highlight: notes.length ? plan.highlight + ' Adjusted for ' + notes.join(', ') + '.' : plan.highlight,
  }
}
