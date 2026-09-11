import type { Place } from '../data/mockData'
import type { PlanDay } from './types'

export type MealName = 'lunch' | 'dinner'

export interface Meal {
  meal: MealName
  label: string
  from: number
  to: number
}

/** Breakfast is usually at the hotel, so we only watch the two that aren't. */
export const MEALS: Meal[] = [
  { meal: 'lunch', label: 'Lunch', from: 11 * 60 + 30, to: 14 * 60 + 30 },
  { meal: 'dinner', label: 'Dinner', from: 18 * 60, to: 21 * 60 },
]

const isFood = (p: Place) => p.type === 'restaurant' || p.tags.includes('Food')
const overlaps = (aFrom: number, aTo: number, bFrom: number, bTo: number) => aFrom < bTo && bFrom < aTo

export interface MissingMeal extends Meal {
  suggestions: Place[]
}

/**
 * A day full of temples and no lunch is a bad day. We don't reserve the time
 * — that's the user's call — but we say plainly when there's nothing to eat,
 * and offer somewhere that's actually open then.
 */
export function missingMeals(day: PlanDay, places: Place[], byId: (id: string) => Place | undefined): MissingMeal[] {
  // An empty day isn't missing lunch, it's just empty.
  if (day.items.length === 0) return []

  const out: MissingMeal[] = []
  for (const meal of MEALS) {
    // If you land at 15:00, nobody expects you to have had lunch here.
    const dayFrom = day.earliest ?? 8 * 60
    const dayTo = day.latest ?? 22 * 60
    if (!overlaps(meal.from, meal.to, dayFrom, dayTo)) continue

    const fed = day.items.some((it) => {
      const p = byId(it.placeId)
      return p ? isFood(p) && overlaps(it.startMin, it.startMin + p.duration, meal.from, meal.to) : false
    })
    if (fed) continue

    const suggestions = places
      .filter(
        (p) =>
          p.city === day.city &&
          isFood(p) &&
          !day.items.some((it) => it.placeId === p.id) &&
          // open for enough of the window to be worth suggesting
          p.opens <= meal.to - 30 &&
          p.closes >= meal.from + 30,
      )
      .slice(0, 3)

    out.push({ ...meal, suggestions })
  }
  return out
}
