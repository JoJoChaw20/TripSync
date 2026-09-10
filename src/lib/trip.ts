import type { TripLeg } from '../data/mockData'

/** A plausible near-future window, so every trip reads the same way. */
export function dateRange(days: number, offsetFromToday = 30) {
  const start = new Date()
  start.setDate(start.getDate() + offsetFromToday)
  const end = new Date(start)
  end.setDate(start.getDate() + Math.max(0, days - 1))
  const m = (d: Date) => d.toLocaleString('en-GB', { month: 'short' })
  return m(start) === m(end)
    ? `${start.getDate()} – ${end.getDate()} ${m(end)} ${end.getFullYear()}`
    : `${start.getDate()} ${m(start)} – ${end.getDate()} ${m(end)} ${end.getFullYear()}`
}

export const totalDays = (legs: TripLeg[]) => legs.reduce((n, l) => n + l.days, 0)

/**
 * Set the length of the whole trip. Extra nights go to the last city;
 * removed nights come off the last city that can spare one, so no city
 * ever drops below a day.
 */
export function setTotalDays(legs: TripLeg[], target: number): TripLeg[] {
  if (legs.length === 0) return legs
  const next = legs.map((l) => ({ ...l }))
  const min = next.length
  let want = Math.max(min, Math.min(60, target))
  let have = totalDays(next)

  while (have < want) {
    next[next.length - 1].days += 1
    have += 1
  }
  while (have > want) {
    const i = [...next.keys()].reverse().find((n) => next[n].days > 1)
    if (i === undefined) break
    next[i].days -= 1
    have -= 1
  }
  return next
}
