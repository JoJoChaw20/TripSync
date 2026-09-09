import { AnimatePresence, motion } from 'framer-motion'
import { Pet, type PetEmotion } from './Pet'

export function PetBubble({ emotion, message }: { emotion: PetEmotion; message: string }) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex items-end gap-3 sm:bottom-8 sm:right-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto mb-2 hidden max-w-[220px] rounded-2xl rounded-br-sm border border-black/[0.06] bg-white px-4 py-3 text-[13px] font-semibold leading-snug text-ink shadow-pop sm:block"
        >
          {message}
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-auto rounded-full bg-white/70 p-1 shadow-soft backdrop-blur">
        <Pet emotion={emotion} size={64} />
      </div>
    </div>
  )
}
