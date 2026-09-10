export interface Traveler {
  id: string
  name: string
  emoji: string
  color: string
  preferences: string[]
}

export const travelers: Traveler[] = [
  { id: 't1', name: 'Wei Jian', emoji: '🧑🏻', color: '#adc485', preferences: ['Food', 'Culture'] },
  { id: 't2', name: 'Mei Lin', emoji: '👩🏻', color: '#e7cbd7', preferences: ['Shopping', 'Nightlife'] },
  { id: 't3', name: 'Arif', emoji: '🧑🏽', color: '#8ec5d6', preferences: ['Culture', 'Food'] },
  { id: 't4', name: 'Sofia', emoji: '👩🏼', color: '#f6c945', preferences: ['Shopping', 'Food'] },
]

export const allInterests = ['Food', 'Shopping', 'Culture', 'Nightlife'] as const

export interface Place {
  id: string
  name: string
  city: string
  type: 'attraction' | 'restaurant' | 'shopping' | 'hotel' | 'nightlife'
  tags: string[]
  price: number
  priceLabel: string
  rating: number
  indoor: boolean
  image: string
  blurb: string
  source: 'ai' | 'traveller'
  recommender?: { name: string; emoji: string; note: string }
}

export const places: Place[] = [
  {
    id: 'p1',
    name: 'Canton Tower',
    city: 'Guangzhou',
    type: 'attraction',
    tags: ['Culture'],
    price: 150,
    priceLabel: 'RM150',
    rating: 4.7,
    indoor: false,
    image: '🗼',
    blurb: 'Iconic 600m tower with observation decks over the Pearl River.',
    source: 'ai',
  },
  {
    id: 'p2',
    name: 'Chen Clan Ancestral Hall',
    city: 'Guangzhou',
    type: 'attraction',
    tags: ['Culture'],
    price: 20,
    priceLabel: 'RM20',
    rating: 4.6,
    indoor: true,
    image: '🏛️',
    blurb: 'Ornate Qing-dynasty academic hall with intricate folk-art carvings.',
    source: 'ai',
  },
  {
    id: 'p3',
    name: 'Beijing Road',
    city: 'Guangzhou',
    type: 'shopping',
    tags: ['Shopping', 'Nightlife'],
    price: 0,
    priceLabel: 'Free entry',
    rating: 4.4,
    indoor: false,
    image: '🛍️',
    blurb: 'Historic pedestrian shopping street with a glass-floored Song dynasty ruin.',
    source: 'ai',
  },
  {
    id: 'p4',
    name: "Ah Po's Noodle House",
    city: 'Guangzhou',
    type: 'restaurant',
    tags: ['Food'],
    price: 35,
    priceLabel: 'RM35/pax',
    rating: 4.9,
    indoor: true,
    image: '🍜',
    blurb: 'Tiny 12-seat shop famous for wonton noodles — no English menu, worth it.',
    source: 'traveller',
    recommender: { name: 'Han', emoji: '🧑🏻‍🦱', note: 'Went twice in 3 days. Ask for extra chili oil!' },
  },
  {
    id: 'p5',
    name: 'Liwan Lake Park',
    city: 'Guangzhou',
    type: 'attraction',
    tags: ['Culture'],
    price: 0,
    priceLabel: 'Free',
    rating: 4.5,
    indoor: false,
    image: '🌳',
    blurb: 'Quiet lakeside park, popular for morning tai chi and lotus ponds.',
    source: 'ai',
  },
  {
    id: 'p6',
    name: 'Tianhe Sportcenter Mall',
    city: 'Guangzhou',
    type: 'shopping',
    tags: ['Shopping'],
    price: 0,
    priceLabel: 'Free entry',
    rating: 4.3,
    indoor: true,
    image: '🏬',
    blurb: 'Massive indoor mall district — great backup plan on rainy days.',
    source: 'ai',
  },
  {
    id: 'p7',
    name: 'Yuexiu Park Night Market',
    city: 'Guangzhou',
    type: 'nightlife',
    tags: ['Nightlife', 'Food'],
    price: 25,
    priceLabel: '~RM25/pax',
    rating: 4.6,
    indoor: false,
    image: '🏮',
    blurb: 'Lantern-lit night snacks and street performers by the old city wall.',
    source: 'traveller',
    recommender: { name: 'Priya', emoji: '👩🏽', note: 'Go hungry. The skewers stall near the gate is unreal.' },
  },
  {
    id: 'p8',
    name: 'Guangzhou Museum',
    city: 'Guangzhou',
    type: 'attraction',
    tags: ['Culture'],
    price: 0,
    priceLabel: 'Free',
    rating: 4.5,
    indoor: true,
    image: '🏺',
    blurb: '2,200 years of city history inside Zhenhai Tower.',
    source: 'ai',
  },
  {
    id: 'pg1',
    city: 'George Town',
    name: 'Kek Lok Si Temple',
    type: 'attraction',
    tags: ['Culture'],
    price: 0,
    priceLabel: 'Free',
    rating: 4.6,
    indoor: false,
    image: '\u26E9\uFE0F',
    blurb: 'Hillside temple complex above Air Itam, best in the late afternoon.',
    source: 'ai',
  },
  {
    id: 'pg2',
    city: 'George Town',
    name: 'Chulia Street hawkers',
    type: 'restaurant',
    tags: ['Food'],
    price: 15,
    priceLabel: 'RM15/pax',
    rating: 4.8,
    indoor: false,
    image: '\uD83C\uDF62',
    blurb: 'Char kway teow and koay teow th\u0027ng from 6pm until late.',
    source: 'traveller',
    recommender: { name: 'Sara', emoji: '\uD83D\uDC69\uD83C\uDFFB', note: 'Third stall from the corner. Trust me.' },
  },
  {
    id: 'pg3',
    city: 'George Town',
    name: 'Penang Peranakan Mansion',
    type: 'attraction',
    tags: ['Culture'],
    price: 25,
    priceLabel: 'RM25',
    rating: 4.5,
    indoor: true,
    image: '\uD83C\uDFDB\uFE0F',
    blurb: 'Restored Baba-Nyonya townhouse. Good rainy-day option.',
    source: 'ai',
  },
  {
    id: 'bk1',
    city: 'Bangkok',
    name: 'Wat Pho',
    type: 'attraction',
    tags: ['Culture'],
    price: 30,
    priceLabel: 'RM30',
    rating: 4.7,
    indoor: false,
    image: '\uD83D\uDED5',
    blurb: 'Reclining Buddha and the oldest massage school in Thailand.',
    source: 'ai',
  },
  {
    id: 'bk2',
    city: 'Bangkok',
    name: 'Or Tor Kor Market',
    type: 'restaurant',
    tags: ['Food'],
    price: 20,
    priceLabel: 'RM20/pax',
    rating: 4.7,
    indoor: true,
    image: '\uD83E\uDD6D',
    blurb: 'Fresh market with a food court locals actually eat at.',
    source: 'traveller',
    recommender: { name: 'Nick', emoji: '\uD83E\uDDD1\uD83C\uDFFC', note: 'Go hungry, skip breakfast.' },
  },
  {
    id: 'kl1',
    city: 'Kuala Lumpur',
    name: 'Petaling Street',
    type: 'shopping',
    tags: ['Shopping', 'Food'],
    price: 0,
    priceLabel: 'Free entry',
    rating: 4.2,
    indoor: false,
    image: '\uD83C\uDFEE',
    blurb: 'Chinatown market street, busiest after dark.',
    source: 'ai',
  },
]

