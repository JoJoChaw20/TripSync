import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-[15px]',
    lg: 'px-7 py-3.5 text-base',
  }
  const variants = {
    primary: 'bg-moss-dark text-white shadow-soft hover:brightness-105 hover:shadow-pop',
    secondary: 'bg-blush text-ink shadow-soft hover:brightness-105',
    outline: 'border-2 border-moss-dark/30 text-ink hover:border-moss-dark hover:bg-sage-light',
    ghost: 'text-ink-soft hover:bg-black/5',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-black/[0.06] bg-white/80 backdrop-blur-sm shadow-soft ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Pill({
  children,
  tone = 'sage',
  className = '',
}: {
  children: ReactNode
  tone?: 'sage' | 'blush' | 'sun' | 'sky' | 'ink'
  className?: string
}) {
  const tones = {
    sage: 'bg-sage-light text-moss-dark',
    blush: 'bg-blush/60 text-[#9c5a72]',
    sun: 'bg-sun/25 text-[#9c6a12]',
    sky: 'bg-sky/25 text-[#3d6d7c]',
    ink: 'bg-ink/10 text-ink',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function SectionLabel({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="mb-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-moss-dark">{eyebrow}</p>}
      <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>}
    </div>
  )
}

export function ScoreRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const color = value >= 90 ? '#8ba863' : value >= 80 ? '#e8a93a' : '#d9a9bd'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee7d6" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-ink">{value}</div>
    </div>
  )
}

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i === current ? 'w-6 bg-moss-dark' : i < current ? 'w-1.5 bg-moss-dark/50' : 'w-1.5 bg-black/10'
          }`}
        />
      ))}
    </div>
  )
}
