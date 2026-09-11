import { places } from '../data/mockData'
import { replan, retimeDay } from './replan'
import { parseList } from './importList'
import { missingMeals } from './meals'
import { buildPlan } from './buildPlan'
import { trips } from '../data/mockData'
import type { PlanDay } from './types'

const TRAVELERS = ['t1', 't2', 't3', 't4']
const NEWLINE = String.fromCharCode(10)

/**
 * The smallest thing that fails if the solver breaks. Runs on every dev
 * start (see main.tsx) so a 3am edit can't quietly gut the engine.
 */
export function selfCheck() {
  const ok = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`replan selfCheck failed: ${msg}`)
  }

  // Day 2 mirrors the demo: museum, outdoor park at 14:00, dinner.
  const base = (): PlanDay[] => [
    { day: 1, city: 'Guangzhou', items: [{ placeId: 'p1', startMin: 900 }] },
    {
      day: 2,
      city: 'Guangzhou',
      items: [
        { placeId: 'p2', startMin: 570 },
        { placeId: 'p5', startMin: 840 },
        { placeId: 'p4', startMin: 1140 },
      ],
    },
    { day: 3, city: 'Guangzhou', items: [{ placeId: 'p8', startMin: 600 }] },
    { day: 4, city: 'Guangzhou', items: [{ placeId: 'p6', startMin: 660 }] },
  ]

  // 1 — rain must not lose the outdoor park, and must not touch indoor stops.
  const rain = replan(base(), { kind: 'weather', day: 2, fromMin: 900, toMin: 1080 }, places, TRAVELERS)
  ok(rain.dropped.length === 0, 'rain dropped a stop that had somewhere to go')
  ok(rain.preserved.includes('p5'), 'the outdoor park was not preserved')
  ok(rain.moves.some((m) => m.placeId === 'p5'), 'the park was never actually moved')
  ok(rain.preserved.includes('p2') && rain.preserved.includes('p4'), 'indoor stops were disturbed')

  // 2 — wherever it landed, it is no longer inside the rain window.
  const moved = rain.plan.flatMap((d) => d.items.map((i) => ({ ...i, day: d.day }))).find((i) => i.placeId === 'p5')!
  const park = places.find((p) => p.id === 'p5')!
  const stillWet = moved.day === 2 && moved.startMin < 1080 && moved.startMin + park.duration > 900
  ok(!stillWet, 'the park is still scheduled in the rain')

  // 3 — opening hours are respected everywhere.
  for (const d of rain.plan)
    for (const i of d.items) {
      const p = places.find((x) => x.id === i.placeId)!
      ok(i.startMin >= p.opens && i.startMin + p.duration <= p.closes, `${p.name} scheduled outside its hours`)
    }

  // 4 — fallbacks appear only when something genuinely could not be saved.
  ok(rain.fallbacks.length === 0, 'suggested new places when nothing was dropped')
  const noRoom = replan(
    [{ day: 1, city: 'Guangzhou', items: [{ placeId: 'p7', startMin: 1100 }] }],
    { kind: 'weather', day: 1, fromMin: 1080, toMin: 1410 },
    places,
    TRAVELERS,
  )
  ok(noRoom.dropped.includes('p7'), 'a stop with nowhere to go was not reported as dropped')
  ok(noRoom.fallbacks.length > 0, 'no alternatives offered after a drop')

  // 5 — a closure removes only the closed place, and never "fixes" it by
  // picking another hour on the same day.
  const closed = replan(base(), { kind: 'closure', day: 3, placeId: 'p8' }, places, TRAVELERS)
  ok(closed.preserved.includes('p2'), 'closure disturbed an unrelated stop')
  const museum = closed.moves.find((m) => m.placeId === 'p8')
  ok(!museum || museum.toDay !== 3, 'a closed place was rescheduled to the same day it is shut')

  // 6 — a non-weather swap must not claim the replacement is indoors.
  const delayed = replan(base(), { kind: 'delay', day: 4, fromMin: 600 }, places, TRAVELERS)
  ok(
    delayed.moves.every((m) => !m.why.includes("it's indoors")),
    'a delay was explained as if it were rain',
  )

  // 7 — nothing is ever rescheduled into a day that has already passed, and a
  // washout on the final day has nowhere to go, so it drops and offers options.
  // The last day has to hold something OUTDOOR for a washout to bite at all.
  const finale: PlanDay[] = [
    { day: 1, city: 'Guangzhou', items: [{ placeId: 'p2', startMin: 570 }] },
    { day: 2, city: 'Guangzhou', items: [{ placeId: 'p1', startMin: 720 }] },
  ]
  const lastDay = replan(finale, { kind: 'weather', day: 2, fromMin: 480, toMin: 1320 }, places, TRAVELERS)
  ok(
    lastDay.moves.every((m) => m.toDay >= m.fromDay),
    'a stop was rescheduled backwards in time',
  )
  ok(lastDay.dropped.length > 0, 'a final-day washout somehow lost nothing')
  ok(lastDay.fallbacks.length > 0, 'no alternatives offered for the final-day washout')

  // 8 — preserving everything is not enough: if the disruption leaves a long
  // hole in the day, say so and offer somewhere indoors to spend it.
  const hole = replan(base(), { kind: 'weather', day: 2, fromMin: 900, toMin: 1080 }, places, TRAVELERS)
  ok(hole.dropped.length === 0, 'expected a clean repair for the gap check')
  ok(hole.gaps.length > 0, 'a multi-hour hole left by the rain was not reported')
  ok(
    hole.gaps.every((g) => g.toMin - g.fromMin >= 120),
    'a trivial gap was reported as dead time',
  )
  ok(hole.gaps.some((g) => g.suggestions.length > 0), 'no indoor ideas offered for the empty window')

  // 9 — dragging stops into a new order re-times them in sequence, and a stop
  // dropped where it cannot open is reported rather than quietly faked.
  const byId = (id: string) => places.find((p) => p.id === id)
  const good = retimeDay(['p2', 'p4', 'p7'], byId)
  ok(good.items.length === 3, 'retime lost a stop')
  ok(
    good.items.every((it, i) => i === 0 || it.startMin > good.items[i - 1].startMin),
    'retimed stops are not in ascending order',
  )
  ok(good.warnings.length === 0, 'a workable order was flagged as impossible')

  // Drag the night market to the front and it still cannot start before 18:00,
  // so everything behind it is pushed past closing time. The stop the user
  // moved is fine; the knock-on is what must be reported.
  const bad = retimeDay(['p7', 'p2', 'p4'], byId)
  ok(bad.items[0].startMin === 1080, 'the night market was scheduled before it opens')
  ok(bad.warnings.length >= 2, 'the knock-on from an impossible order was not reported')
  ok(
    bad.warnings.some((w) => w.placeId === 'p2'),
    'a stop pushed past its closing time was not flagged',
  )

  // 10 — a pasted list keeps day headings, strips bullets and numbering,
  // matches what we know, and never silently drops a line it doesn't.
  const pasted = parseList(
    [
      'Day 1',
      '- Liwan Lake Park',
      '2. Chen Clan Ancestral Hall (arrive early)',
      '',
      'Day 3: Guangzhou Museum - free entry',
      'Some place we have never heard of',
    ].join(NEWLINE),
    places,
    ['Guangzhou'],
  )
  ok(pasted.length === 4, 'a pasted line was dropped')
  ok(pasted[0].day === 1 && pasted[1].day === 1, 'a day heading did not carry to the lines under it')
  ok(pasted[1].match?.id === 'p2', 'a numbered line with a bracketed note did not match')
  ok(pasted[1].note === 'arrive early', 'a bracketed note was not picked up')
  ok(pasted[2].day === 3 && pasted[2].match?.id === 'p8', 'a "Day N:" prefix did not resolve')
  ok(pasted[3].match === undefined, 'an unknown place was matched to something')
  ok(pasted[3].name === 'Some place we have never heard of', 'an unknown place lost its name')

  // 11 — a real trip never schedules before you land, or after you must
  // leave for the airport.
  const gz = trips.find((t) => t.id === 'gz2026')!
  const real = buildPlan(gz, places)
  for (const d of real.days) {
    for (const it of d.items) {
      const pl = places.find((x) => x.id === it.placeId)!
      ok(it.startMin >= (d.earliest ?? 0), `day ${d.day}: ${pl.name} starts before the day is open`)
      ok(
        it.startMin + pl.duration <= (d.latest ?? 24 * 60),
        `day ${d.day}: ${pl.name} runs past the cut-off`,
      )
    }
  }
  const arrival = real.days[0]
  ok((arrival.earliest ?? 0) > (gz.arrive ?? 0), 'the arrival day ignores the landing time')
  const departure = real.days[real.days.length - 1]
  ok((departure.latest ?? 1440) < (gz.depart ?? 1440), 'the departure day ignores the flight')

  // 12 — a day of sightseeing with nothing to eat gets called out; a day that
  // already has a meal in the window does not; an empty day is left alone.
  const byPlace = (id: string) => places.find((x) => x.id === id)
  const hungry = missingMeals(
    { day: 1, city: 'Guangzhou', items: [{ placeId: 'p2', startMin: 600 }, { placeId: 'p8', startMin: 810 }] },
    places,
    byPlace,
  )
  ok(hungry.some((m) => m.meal === 'lunch'), 'a lunchless day was not flagged')
  ok(hungry.every((m) => m.suggestions.length > 0), 'no open place suggested for a missing meal')

  const fed = missingMeals(
    { day: 1, city: 'Guangzhou', items: [{ placeId: 'p4', startMin: 720 }] },
    places,
    byPlace,
  )
  ok(!fed.some((m) => m.meal === 'lunch'), 'a day with lunch was told it had none')

  const emptyDay = missingMeals({ day: 1, city: 'Guangzhou', items: [] }, places, byPlace)
  ok(emptyDay.length === 0, 'an empty day was nagged about meals')

  // landing mid-afternoon means lunch was never on the cards
  const late = missingMeals(
    { day: 1, city: 'Guangzhou', earliest: 15 * 60, items: [{ placeId: 'p2', startMin: 930 }] },
    places,
    byPlace,
  )
  ok(!late.some((m) => m.meal === 'lunch'), 'lunch was expected on a day that starts at 3pm')

  return true
}