export interface TripPlan {
  id: string
  name: string
  cost: number
  costPerPerson: number
  groupScore: number
  scores: {
    budgetFit: number
    groupSatisfaction: number
    preferenceMatch: number
    efficiency: number
    convenience: number
    feasibility: number
  }
  highlight: string
  recommended?: boolean
}

export const tripPlans: TripPlan[] = [
  {
    id: 'saver',
    name: 'Budget Saver',
    cost: 1620,
    costPerPerson: 1620,
    groupScore: 81,
    scores: { budgetFit: 96, groupSatisfaction: 76, preferenceMatch: 74, efficiency: 82, convenience: 70, feasibility: 88 },
    highlight: 'Hostel stays + free attractions. Leaves room to splurge on food.',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    cost: 1850,
    costPerPerson: 1850,
    groupScore: 94,
    scores: { budgetFit: 90, groupSatisfaction: 96, preferenceMatch: 95, efficiency: 92, convenience: 93, feasibility: 97 },
    highlight: 'Best match for everyone’s preferences without breaking budget.',
    recommended: true,
  },
  {
    id: 'comfort',
    name: 'Comfort',
    cost: 2000,
    costPerPerson: 2000,
    groupScore: 93,
    scores: { budgetFit: 78, groupSatisfaction: 97, preferenceMatch: 96, efficiency: 95, convenience: 98, feasibility: 96 },
    highlight: '4-star hotel near Tianhe, private transfers, zero compromises.',
  },
]

export interface ItineraryItem {
  time: string
  placeId: string
  note?: string
}

export interface ItineraryDay {
  day: number
  date: string
  label: string
  items: ItineraryItem[]
}

