import type { Place } from '../data/mockData'

export interface ImportedLine {
  /** What the user actually typed, kept so we can show it back to them. */
  raw: string
  name: string
  /** Only set when the list said so — "Day 2:" or a "Day 2" heading. */
  day?: number
  note?: string
  match?: Place
}

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** "Day 3", "DAY 3 -", "day 3:" on its own line. */
const dayHeading = (line: string) => {
  const m = line.match(/^day\s*(\d{1,2})\s*[:.\-–—]?\s*$/i)
  return m ? Number(m[1]) : undefined
}

/** "Day 2: Wat Pho" — a day and a place on the same line. */
const dayPrefix = (line: string) => {
  const m = line.match(/^day\s*(\d{1,2})\s*[:.\-–—]\s*(.+)$/i)
  return m ? { day: Number(m[1]), rest: m[2] } : undefined
}

/**
 * Turn a pasted list into places. Handles the shapes people actually have:
 * bullets, numbers, "Day 2:" prefixes, day headings, and a trailing note
 * after a dash or in brackets.
 *
 * Anything we don't recognise is still kept — it becomes a place of the
 * user's own rather than being silently dropped.
 */
export function parseList(text: string, places: Place[], cities: string[]): ImportedLine[] {
  const pool = places.filter((p) => cities.some((c) => c.toLowerCase() === p.city.toLowerCase()))
  const out: ImportedLine[] = []
  let currentDay: number | undefined

  for (const rawLine of text.split(/\r?\n/)) {
    const raw = rawLine.trim()
    if (!raw) continue

    const heading = dayHeading(raw)
    if (heading !== undefined) {
      currentDay = heading
      continue
    }

    let body = raw.replace(/^[-*•·—–]\s*/, '').replace(/^\d{1,2}[.)]\s*/, '')
    let day = currentDay

    const prefixed = dayPrefix(body)
    if (prefixed) {
      // "Day 2: Wat Pho" also means the lines after it are day 2.
      day = prefixed.day
      currentDay = prefixed.day
      body = prefixed.rest
    }

    // a trailing note: "Wat Pho - go early" or "Wat Pho (go early)"
    let note: string | undefined
    const dashed = body.match(/^(.+?)\s+[-–—]\s+(.+)$/)
    if (dashed) {
      body = dashed[1]
      note = dashed[2]
    }
    const bracketed = body.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
    if (bracketed) {
      body = bracketed[1]
      note = note ?? bracketed[2]
    }

    const name = body.trim()
    if (!name) continue

    const key = normalise(name)
    const match =
      pool.find((p) => normalise(p.name) === key) ??
      pool.find((p) => normalise(p.name).startsWith(key) || key.startsWith(normalise(p.name))) ??
      pool.find((p) => normalise(p.name).includes(key) || key.includes(normalise(p.name)))

    out.push({ raw, name, day, note, match })
  }

  return out
}
