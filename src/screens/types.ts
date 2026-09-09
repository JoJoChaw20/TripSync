import type { PetEmotion } from '../components/Pet'

export interface ScreenProps {
  onNext: () => void
  onJump: (i: number) => void
  petEmotion: PetEmotion
  petMessage: string
}
