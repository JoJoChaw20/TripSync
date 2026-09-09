import mochiIcon from '../assets/icon/mochi-icon.png'

interface AppIconProps {
  size?: number
  className?: string
}

/**
 * Mochi holding a map — TripSync's static brand mark (header logo, hero art).
 * Distinct from the reactive Pet component, which swaps expressions.
 */
export function AppIcon({ size = 120, className = '' }: AppIconProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      <img
        src={mochiIcon}
        alt="TripSync — Mochi with a map"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}
