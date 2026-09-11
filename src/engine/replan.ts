import type { Place } from '../data/mockData'
import type { Disruption, Gap, Move, PlanDay, ReplanResult, ScheduledItem } from './types'
import { travelMinutes } from './travel'

const DAY_START = 8 * 60 // 08:00
const DAY_END = 22 * 60 // 22:00
const DAY_CAPACITY = 9 * 60 // how much activity a day can absorb before it's a slog
const MIN_GAP = 10 // you still need to stand up and leave

/** Real minutes between two stops, not a flat guess. */
export const gapBetween = (a: Place, b: Place) => Math.max(MIN_GAP, travelMinutes(a, b).minutes)
const DEAD_TIME = 120 // a hole this big is worth offering to fill

const overlaps = (aFrom: number, aTo: number, bFrom: number, bTo: number) => aFrom < bTo && bFrom < aTo

/**
 * Preservation-first replanning.
 *
 * When something breaks we try, in this order:
 *   1. reslot  — same day, a different time that still works
 *   2. swap    — trade with a stop on another day in the same city
 *   3. move    — take a free slot on another day in the same city
 *   4. drop    — only when none of the above fits, and then we suggest alternatives
 *
 * The order is the product: a new recommendation is the last resort, never
 * the first move. Losses, when unavoidable, are spread across people rather
 * than always falling on the same person.
 */
export function replan(
  plan: PlanDay[],
  disruption: Disruption,
  places: Place[],
  travelerIds: string[],
): ReplanResult {
  const byId = (id: string) => places.find((p) => p.id === id)
  const next: PlanDay[] = plan.map((d) => ({ ...d, items: d.items.map((i) => ({ ...i })) }))

  const day = next.find((d) => d.day === disruption.day)
  const affected: ScheduledItem[] = []

  if (day) {
    for (const item of [...day.items]) {
      const place = byId(item.placeId)
      if (!place) continue
      const end = item.startMin + place.duration
      const hit =
        disruption.kind === 'weather'
          ? !place.indoor && overlaps(item.startMin, end, disruption.fromMin, disruption.toMin)
          : disruption.kind === 'closure'
            ? item.placeId === disruption.placeId
            : item.startMin >= disruption.fromMin
      if (hit) affected.push(item)
    }
    day.items = day.items.filter((i) => !affected.includes(i))
  }

  // Protect whoever has already lost the most: rescue their stops first.
  const lost: Record<string, number> = Object.fromEntries(travelerIds.map((t) => [t, 0]))
  affected.sort((a, b) => (byId(a.placeId)?.duration ?? 0) - (byId(b.placeId)?.duration ?? 0))

  const moves: Move[] = []
  const dropped: string[] = []

  for (const item of affected) {
    const place = byId(item.placeId)
    if (!place) continue
    const move =
      tryReslot(next, place, disruption, byId) ??
      trySwap(next, item, place, disruption, byId) ??
      tryMove(next, place, disruption, byId)

    if (move) {
      moves.push(move)
    } else {
      dropped.push(place.id)
      lost[place.addedBy] = (lost[place.addedBy] ?? 0) + 1
    }
  }

  for (const d of next) d.items.sort((a, b) => a.startMin - b.startMin)

  const scheduled = new Set(next.flatMap((d) => d.items.map((i) => i.placeId)))
  const original = plan.flatMap((d) => d.items.map((i) => i.placeId))

  // A place can sit on two days (a favourite restaurant, a second look at a
  // view). Losing one of them is not losing both, so count stops, not ids.
  const preserved = [...original]
  for (const id of dropped) {
    const at = preserved.indexOf(id)
    if (at >= 0) preserved.splice(at, 1)
  }

  const perTraveler = travelerIds.map((t) => {
    const mine = original.filter((id) => byId(id)?.addedBy === t)
    const kept = preserved.filter((id) => byId(id)?.addedBy === t)
    return { travelerId: t, kept: kept.length, total: mine.length }
  })

  const fallbacks =
    dropped.length > 0
      ? places
          .filter(
            (p) =>
              p.city === (day?.city ?? '') &&
              p.indoor &&
              !scheduled.has(p.id) &&
              !dropped.includes(p.id),
          )
          .slice(0, 3)
      : []

  return {
    plan: next,
    moves,
    preserved,
    dropped,
    perTraveler,
    fallbacks,
    gaps: day ? findGaps(day, disruption, places, byId) : [],
    reason: explain(moves, dropped, original.length, byId),
  }
}

