import { motion } from 'framer-motion'
import { Pet, type PetEmotion } from './Pet'
import { Card } from './ui'

export function MochiNote({ emotion, message }: { emotion: PetEmotion; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-6 flex items-start gap-3"
    >
      <Pet emotion={emotion} size={56} bob={false} />
      <Card className="flex-1 rounded-tl-sm p-4">
        <p className="text-[14px] leading-relaxed text-ink">{message}</p>
      </Card>
    </motion.div>
  )
}
