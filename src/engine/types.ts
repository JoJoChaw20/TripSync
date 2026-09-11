import type { Place } from '../data/mockData'

/** One scheduled stop. Minutes from midnight so arithmetic stays trivial. */
export interface ScheduledItem {
  placeId: string
  startMin: number
  note?: string
}

export interface PlanDay {
  day: number
  city: string
  items: ScheduledItem[]
  /** Earliest you can start: a late arrival, or travel in from the last city. */
  earliest?: number
  /** Where you're sleeping, so the day starts and ends somewhere real. */
  stay?: { name: string; lat: number; lng: number }
  /** Latest anything may finish: a flight, or leaving for the next city. */
  latest?: number
  /** Why the day starts late, shown to the user. */
  note?: string
  /** Why the day ends early, shown to the user. */
  endNote?: string
}

export type Disruption =
  | { kind: 'weather'; day: number; fromMin: number; toMin: number; label?: string }
  | { kind: 'closure'; day: number; placeId: string; label?: string }
  | { kind: 'delay'; day: number; fromMin: number; label?: string }

/** How an affected stop was rescued — in preservation order. */
export type MoveKind = 'reslotted' | 'swapped' | 'moved'

export interface Move {
  placeId: string
  kind: MoveKind
  fromDay: number
  toDay: number
  toMin: number
  /** Set when this was a swap: the stop that took its old place. */
  withPlaceId?: string
  why: string
}

/** Dead time the disruption left behind, with indoor ideas to fill it. */
export interface Gap {
  day: number
  fromMin: number
  toMin: number
  suggestions: Place[]
}

export interface ReplanResult {
  plan: PlanDay[]
  moves: Move[]
  /** Place ids still somewhere in the plan. */
  preserved: string[]
  /** Place ids nothing could be done for. */
  dropped: string[]
  perTraveler: { travelerId: string; kept: number; total: number }[]
  /** Only non-empty when something had to be dropped. */
  fallbacks: Place[]
  /** Free windows the disruption opened up on the affected day. */
  gaps: Gap[]
  /** Plain-language line for the pet. */
  reason: string
}
