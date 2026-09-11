import { useMemo, useState } from 'react'
import { Check, ClipboardPaste, Sparkles } from 'lucide-react'
import { Button, Card } from '../components/ui'
import { Pet } from '../components/Pet'
import { parseList, type ImportedLine } from '../engine/importList'
import type { Place } from '../data/mockData'

const SAMPLE = `Day 1
- Kek Lok Si Temple
- Chulia Street hawkers (go after 7pm)

Day 2
1. Penang Peranakan Mansion
2. Armenian Street murals - Sarah says skip the queue`

/**
 * The way people who already planned in a spreadsheet or group chat get in.
 * Paste the list, we match what we know and keep the rest as your own.
 */
export default function ImportList({
  places,
  cities,
  onImport,
}: {
  places: Place[]
  cities: string[]
  onImport: (lines: ImportedLine[]) => void
}) {
  const [text, setText] = useState('')
  const lines = useMemo(() => parseList(text, places, cities), [text, places, cities])
  const known = lines.filter((l) => l.match).length
  const fresh = lines.length - known

  return (
    <div className="pb-2">
      <div className="mb-3 flex items-start gap-3">
        <Pet emotion="happy" size={50} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “Already planned somewhere else? Paste it here — a sheet, a group chat, your notes. I'll sort out the
            times.”
          </p>
        </Card>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={SAMPLE}
        className="w-full resize-none rounded-2xl border-2 border-black/10 bg-white px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink outline-none focus:border-moss-dark placeholder:text-ink-soft/50"
      />

      {text.trim() === '' && (
        <button
          onClick={() => setText(SAMPLE)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-moss-dark/40 py-2 text-[12px] font-bold text-moss-dark"
        >
          <ClipboardPaste size={13} /> Try an example list
        </button>
      )}

      {lines.length > 0 && (
        <>
          <p className="mb-1.5 mt-3 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
            {lines.length} found · {known} we know · {fresh} new
          </p>
          <div className="flex flex-col gap-1.5">
            {lines.map((l, i) => (
              <div
                key={`${l.raw}-${i}`}
                className={`flex items-center gap-2 rounded-2xl px-2.5 py-2 ${
                  l.match ? 'bg-sage-light/60' : 'bg-sun/15'
                }`}
              >
                <span className="text-base">{l.match?.image ?? '📍'}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-extrabold text-ink">{l.match?.name ?? l.name}</p>
                  {l.note && <p className="truncate text-[10px] text-ink-soft">{l.note}</p>}
                </div>
                {l.day && (
                  <span className="shrink-0 rounded-lg bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-moss-dark">
                    Day {l.day}
                  </span>
                )}
                <span
                  className={`shrink-0 text-[9px] font-extrabold uppercase ${
                    l.match ? 'text-moss-dark' : 'text-[#9c6a12]'
                  }`}
                >
                  {l.match ? 'matched' : 'new'}
                </span>
              </div>
            ))}
          </div>

          <Button size="lg" className="mt-3 w-full" onClick={() => onImport(lines)}>
            <Check size={16} /> Add {lines.length} to my trip
          </Button>
          <p className="mt-1.5 flex items-center justify-center gap-1 text-center text-[11px] font-semibold text-ink-soft">
            <Sparkles size={11} /> Times get worked out from opening hours — you can move anything after.
          </p>
        </>
      )}
    </div>
  )
}