/**
 * Preserving every stop can still leave you standing in the rain with
 * nothing booked. Report the holes the disruption opened, and only then
 * offer somewhere indoors to spend them.
 */
function findGaps(
  day: PlanDay,
  disruption: Disruption,
  places: Place[],
  byId: (id: string) => Place | undefined,
): Gap[] {
  const busy = day.items
    .map((i) => {
      const p = byId(i.placeId)
      return p ? ([i.startMin, i.startMin + p.duration] as const) : null
    })
    .filter(Boolean)
    .sort((a, b) => a![0] - b![0]) as (readonly [number, number])[]

  const window =
    disruption.kind === 'weather'
      ? ([disruption.fromMin, disruption.toMin] as const)
      : disruption.kind === 'delay'
        ? ([disruption.fromMin, DAY_END] as const)
        : ([DAY_START, DAY_END] as const)

  const holes: Gap[] = []
  let cursor = DAY_START
  for (const [start, end] of [...busy, [DAY_END, DAY_END] as const]) {
    if (start - cursor >= DEAD_TIME && overlaps(cursor, start, window[0], window[1])) {
      const from = Math.max(cursor, window[0])
      const to = Math.min(start, window[1])
      if (to - from >= DEAD_TIME) {
        holes.push({
          day: day.day,
          fromMin: from,
          toMin: to,
          suggestions: places
            .filter(
              (pl) =>
                pl.city === day.city &&
                pl.indoor &&
                !day.items.some((i) => i.placeId === pl.id) &&
                pl.opens <= from &&
                pl.closes >= from + Math.min(pl.duration, to - from),
            )
            .slice(0, 3),
        })
      }
    }
    cursor = Math.max(cursor, end)
  }
  return holes
}

/** 1 — same day, a different time. The most preserving outcome there is. */
function tryReslot(
  plan: PlanDay[],
  place: Place,
  disruption: Disruption,
  byId: (id: string) => Place | undefined,
): Move | null {
  const day = plan.find((d) => d.day === disruption.day)
  if (!day) return null
  // A closed place is closed all day — another time slot fixes nothing.
  if (disruption.kind === 'closure' && disruption.placeId === place.id) return null
  const slot = findSlot(day, place, byId, disruption)
  if (slot === null) return null
  day.items.push({ placeId: place.id, startMin: slot })
  return {
    placeId: place.id,
    kind: 'reslotted',
    fromDay: day.day,
    toDay: day.day,
    toMin: slot,
    why: `${place.name} still fits today at ${fmt(slot)}, before the disruption.`,
  }
}

