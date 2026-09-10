import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { EmbeddedContext } from './ui'

/**
 * Bottom sheet. Everything that used to be its own destination
 * (preferences, discover, budget, the repair) opens over the current
 * surface instead, so you never navigate away from your trip.
 */
export function Sheet({
  open,
  title,
  subtitle,
  onClose,
  children,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close"
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-ink/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88vh] w-full max-w-[440px] flex-col rounded-t-[28px] bg-cream shadow-pop"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
          >
            <div className="shrink-0 px-5 pb-2 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/15" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-lg font-extrabold leading-tight text-ink">{title}</p>
                  {subtitle && <p className="mt-0.5 text-xs font-semibold text-ink-soft">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close sheet"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/[0.05] text-ink-soft transition hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-moss-dark"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-8 pt-1">
              <EmbeddedContext.Provider value={true}>{children}</EmbeddedContext.Provider>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
