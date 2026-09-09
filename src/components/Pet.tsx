import { motion } from 'framer-motion'

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

/**
 * Mochi — the TripSync AI travel pet.
 * A hand-built SVG rabbit-in-a-chick-hat, redrawn in the brand palette so it
 * shares one visual system with the rest of the product (rather than an
 * imported illustration).
 */
export function Pet({ emotion = 'neutral', size = 120, className = '', bob = true }: PetProps) {
  const cheeksOnFace = emotion === 'shy'

  return (
    <motion.div
      className={className}
      style={{ width: size, height: size }}
      animate={bob ? { y: [0, -5, 0] } : undefined}
      transition={bob ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <svg viewBox="0 0 200 232" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="petShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4a4238" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4a4238" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="222" rx="46" ry="8" fill="url(#petShadow)" />

        {/* Ears (behind head) */}
        <g>
          <path
            d="M62 92 C 40 60, 42 18, 60 6 C 74 -2, 78 20, 74 44 C 71 64, 70 82, 70 96 Z"
            fill="#FBF6EC"
            stroke="#4a4238"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M64 84 C 50 60, 52 30, 63 18 C 70 32, 68 60, 68 86 Z"
            fill="#F3C9D6"
          />
          <path
            d="M138 92 C 160 60, 158 18, 140 6 C 126 -2, 122 20, 126 44 C 129 64, 130 82, 130 96 Z"
            fill="#FBF6EC"
            stroke="#4a4238"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M136 84 C 150 60, 148 30, 137 18 C 130 32, 132 60, 132 86 Z"
            fill="#F3C9D6"
          />
        </g>

        {/* Emotion FX behind/around head */}
        <EmotionFX emotion={emotion} />

        {/* Body */}
        <g>
          {/* skirt */}
          <path
            d="M66 190 C 66 175, 134 175, 134 190 L 142 220 C 110 230, 90 230, 58 220 Z"
            fill="var(--color-blush, #e7cbd7)"
            stroke="#4a4238"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M58 220 C 76 225, 124 225, 142 220 L 140 226 C 122 231, 78 231, 60 226 Z"
            fill="#fff"
            stroke="#4a4238"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* shirt/torso */}
          <path
            d="M68 152 C 68 138, 132 138, 132 152 L 134 192 L 66 192 Z"
            fill="#FBF6EC"
            stroke="#4a4238"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* stripes */}
          {[160, 170, 180].map((y) => (
            <path key={y} d={`M69 ${y} L131 ${y}`} stroke="var(--color-sage-light, #e9f2d9)" strokeWidth="6" />
          ))}
          {/* collar */}
          <path d="M86 140 L100 156 L114 140" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="100" cy="168" r="2.6" fill="#4a4238" />
          <circle cx="100" cy="180" r="2.6" fill="#4a4238" />

          {/* arms */}
          <Arms emotion={emotion} />
        </g>

        {/* Head */}
        <g>
          <ellipse cx="100" cy="112" rx="48" ry="44" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
          {/* cheeks blush (subtle, always present) */}
          <ellipse cx="70" cy="122" rx="9" ry="6" fill="#F3AFC0" opacity={cheeksOnFace ? 0.95 : 0.55} />
          <ellipse cx="130" cy="122" rx="9" ry="6" fill="#F3AFC0" opacity={cheeksOnFace ? 0.95 : 0.55} />

          <Face emotion={emotion} />
        </g>

        {/* Chick hat */}
        <g>
          <path
            d="M58 78 C 58 46, 142 46, 142 78 C 142 90, 128 90, 100 90 C 72 90, 58 90, 58 78 Z"
            fill="var(--color-sun, #f6c945)"
            stroke="#4a4238"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M56 80 C 80 88, 120 88, 144 80" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" />
          {/* beak tuft */}
          <path d="M92 47 L100 32 L108 47 Z" fill="var(--color-coral, #ef8b74)" stroke="#4a4238" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      </svg>
    </motion.div>
  )
}

function Arms({ emotion }: { emotion: PetEmotion }) {
  if (emotion === 'shy') {
    return (
      <>
        <path d="M70 158 C 52 158, 50 138, 60 128" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="126" r="9" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
        <path d="M130 158 C 148 158, 150 138, 140 128" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" />
        <circle cx="140" cy="126" r="9" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
      </>
    )
  }
  if (emotion === 'scared') {
    return (
      <>
        <path d="M70 160 C 48 150, 44 128, 52 112" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" />
        <circle cx="53" cy="110" r="9" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
        <path d="M130 160 C 152 150, 156 128, 148 112" fill="none" stroke="#4a4238" strokeWidth="3" strokeLinecap="round" />
        <circle cx="147" cy="110" r="9" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
      </>
    )
  }
  return (
    <>
      <circle cx="66" cy="168" r="10" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
      <circle cx="134" cy="168" r="10" fill="#FBF6EC" stroke="#4a4238" strokeWidth="3" />
    </>
  )
}