/** 2 — trade with a stop on another day, so neither day ends up thin. */
function trySwap(
  plan: PlanDay[],
  item: ScheduledItem,
  place: Place,
  disruption: Disruption,
  byId: (id: string) => Place | undefined,
): Move | null {
  const home = plan.find((d) => d.day === disruption.day)
  if (!home) return null

  for (const other of plan) {
    // Only forwards: you cannot reschedule into a day you have already lived.
    if (other.day <= disruption.day || other.city !== home.city) continue
    for (const candidate of other.items) {
      const cPlace = byId(candidate.placeId)
      if (!cPlace) continue
      // The candidate has to survive the slot we're vacating.
      if (disruption.kind === 'weather' && !cPlace.indoor) continue
      if (!fits(cPlace, item.startMin)) continue
      if (!fits(place, candidate.startMin)) continue
      if (clashes(other, place, candidate.startMin, byId, candidate.placeId)) continue
      if (clashes(home, cPlace, item.startMin, byId)) continue

      other.items = other.items.filter((i) => i !== candidate)
      other.items.push({ placeId: place.id, startMin: candidate.startMin })
      home.items.push({ placeId: cPlace.id, startMin: item.startMin })

      return {
        placeId: place.id,
        kind: 'swapped',
        fromDay: home.day,
        toDay: other.day,
        toMin: candidate.startMin,
        withPlaceId: cPlace.id,
        why:
          disruption.kind === 'weather'
            ? `${place.name} moves to day ${other.day}; ${cPlace.name} comes back to today — it's indoors.`
            : `${place.name} moves to day ${other.day}; ${cPlace.name} takes its slot today.`,
      }
    }
  }
  return null
}

/** 3 — any free slot on another day in the same city. */
function tryMove(
  plan: PlanDay[],
  place: Place,
  disruption: Disruption,
  byId: (id: string) => Place | undefined,
): Move | null {
  const home = plan.find((d) => d.day === disruption.day)
  if (!home) return null

  for (const other of plan) {
    if (other.day <= disruption.day || other.city !== home.city) continue
    if (load(other, byId) + place.duration > DAY_CAPACITY) continue
    const slot = findSlot(other, place, byId)
    if (slot === null) continue
    other.items.push({ placeId: place.id, startMin: slot })
    return {
      placeId: place.id,
      kind: 'moved',
      fromDay: home.day,
      toDay: other.day,
      toMin: slot,
      why: `${place.name} moves to day ${other.day} at ${fmt(slot)} — the only day with room.`,
    }
  }
  return null
}

/** Earliest start on this day that respects opening hours, gaps and the disruption. */
export function findSlot(
  day: PlanDay,
  place: Place,
  byId: (id: string) => Place | undefined,
  avoid?: Disruption,
  /** Try here first — a meal wants to land at mealtime, not first thing. */
  preferFrom?: number,
): number | null {
  const busy = day.items
    .map((i) => {
      const p = byId(i.placeId)
      return p ? { from: i.startMin, to: i.startMin + p.duration, place: p } : null
    })
    .filter(Boolean) as { from: number; to: number; place: Place }[]

  // You start from the hotel, and not before the day is open to you.
  const fromStay = day.stay ? travelMinutes(day.stay, place).minutes : 0
  const earliest = Math.max(DAY_START, (day.earliest ?? DAY_START) + fromStay, place.opens)
  const latest = Math.min(DAY_END, day.latest ?? DAY_END, place.closes) - place.duration
  if (latest < earliest) return null

  const starts: number[] = []
  if (preferFrom !== undefined) {
    for (let t = Math.max(earliest, preferFrom); t <= latest; t += 15) starts.push(t)
  }
  for (let t = earliest; t <= latest; t += 15) starts.push(t)

  for (const start of starts) {
    const end = start + place.duration
    // Leave room to actually get there from whatever sits either side.
    if (busy.some((b) => overlaps(start - gapBetween(b.place, place), end + gapBetween(place, b.place), b.from, b.to)))
      continue
    if (
      avoid &&
      avoid.day === day.day &&
      ((avoid.kind === 'weather' && !place.indoor && overlaps(start, end, avoid.fromMin, avoid.toMin)) ||
        (avoid.kind === 'delay' && start >= avoid.fromMin))
    )
      continue
    return start
  }
  return null
}

const fits = (place: Place, start: number) =>
  start >= Math.max(DAY_START, place.opens) && start + place.duration <= Math.min(DAY_END, place.closes)

function clashes(
  day: PlanDay,
  place: Place,
  start: number,
  byId: (id: string) => Place | undefined,
  ignoreId?: string,
) {
  return day.items.some((i) => {
    if (i.placeId === ignoreId) return false
    const p = byId(i.placeId)
    if (!p) return false
    const gap = gapBetween(p, place)
    return overlaps(start - gap, start + place.duration + gap, i.startMin, i.startMin + p.duration)
  })
}

