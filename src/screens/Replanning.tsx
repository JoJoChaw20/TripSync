import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Star, X } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { travelers, type Place } from '../data/mockData'
import { replan } from '../engine/replan'
import { fromMin } from '../engine/buildPlan'
import type { Disruption, PlanDay, ReplanResult } from '../engine/types'

/**
 * A decision, not a report. One sentence on what happened, the change itself,
 * what it cost, then accept or decline. The reasoning is available but folded
 * away — nobody standing in the rain wants to read our algorithm.
 */
export default function Replanning({
  plan,
  disruption,
  places,
  onApply,
}: {
  plan: PlanDay[]
  disruption: Disruption
  places: Place[]
  onApply: (result: ReplanResult) => void
}) {
  const [why, setWhy] = useState(false)
  const travelerIds = travelers.map((t) => t.id)
  const result = useMemo(
    () => replan(plan, disruption, places, travelerIds),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan, disruption, places],
  )

  const byId = (id: string) => places.find((p) => p.id === id)
  const total = plan.flatMap((d) => d.items).length
  const kept = result.preserved.length
  const before = plan.find((d) => d.day === disruption.day)

  return (
    <div className="pb-2">
      <div className="mb-4 flex items-start gap-3">
        <Pet emotion={result.dropped.length ? 'aggrieved' : 'shy'} size={54} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “{disruption.label ?? 'Something changed'} — here's what I'd do.”
          </p>
        </Card>
      </div>

      {/* the change itself, one row per affected stop */}
      <div className="flex flex-col gap-2">
        {result.moves.map((m) => {
          const place = byId(m.placeId)
          const was = before?.items.find((i) => i.placeId === m.placeId)
          if (!place) return null
          return (
            <Card key={m.placeId} className="p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-xl">
                  {place.image}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-extrabold text-ink">{place.name}</p>
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink-soft">
                    <span className="line-through">
                      Day {m.fromDay} {was ? fromMin(was.startMin) : ''}
                    </span>
                    <ArrowRight size={12} className="text-moss-dark" />
                    <span className="text-moss-dark">
                      Day {m.toDay} {fromMin(m.toMin)}
                    </span>
                  </p>
                </div>
              </div>
              <p className="mt-2 rounded-xl bg-sage-light/50 px-2.5 py-1.5 text-[11px] leading-snug text-ink">
                {m.why}
              </p>
            </Card>
          )
        })}

        {result.dropped.map((id) => {
          const place = byId(id)
          if (!place) return null
          const owner = travelers.find((t) => t.id === place.addedBy)
          return (
            <Card key={id} className="border-coral/40 bg-coral/10 p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl opacity-60">
                  {place.image}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-extrabold text-ink line-through">{place.name}</p>
                  <p className="text-[12px] font-bold text-[#a8452a]">
                    Nowhere left to move it{owner ? ` · ${owner.name.split(' ')[0]}'s pick` : ''}
                  </p>
                </div>
              </div>
              {result.fallbacks.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wide text-[#9c6a12]">
                    Instead, if you want
                  </p>
                  <div className="flex flex-col gap-1">
                    {result.fallbacks.map((f) => (
                      <span key={f.id} className="flex items-center gap-2 rounded-xl bg-white/80 px-2.5 py-1.5">
                        <span className="text-base">{f.image}</span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-bold text-ink">{f.name}</span>
                        <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-bold text-sun-dark">
                          <Star size={9} fill="currentColor" /> {f.rating}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* the one number that matters */}
      <p className="mt-3 text-center text-[13px] font-extrabold text-ink">
        {result.dropped.length === 0
          ? `Everything else stays. You keep all ${total}.`
          : `You keep ${kept} of ${total}.`}
      </p>

      {result.gaps.map((gap) => {
        // Eight hours "free" on a washed-out day is not a gap, it's a lost day.
        const wholeDay = gap.toMin - gap.fromMin >= 8 * 60
        return (
          <p key={gap.fromMin} className="mt-2 text-center text-[11px] font-semibold leading-snug text-ink-soft">
            {wholeDay
              ? 'That day is a write-off — nothing outdoors will work.'
              : `${fromMin(gap.fromMin)}–${fromMin(gap.toMin)} ends up free.`}
            {gap.suggestions[0] &&
              ` ${gap.suggestions[0].image} ${gap.suggestions[0].name} is indoors and open.`}
          </p>
        )
      })}

      <div className="mt-4 flex flex-col gap-2">
        <Button size="lg" onClick={() => onApply(result)}>
          <Check size={16} /> Use this plan
        </Button>
        <button
          onClick={() => setWhy((v) => !v)}
          className="flex items-center justify-center gap-1 py-1 text-[12px] font-bold text-ink-soft"
        >
          Why this? <ChevronDown size={13} className={why ? 'rotate-180 transition' : 'transition'} />
        </button>
      </div>

      {why && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
          <Card className="mt-1 p-3">
            <p className="text-[12px] leading-relaxed text-ink-soft">
              I try to keep what you chose, in this order: a different time the same day, then a swap with another
              day, then any day with room. Somewhere new is the last resort — and I never move a stop into a day
              you've already had.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {result.perTraveler
                .filter((p) => p.total > 0)
                .map((p) => {
                  const t = travelers.find((x) => x.id === p.travelerId)!
                  return (
                    <span
                      key={p.travelerId}
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        p.kept === p.total ? 'bg-sage-light text-moss-dark' : 'bg-coral/15 text-[#a8452a]'
                      }`}
                    >
                      {t.emoji} {t.name.split(' ')[0]} {p.kept}/{p.total}
                    </span>
                  )
                })}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-ink-soft">
              When a loss is unavoidable I spread it, so it isn't always the same person who gives something up.
            </p>
          </Card>
        </motion.div>
      )}

      <p className="mt-3 flex items-center justify-center gap-1 text-[11px] font-semibold text-ink-soft">
        <X size={11} /> Close to keep your original plan
      </p>
    </div>
  )
}
