import type { PetEmotion } from './components/Pet'

export type SheetId =
  | 'trips'
  | 'settings'
  | 'share'
  | 'newtrip'
  | 'group'
  | 'places'
  | 'suggestions'
  | 'budget'
  | 'repair'
  | 'flight'
  | 'game'

export interface SheetMeta {
  title: string
  subtitle?: string
  pet: PetEmotion
  petMessage: string
}

/**
 * Every panel that used to be a top-level step. Keeping the copy here
 * means a screen never has to know whether it is a page or a drawer.
 */
export const SHEETS: Record<SheetId, SheetMeta> = {
  trips: {
    title: 'Your trips',
    subtitle: 'Switch workspace, or start a new one',
    pet: 'happy',
    petMessage: 'Which trip are we working on?',
  },
  settings: {
    title: 'Trip settings',
    subtitle: 'Change anything, any time',
    pet: 'neutral',
    petMessage: 'Plans change. Nothing here is locked.',
  },
  share: {
    title: 'Share this trip',
    subtitle: 'Send a view-only link',
    pet: 'happy',
    petMessage: 'Want to show someone the plan?',
  },
  newtrip: {
    title: 'New trip',
    subtitle: 'Destination, dates, who is coming, budget',
    pet: 'happy',
    petMessage: 'Where are we off to next?',
  },
  group: {
    title: "Who's coming",
    subtitle: 'What everyone wants out of this trip',
    pet: 'shy',
    petMessage: "Everyone wants something different — let's find the overlap.",
  },
  places: {
    title: 'Add places',
    subtitle: 'AI picks and real traveller recommendations',
    pet: 'happy',
    petMessage: 'Real travellers shared some hidden gems here!',
  },
  suggestions: {
    title: 'Start from a draft',
    subtitle: 'Three versions — take one and change anything',
    pet: 'happy',
    petMessage: 'I made 3 versions of your trip — pick your favourite.',
  },
  budget: {
    title: 'Money',
    subtitle: 'Shared spend and who owes what',
    pet: 'neutral',
    petMessage: "Let's make sure everyone pays their fair share.",
  },
  repair: {
    title: 'Keeping your plan',
    subtitle: 'Rearranged before anything new was suggested',
    pet: 'shy',
    petMessage: 'I found a way to keep your original plan — just reordered!',
  },
  flight: {
    title: 'Flight status',
    subtitle: 'Return flight · KUL',
    pet: 'scared',
    petMessage: 'Your return flight just got delayed 5 hours!',
  },
  game: {
    title: 'Colour Walk',
    subtitle: 'Something to do while the rain passes',
    pet: 'happy',
    petMessage: 'Two hours free — want to play something while we wait it out?',
  },
}