export const originalItinerary: ItineraryDay[] = [
  {
    day: 1,
    date: 'Tue, 22 Sep',
    label: 'Arrival',
    items: [{ time: '15:00', placeId: 'p1', note: 'Sunset at the observation deck' }],
  },
  {
    day: 2,
    date: 'Wed, 23 Sep',
    label: 'Culture & Nature',
    items: [
      { time: '09:30', placeId: 'p2' },
      { time: '14:00', placeId: 'p5', note: 'Outdoor park visit' },
      { time: '19:00', placeId: 'p4' },
    ],
  },
  {
    day: 3,
    date: 'Thu, 24 Sep',
    label: 'City Discovery',
    items: [
      { time: '10:00', placeId: 'p8' },
      { time: '15:00', placeId: 'p3' },
    ],
  },
  {
    day: 4,
    date: 'Fri, 25 Sep',
    label: 'Retail & Nightlife',
    items: [
      { time: '11:00', placeId: 'p6', note: 'Indoor shopping district' },
      { time: '20:00', placeId: 'p7' },
    ],
  },
  {
    day: 5,
    date: 'Sat, 26 Sep',
    label: 'Free & Easy',
    items: [{ time: '10:00', placeId: 'p4', note: 'Second visit, group vote' }],
  },
  {
    day: 6,
    date: 'Sun, 27 Sep',
    label: 'Departure',
    items: [{ time: '12:00', placeId: 'p1', note: 'Last-minute souvenirs, airport transfer' }],
  },
]

export const placeById = (id: string) => places.find((p) => p.id === id)!

/** Only ever offer places that belong to a city on this trip. */
export const placesInCities = (cities: string[]) =>
  places.filter((p) => cities.some((c) => c.toLowerCase() === p.city.toLowerCase()))

export interface Expense {
  id: string
  title: string
  amount: number
  paidBy: string
  split: string[]
  icon: string
}

export const expenses: Expense[] = [
  { id: 'e1', title: 'Group dinner — Ah Po’s Noodle House', amount: 240, paidBy: 't1', split: ['t1', 't2', 't3', 't4'], icon: '🍜' },
  { id: 'e2', title: 'Airport → hotel transport', amount: 100, paidBy: 't2', split: ['t1', 't2', 't3', 't4'], icon: '🚕' },
  { id: 'e3', title: 'Canton Tower tickets', amount: 600, paidBy: 't3', split: ['t1', 't2', 't3', 't4'], icon: '🗼' },
  { id: 'e4', title: 'Night market snacks', amount: 90, paidBy: 't4', split: ['t1', 't2', 't3', 't4'], icon: '🏮' },
  { id: 'e5', title: 'Shopping district taxi', amount: 40, paidBy: 't1', split: ['t2', 't4'], icon: '🚖' },
]

export const tripMeta = {
  destination: 'Guangzhou, China',
  flag: '🇨🇳',
  dates: '22 – 27 September 2026',
  travelerCount: 4,
  budgetPerPerson: 2000,
  currency: 'RM',
}

export interface TripLeg {
  city: string
  flag: string
  days: number
}

export interface TripSummary {
  id: string
  name: string
  flag: string
  destination: string
  dates: string
  travelerCount: number
  status: 'live' | 'planning' | 'past'
  days: number
  legs: TripLeg[]
  spent?: number
  budget: number
  rating?: number
  cover: string
  highlight: string
  notes?: string
}

/** The workspace holds many trips. Guangzhou is just the one that's open. */
export const trips: TripSummary[] = [
  {
    id: 'gz2026',
    name: 'Guangzhou 2026',
    flag: '🇨🇳',
    destination: 'Guangzhou, China',
    dates: '22 – 27 Sep 2026',
    days: 6,
    legs: [{ city: 'Guangzhou', flag: '🇨🇳', days: 6 }],
    travelerCount: 4,
    status: 'live',
    budget: 2000,
    cover: '🗼',
    highlight: 'Day 2 of 6 · rain rerouted this afternoon',
  },
  {
    id: 'hcm2026',
    name: 'Ho Chi Minh City',
    flag: '🇻🇳',
    destination: 'Ho Chi Minh City, Vietnam',
    dates: '18 – 21 Dec 2026',
    days: 4,
    legs: [{ city: 'Ho Chi Minh City', flag: '🇻🇳', days: 4 }],
    travelerCount: 2,
    status: 'planning',
    budget: 1400,
    cover: '🛵',
    highlight: '6 places saved · waiting on Mei Lin\u2019s dates',
  },
  {
    id: 'png2026',
    name: 'Penang Weekend',
    flag: '🇲🇾',
    destination: 'George Town, Penang',
    dates: '8 – 10 Mar 2026',
    days: 3,
    legs: [{ city: 'George Town', flag: '🇲🇾', days: 3 }],
    travelerCount: 4,
    status: 'past',
    spent: 430,
    budget: 500,
    rating: 4.8,
    cover: '🦞',
    highlight: 'Came in RM70 under budget',
  },
  {
    id: 'bkk2025',
    name: 'Bangkok Food Run',
    flag: '🇹🇭',
    destination: 'Bangkok, Thailand',
    dates: '14 – 18 Nov 2025',
    days: 5,
    legs: [
      { city: 'Bangkok', flag: '🇹🇭', days: 3 },
      { city: 'Ayutthaya', flag: '🇹🇭', days: 2 },
    ],
    travelerCount: 3,
    status: 'past',
    spent: 1180,
    budget: 1100,
    rating: 4.5,
    cover: '🍲',
    highlight: 'Flight delay cost one temple — everything else kept',
  },
]

export const activeTrip = trips[0]