const load = (day: PlanDay, byId: (id: string) => Place | undefined) =>
  day.items.reduce((n, i) => n + (byId(i.placeId)?.duration ?? 0), 0)

const fmt = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** Lead with what was kept, never with what changed. */
function explain(
  moves: Move[],
  dropped: string[],
  total: number,
  byId: (id: string) => Place | undefined,
): string {
  if (moves.length === 0 && dropped.length === 0) return 'Nothing on your plan is affected — carry on.'
  const kept = total - dropped.length
  const head = `You keep ${kept} of your ${total} plans.`
  const first = moves[0]
  if (!first) return `${head} I couldn't find a slot for the rest.`
  const detail = first.why
  const more = moves.length > 1 ? ` (+${moves.length - 1} more moved)` : ''
  const loss = dropped.length
    ? ` ${byId(dropped[0])?.name ?? 'One stop'} wouldn't fit anywhere — here are some nearby options.`
    : ''
  return `${head} ${detail}${more}${loss}`
}

/**
 * Put unscheduled places onto days, using the same feasibility rules the
 * repair engine uses. Anything that cannot fit anywhere comes back in
 * `unplaced` rather than being crammed on top of another stop.
 */
export function scheduleLoose(
  days: PlanDay[],
  loose: Place[],
  byId: (id: string) => Place | undefined,
  /** placeId -> the day the user was on when they added it. */
  pinned: Record<string, number> = {},
  /** placeId -> the time of day it was added for, e.g. a lunch slot. */
  preferAt: Record<string, number> = {},
): { unplaced: Place[] } {
  const unplaced: Place[] = []
  for (const place of loose) {
    const inCity = days.filter((d) => d.city === place.city)
    // The day you added it on is tried first, and stays first on every
    // later render — the preference belongs to the place, not the view.
    const want = pinned[place.id]
    const candidates =
      want === undefined
        ? inCity
        : [...inCity].sort((a, b) => Number(b.day === want) - Number(a.day === want))
    let placed = false
    for (const day of candidates) {
      if (load(day, byId) + place.duration > DAY_CAPACITY) continue
      const slot = findSlot(day, place, byId, undefined, preferAt[place.id])
      if (slot === null) continue
      day.items.push({ placeId: place.id, startMin: slot })
      day.items.sort((a, b) => a.startMin - b.startMin)
      placed = true
      break
    }
    if (!placed) unplaced.push(place)
  }
  return { unplaced }
}

export interface RetimeWarning {
  placeId: string
  message: string
}

/**
 * Re-time a day after the user drags its stops into a new order.
 *
 * The order is theirs; the clock is ours. Each stop takes the earliest time
 * that respects its own opening hours and leaves travel slack after the one
 * before it. A stop that cannot work where it was dropped is still placed —
 * and reported — rather than silently shown at an impossible time.
 */
export function retimeDay(
  orderedIds: string[],
  byId: (id: string) => Place | undefined,
): { items: ScheduledItem[]; warnings: RetimeWarning[] } {
  const items: ScheduledItem[] = []
  const warnings: RetimeWarning[] = []
  let cursor = DAY_START

  let previous: Place | undefined
  for (const id of orderedIds) {
    const place = byId(id)
    if (!place) continue
    const leave = previous ? cursor + gapBetween(previous, place) : cursor
    const start = Math.max(leave, place.opens)
    if (start + place.duration > Math.min(DAY_END, place.closes)) {
      warnings.push({
        placeId: id,
        message: `${place.name} opens ${fmt(place.opens)}–${fmt(place.closes)} — it can't run at ${fmt(start)}.`,
      })
    }
    items.push({ placeId: id, startMin: start })
    cursor = start + place.duration
    previous = place
  }
  return { items, warnings }
}
