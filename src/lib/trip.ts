import type { TripLeg } from '../data/mockData'

/** yyyy-mm-dd, the shape an `<input type="date">` speaks. */
export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** A plausible near-future window, used when nobody has picked a date. */
export function defaultStartISO(offsetFromToday = 30) {
  const d = new Date()
  d.setDate(d.getDate() + offsetFromToday)
  return toISODate(d)
}

/**
 * Parse yyyy-mm-dd as a *local* date. `new Date('2026-03-15')` is parsed as
 * UTC and lands on the 14th for anyone west of Greenwich, which would show
 * the wrong first day of the trip.
 */
export function parseISODate(iso?: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : undefined
}

/** The nth day of a trip, or undefined when no start date was chosen. */
export function dayDate(startISO: string | undefined, index: number): Date | undefined {
  const start = parseISODate(startISO)
  if (!start) return undefined
  const d = new Date(start)
  d.setDate(d.getDate() + index)
  return d
}

/**
 * "Tue, 22 Sep" — the same shape as the seeded trip's hand-written labels.
 * Assembled by hand because `toLocaleString` drops the comma ("Thu 24 Dec"),
 * and the day chips split on it to tell a dated day from an undated one.
 */
export function dayChip(startISO: string | undefined, index: number): string | undefined {
  const d = dayDate(startISO, index)
  if (!d) return undefined
  const weekday = d.toLocaleString('en-GB', { weekday: 'short' })
  const month = d.toLocaleString('en-GB', { month: 'short' })
  return `${weekday}, ${d.getDate()} ${month}`
}

/** "22 – 27 Sep 2026". Falls back to the near-future window when unset. */
export function dateRange(days: number, startISO?: string) {
  const start = parseISODate(startISO) ?? parseISODate(defaultStartISO())!
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
