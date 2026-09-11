export interface Point {
  lat: number
  lng: number
}

export type Mode = 'walk' | 'transit' | 'ride'

/** Straight-line kilometres. */
export function haversineKm(a: Point, b: Point): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

/**
 * Streets are not straight lines and cities have rivers. 1.35 is the usual
 * urban detour factor — good enough to rank options, which is all the
 * scheduler needs. Swap in a real routing matrix and only this file changes.
 *
 * ponytail: haversine + detour factor, not real routing. Upgrade to a
 * Distance Matrix call here if absolute accuracy ever matters.
 */
const DETOUR = 1.35
const SPEED: Record<Mode, number> = { walk: 4.5, transit: 20, ride: 26 } // km/h
const OVERHEAD: Record<Mode, number> = { walk: 2, transit: 10, ride: 6 } // waiting, hailing, stairs

export function modeFor(km: number): Mode {
  if (km < 1.2) return 'walk'
  if (km < 9) return 'transit'
  return 'ride'
}

/** Door-to-door minutes between two points, rounded to a usable 5. */
export function travelMinutes(a: Point, b: Point): { minutes: number; mode: Mode; km: number } {
  const km = haversineKm(a, b) * DETOUR
  const mode = modeFor(km)
  const raw = (km / SPEED[mode]) * 60 + OVERHEAD[mode]
  return { minutes: Math.max(5, Math.round(raw / 5) * 5), mode, km: Math.round(km * 10) / 10 }
}

export const modeLabel: Record<Mode, string> = {
  walk: 'walk',
  transit: 'train or bus',
  ride: 'taxi',
}

export type LongMode = 'road' | 'rail' | 'flight'

/**
 * Getting between cities. Long routes are straighter than city streets, so a
 * smaller detour factor — but the overheads are much larger: stations, or an
 * airport at both ends.
 */
export function interCityMinutes(a: Point, b: Point): { minutes: number; mode: LongMode; km: number } {
  const km = haversineKm(a, b) * 1.25
  // 400km, not 250: KL to Penang is a train in this part of the world.
  const mode: LongMode = km < 30 ? 'road' : km < 400 ? 'rail' : 'flight'
  const speed = { road: 55, rail: 90, flight: 700 }[mode] // ETS-style intercity rail
  const overhead = { road: 20, rail: 45, flight: 210 }[mode] // station or airport, both ends
  const minutes = Math.max(20, Math.round(((km / speed) * 60 + overhead) / 5) * 5)
  return { minutes, mode, km: Math.round(km) }
}

export const longModeLabel: Record<LongMode, string> = {
  road: 'by road',
  rail: 'by train',
  flight: 'by air',
}

/** "1h 20m" — how people actually say a journey length. */
export function duration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`
}
