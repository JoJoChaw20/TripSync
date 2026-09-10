import { useMemo, useState } from 'react'
import { Wallet, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Button, Card, SectionLabel , ScreenFooter } from '../components/ui'
import { MochiNote } from '../components/MochiNote'
import { expenses, travelers } from '../data/mockData'
import type { ScreenProps } from './types'

function travelerById(id: string) {
  return travelers.find((t) => t.id === id)!
}

function computeSettlements() {
  const balance = new Map<string, number>()
  travelers.forEach((t) => balance.set(t.id, 0))

  expenses.forEach((e) => {
    const share = e.amount / e.split.length
    balance.set(e.paidBy, (balance.get(e.paidBy) ?? 0) + e.amount)
    e.split.forEach((id) => balance.set(id, (balance.get(id) ?? 0) - share))
  })

  const debtors = Array.from(balance.entries()).filter(([, v]) => v < -0.5).map(([id, v]) => ({ id, amt: -v })).sort((a, b) => b.amt - a.amt)
  const creditors = Array.from(balance.entries()).filter(([, v]) => v > 0.5).map(([id, v]) => ({ id, amt: v })).sort((a, b) => b.amt - a.amt)

  const settlements: { from: string; to: string; amount: number }[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt)
    settlements.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(pay) })
    debtors[i].amt -= pay
    creditors[j].amt -= pay
    if (debtors[i].amt < 0.5) i++
    if (creditors[j].amt < 0.5) j++
  }

  return { balance, settlements }
}

export default function Expenses({
  count = 4, onNext, petEmotion, petMessage }: ScreenProps & { count?: number }) {
  const { balance, settlements } = useMemo(() => computeSettlements(), [])
  const [settled, setSettled] = useState<number[]>([])
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="mx-auto max-w-4xl">
      <SectionLabel
        title="Group Expense & Cost Splitting"
        subtitle="TripSync tracks who paid what and automatically figures out the smallest number of transfers to settle up — no more spreadsheets."
      />

      <MochiNote emotion={petEmotion} message={petMessage} />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <p className="mb-3 flex items-center justify-between text-sm font-extrabold text-ink">
            <span>Trip expenses</span>
            <span className="text-moss-dark">RM{total.toLocaleString()} total</span>
          </p>
          <div className="space-y-2.5">
            {expenses.map((e) => {
              const payer = travelerById(e.paidBy)
              return (
                <div key={e.id} className="flex items-center gap-3 rounded-2xl bg-sage-light/30 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-soft">{e.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{e.title}</p>
                    <p className="text-[11px] text-ink-soft">
                      Paid by <span className="font-bold" style={{ color: '#8ba863' }}>{payer.emoji} {payer.name}</span> · split {e.split.length} ways
                    </p>
                  </div>
                  <p className="shrink-0 font-display text-sm font-extrabold text-ink">RM{e.amount}</p>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide text-ink-soft">Net balance</p>
            <div className="space-y-2">
              {travelers.slice(0, count).map((t) => {
                const b = Math.round(balance.get(t.id) ?? 0)
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-semibold text-ink">
                      {t.emoji} {t.name}
                    </span>
                    <span className={`font-extrabold ${b > 0 ? 'text-moss-dark' : b < 0 ? 'text-[#c85a4a]' : 'text-ink-soft'}`}>
                      {b > 0 ? `+RM${b}` : b < 0 ? `-RM${Math.abs(b)}` : 'Settled'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-ink-soft">
              <Wallet size={13} /> Suggested settlements
            </p>
            <div className="space-y-2">
              {settlements.map((s, i) => {
                const from = travelerById(s.from)
                const to = travelerById(s.to)
                const done = settled.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => setSettled((arr) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]))}
                    className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold transition ${
                      done ? 'bg-sage-light/60 text-moss-dark line-through' : 'bg-blush/20 text-ink hover:bg-blush/35'
                    }`}
                  >
                    {done ? <CheckCircle2 size={15} className="shrink-0" /> : <Circle size={15} className="shrink-0 text-ink-soft" />}
                    <span className="truncate">{from.name}</span>
                    <ArrowRight size={11} className="shrink-0" />
                    <span className="truncate">{to.name}</span>
                    <span className="ml-auto shrink-0">RM{s.amount}</span>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      <ScreenFooter>
        <Button size="lg" onClick={onNext}>
          Next: Wrap up the trip →
        </Button>
      </ScreenFooter>
    </div>
  )
}
