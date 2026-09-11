import { cityCentre, originalItinerary, type Place, type TripLeg, type TripSummary } from '../data/mockData'
import { scheduleLoose } from './replan'
import { duration, interCityMinutes, longModeLabel } from './travel'
import { dayChip } from '../lib/trip'
import type { PlanDay } from './types'

export const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
export const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export const fromMin = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

/**
 * The one place a trip turns into a schedule. Both the Plan surface and the
 * repair screen read from this, so they can never disagree about what day
 * something is on.
 */
export function buildPlan(
  trip: TripSummary,
  savedPlaces: Place[],
  pinned: Record<string, number> = {},
  /**
   * The plan as the user last left it — after dragging, moving a stop, or
   * applying a repair. It is a starting point, never a freeze: places added
   * since still get scheduled, and places removed still disappear.
   */
  base?: PlanDay[] | null,
  preferAt: Record<string, number> = {},
): { days: PlanDay[]; unplaced: Place[] } {
  // Which leg each day belongs to, and whether it is that leg's first day.
  const legForDay: { city: string; leg: TripLeg; first: boolean }[] = []
  trip.legs.forEach((leg) => {
    for (let i = 0; i < leg.days; i++) legForDay.push({ city: leg.city, leg, first: i === 0 })
  })
  const cityForDay = legForDay.map((d) => d.city)

  const seeded = trip.id === 'gz2026'
  const byId = (id: string) => savedPlaces.find((p) => p.id === id)

  const days: PlanDay[] = Array.from({ length: Math.max(1, trip.days) }, (_, i) => {
    const slot = legForDay[i]
    const city = slot?.city ?? trip.legs[0].city
    const stay = slot?.leg.stay
    // Moving between cities eats a morning; the first day of the trip is an
    // arrival. Neither is time you can spend sightseeing.
    const last = i === trip.days - 1
    const legEnds = legForDay[i + 1]?.first === true
    const movingIn = slot?.first && i > 0

    // Getting out: check-in queues, then the ride to the airport.
    const AIRPORT = 120 + 45

    // You check out, you travel, you drop bags. None of that is sightseeing.
    const LEAVE = 9 * 60
    const SETTLE = 45
    const hop =
      movingIn && slot
        ? interCityMinutes(
            trip.legs[trip.legs.indexOf(slot.leg) - 1]?.stay ?? cityCentre(cityForDay[i - 1]),
            slot.leg.stay ?? cityCentre(slot.city),
          )
        : undefined

    const earliest = movingIn && hop
      ? LEAVE + hop.minutes + SETTLE
      : i === 0
        ? Math.max(8 * 60, (trip.arrive ?? 11 * 60) + 75) // immigration, bags, transfer
        : 8 * 60

    const note = movingIn && hop
      ? `${cityForDay[i - 1]} → ${slot?.city} · ${duration(hop.minutes)} ${longModeLabel[hop.mode]} · free from`
      : i === 0
        ? trip.arrive
          ? `Land ${hhmm(trip.arrive)} · free from`
          : 'Arrival day'
        : undefined

    const latest = last ? (trip.depart ? trip.depart - AIRPORT : 20 * 60) : undefined

    const endNote = last
      ? trip.depart
        ? `Fly ${hhmm(trip.depart)} · leave by`
        : undefined
      : legEnds
        ? `Last night in ${slot?.city} · checkout ${stay ? hhmm(stay.checkOut) : 'noon'} tomorrow`
        : undefined

    const window = { earliest, note, latest, endNote }
    const kept = base?.find((d) => d.day === i + 1)
    if (kept) {
      // Keep the user's times and order, minus anything they have unsaved.
      return {
        day: i + 1,
        city,
        ...window,
        stay,
        items: kept.items.filter((it) => savedPlaces.some((p) => p.id === it.placeId)),
      }
    }
    return {
      day: i + 1,
      city,
      ...window,
      stay,
      items: (seeded ? (originalItinerary[i]?.items ?? []) : [])
        // A stop the user has moved is no longer where the seed put it.
        .filter((it) => savedPlaces.some((p) => p.id === it.placeId) && pinned[it.placeId] === undefined)
        .map((it) => ({ placeId: it.placeId, startMin: toMin(it.time), note: it.note })),
    }
  })

  const placed = new Set(days.flatMap((d) => d.items.map((it) => it.placeId)))
  const { unplaced } = scheduleLoose(
    days,
    savedPlaces.filter((p) => !placed.has(p.id)),
    byId,
    pinned,
    preferAt,
  )
  return { days, unplaced }
}

/**
 * Day labels. The seeded trip keeps its hand-written flavour; any trip with a
 * start date gets real weekdays, so a date the user picked actually shows up
 * on the plan rather than only in the trip bar.
 */
export function dayMeta(trip: TripSummary, index: number) {
  const hand = trip.id === 'gz2026' ? originalItinerary[index] : undefined
  return {
    label: hand?.label ?? `Day ${index + 1}`,
    chip: hand?.date ?? dayChip(trip.startDate, index) ?? `Day ${index + 1}`,
  }
}
