import { motion } from 'framer-motion'
import happyImg from '../assets/pet/happy.png'
import sadImg from '../assets/pet/sad.png'
import angryImg from '../assets/pet/angry.png'
import aggrievedImg from '../assets/pet/aggrieved.png'
import shyImg from '../assets/pet/shy.png'
import scaredImg from '../assets/pet/scared.png'

export type PetEmotion =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'aggrieved'
  | 'shy'
  | 'scared'
  | 'neutral'

interface PetProps {
  emotion?: PetEmotion
  size?: number
  className?: string
  bob?: boolean
}

const EMOTION_IMAGES: Record<PetEmotion, string> = {
  happy: happyImg,
  sad: sadImg,
  angry: angryImg,
  aggrieved: aggrievedImg,
  shy: shyImg,
  scared: scaredImg,
  neutral: happyImg,
}

/**
 * Mochi — the TripSync AI travel pet, illustrated by the TripSync team.
 */
export function Pet({ emotion = 'neutral', size = 120, className = '', bob = true }: PetProps) {
  return (
    <motion.div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        position: 'relative',
      }}
      animate={bob ? { y: [0, -5, 0] } : undefined}
      transition={bob ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 2,
          left: '50%',
          transform: 'translateX(-50%)',
          width: size * 0.55,
          height: size * 0.12,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(74,66,56,0.18), rgba(74,66,56,0))',
        }}
      />
      <img
        src={EMOTION_IMAGES[emotion]}
        alt={`Mochi feeling ${emotion}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          position: 'relative',
        }}
      />
    </motion.div>
  )
}
