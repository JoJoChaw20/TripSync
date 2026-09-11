import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button, Card, ScreenFooter } from '../components/ui'
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
      <MochiNote emotion={petEmotion} message={petMessage} />

      <div className="flex flex-col gap-2">
        {plans.map((plan, i) => {
          const isSelected = selected === plan.id
          const cheapest = plan.cost === Math.min(...plans.map((x) => x.cost))
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button onClick={() => setSelected(plan.id)} className="w-full text-left">
                <Card
                  className={`p-3 transition-all ${
                    isSelected ? 'ring-2 ring-moss-dark' : 'hover:shadow-pop'
                  }`}
                >
                  {/* one scannable row per plan, so three fit on one screen */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[13px] font-extrabold ${
                        plan.groupScore >= 90
                          ? 'bg-sage-light text-moss-dark'
                          : 'bg-sun/25 text-[#9c6a12]'
                      }`}
                    >
                      {plan.groupScore}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-[14px] font-extrabold text-ink">
                        {plan.name}
                        {plan.recommended && (
                          <span className="shrink-0 rounded-full bg-blush-dark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                            BEST FIT
                          </span>
                        )}
                        {cheapest && !plan.recommended && (
                          <span className="shrink-0 rounded-full bg-sage px-1.5 py-0.5 text-[9px] font-extrabold text-moss-dark">
                            CHEAPEST
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-ink-soft">{plan.highlight}</p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block font-display text-[15px] font-extrabold leading-none text-moss-dark">
                        RM{plan.cost.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-bold text-ink-soft">per person</span>
                    </span>
                  </div>

                  {/* detail only for the one you're looking at */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-1.5 overflow-hidden border-t border-black/[0.06] pt-3"
                    >
                      {Object.entries(plan.scores).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-[104px] shrink-0 text-[10px] font-semibold text-ink-soft">
                            {scoreLabels[key]}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                            <div className="h-full rounded-full bg-moss" style={{ width: `${value}%` }} />
                          </div>
                          <span className="w-6 shrink-0 text-right text-[10px] font-bold text-ink-soft">
                            {value}
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 text-[10px] font-semibold text-ink-soft">
                        Score is the average of these six.
                      </p>
                    </motion.div>
                  )}
                </Card>
              </button>
            </motion.div>
          )
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              onImport?.(selected)
              onNext()
            }}
          >
            <Check size={16} /> Add {plans.find((p) => p.id === selected)?.name} to my trip
          </Button>
          <p className="mt-1.5 text-center text-[11px] font-semibold text-ink-soft">
            Nothing is locked — change any of it after.
          </p>
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
