import { useState } from 'react'
import { Check, Copy, Eye, Link2, Pencil } from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { Pet } from '../components/Pet'
import { travelers, type TripSummary } from '../data/mockData'

/**
 * Sharing without accounts: anyone with the link opens the trip read-only.
 * Editing stays with the people you invited.
 */
export default function Share({ trip }: { trip: TripSummary }) {
  const [copied, setCopied] = useState(false)
  const link = `${window.location.origin}${window.location.pathname}?view=1&trip=${trip.id}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* clipboard blocked — the field below is selectable either way */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pb-2">
      <div className="mb-4 flex items-start gap-3">
        <Pet emotion="happy" size={50} bob={false} />
        <Card className="flex-1 rounded-tl-sm p-3">
          <p className="text-[13px] leading-relaxed text-ink">
            “Send this to anyone — parents, friends who aren't coming. They'll see the plan, but they can't
            change it.”
          </p>
        </Card>
      </div>

      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">
        <Link2 size={12} /> View-only link
      </p>
      <div className="flex items-center gap-2 rounded-2xl border-2 border-moss/30 bg-white px-3 py-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          aria-label="View-only link"
          className="min-w-0 flex-1 bg-transparent text-[12px] font-semibold text-ink-soft outline-none"
        />
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1 rounded-full bg-moss-dark px-3 py-1.5 text-[12px] font-extrabold text-white"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="mt-1.5 pl-1 text-[11px] font-semibold text-ink-soft">
        Anyone with this link can see the itinerary and budget. They can't add, move or delete anything.
      </p>

      <p className="mb-1.5 mt-5 text-[11px] font-extrabold uppercase tracking-wide text-ink-soft">Who has access</p>
      <div className="flex flex-col gap-2">
        {travelers.slice(0, trip.travelerCount).map((t, i) => (
          <Card key={t.id} className="flex items-center gap-3 p-2.5">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: `${t.color}66` }}
            >
              {t.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-extrabold text-ink">{t.name}</p>
              <p className="truncate text-[11px] font-semibold text-ink-soft">{t.preferences.join(' · ')}</p>
            </div>
            <Pill tone={i === 0 ? 'sage' : 'sky'}>
              {i === 0 ? <Pencil size={10} /> : <Eye size={10} />}
              {i === 0 ? 'Owner' : 'Can edit'}
            </Pill>
          </Card>
        ))}
      </div>
    </div>
  )
}
