import { ClipboardList, MapPin, Sparkles } from 'lucide-react'
import { AppIcon } from '../components/AppIcon'
import { Card } from '../components/ui'

/**
 * What you see before you have anything. Not a stranger's itinerary, and not
 * a marketing page — three ways in, in the order people actually arrive.
 */
export default function ColdStart({
  onNew,
  onPaste,
  onSample,
}: {
  onNew: () => void
  onPaste: () => void
  onSample: () => void
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-1 text-center">
      <AppIcon size={116} />

      <h1 className="mt-4 font-display text-2xl font-extrabold leading-tight text-ink">Where are you going?</h1>
      <p className="mx-auto mt-1.5 max-w-[30ch] text-[13px] leading-snug text-ink-soft">
        Plan it here, or bring a plan you already have. Mochi keeps it working when the weather doesn't.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2">
        <button
          onClick={onNew}
          className="flex w-full items-center gap-3 rounded-3xl bg-moss-dark p-3.5 text-left text-white shadow-soft transition hover:brightness-105"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <MapPin size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-extrabold">Start a trip</span>
            <span className="block text-[11px] font-semibold opacity-90">A city and a few days is enough</span>
          </span>
        </button>

        <button onClick={onPaste} className="text-left">
          <Card className="flex items-center gap-3 p-3.5 transition hover:shadow-pop">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage-light text-moss-dark">
              <ClipboardList size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-extrabold text-ink">Paste a list you already have</span>
              <span className="block text-[11px] font-semibold text-ink-soft">
                From a sheet, a group chat, your notes
              </span>
            </span>
          </Card>
        </button>
      </div>

      <button
        onClick={onSample}
        className="mt-5 flex items-center gap-1.5 text-[12px] font-bold text-moss-dark underline decoration-dotted underline-offset-4"
      >
        <Sparkles size={13} /> Or look around a sample trip
      </button>
    </div>
  )
}