function Face({ emotion }: { emotion: PetEmotion }) {
  switch (emotion) {
    case 'happy':
      return (
        <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M78 108 C 82 100, 92 100, 96 108" />
          <path d="M104 108 C 108 100, 118 100, 122 108" />
          <path d="M92 122 C 96 128, 104 128, 108 122" />
        </g>
      )
    case 'sad':
      return (
        <g>
          <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
            <path d="M80 106 C 84 112, 92 112, 96 106" />
            <path d="M104 106 C 108 112, 116 112, 120 106" />
            <path d="M92 128 C 96 122, 104 122, 108 128" />
          </g>
          <path d="M82 112 C 80 120, 78 124, 74 126" stroke="#8ec5d6" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M118 112 C 120 120, 122 124, 126 126" stroke="#8ec5d6" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
      )
    case 'angry':
      return (
        <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M76 100 L96 106" />
          <path d="M124 100 L104 106" />
          <path d="M84 112 h8" />
          <path d="M108 112 h8" />
          <path d="M94 126 h12" />
        </g>
      )
    case 'aggrieved':
      return (
        <g>
          <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
            <path d="M78 104 C 80 112, 86 114, 92 110" />
            <path d="M122 104 C 120 112, 114 114, 108 110" />
            <path d="M94 124 C 98 120, 102 120, 106 124" />
          </g>
          <ellipse cx="80" cy="116" rx="3" ry="5" fill="#8ec5d6" />
          <ellipse cx="120" cy="116" rx="3" ry="5" fill="#8ec5d6" />
        </g>
      )
    case 'shy':
      return (
        <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <path d="M78 108 C 82 101, 92 101, 96 108" />
          <path d="M104 108 C 108 101, 118 101, 122 108" />
          <path d="M96 124 h8" />
        </g>
      )
    case 'scared':
      return (
        <g>
          <circle cx="86" cy="110" r="7" fill="#fff" stroke="#4a4238" strokeWidth="3" />
          <circle cx="114" cy="110" r="7" fill="#fff" stroke="#4a4238" strokeWidth="3" />
          <circle cx="87" cy="111" r="2.6" fill="#4a4238" />
          <circle cx="115" cy="111" r="2.6" fill="#4a4238" />
          <ellipse cx="100" cy="128" rx="5" ry="6" fill="#4a4238" opacity="0.85" />
        </g>
      )
    default:
      return (
        <g stroke="#4a4238" strokeWidth="3.4" strokeLinecap="round" fill="none">
          <circle cx="86" cy="110" r="2.6" fill="#4a4238" stroke="none" />
          <circle cx="114" cy="110" r="2.6" fill="#4a4238" stroke="none" />
          <path d="M94 124 C 98 127, 102 127, 106 124" />
        </g>
      )
  }
}

function EmotionFX({ emotion }: { emotion: PetEmotion }) {
  if (emotion === 'happy') {
    return (
      <g fill="var(--color-blush-dark, #d9a9bd)">
        <Heart x={30} y={30} s={0.9} />
        <Heart x={162} y={22} s={0.7} />
      </g>
    )
  }
  if (emotion === 'sad') {
    return (
      <g>
        <ellipse cx="100" cy="18" rx="20" ry="10" fill="#B9C4CC" stroke="#4a4238" strokeWidth="2" />
        <ellipse cx="86" cy="14" rx="13" ry="9" fill="#B9C4CC" stroke="#4a4238" strokeWidth="2" />
        <ellipse cx="116" cy="14" rx="13" ry="9" fill="#B9C4CC" stroke="#4a4238" strokeWidth="2" />
        {[76, 100, 124].map((x, i) => (
          <path
            key={x}
            d={`M${x} 30 q -3 8 0 14`}
            stroke="#8ec5d6"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="animate-blink"
            style={{ animation: `rain-fall 1.4s ${i * 0.25}s ease-in infinite` }}
          />
        ))}
      </g>
    )
  }
  if (emotion === 'angry') {
    return (
      <g stroke="#c85a4a" strokeWidth="3" strokeLinecap="round">
        <path d="M158 30 l10 10 M168 30 l-10 10" />
        <path d="M28 34 l8 8 M36 34 l-8 8" />
      </g>
    )
  }
  if (emotion === 'scared') {
    return (
      <g fill="#8ec5d6" opacity="0.9">
        <path d="M156 44 q4 6 0 11 q-4 -2 -4 -6 q0 -4 4 -5 Z" />
        <path d="M168 58 q3 5 0 9 q-3 -2 -3 -5 q0 -3 3 -4 Z" />
        <path d="M44 44 q4 6 0 11 q-4 -2 -4 -6 q0 -4 4 -5 Z" />
      </g>
    )
  }
  return null
}

function Heart({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="animate-float">
      <path d="M0 6 C -8 -2, -16 6, 0 18 C 16 6, 8 -2, 0 6 Z" />
    </g>
  )
}
