# TripSync by Three Little Bugs

**Team:** Cheong Li Hua, Yap Zhe Cheng, Chaw Yen Hua

**Problem Statement:** Travel Planner

**Video Presentation:** _[Unlisted YouTube Link — TODO]_

**Presentation Slides:** _[Public Link — TODO]_

**Live demo:** https://trip-sync-blue.vercel.app

> A collaborative travel workspace — AI-optimized itineraries, recommendations from real travellers, and a **Preservation-First replanning engine** that adapts your trip when the weather (or the world) doesn't cooperate.

---

## 1. Project Overview

### The Problem

<!-- TODO: tailor this to your actual research/interviews before submitting. -->

Group trips are planned once, on a spreadsheet or a shared doc, and then left to survive contact with reality. In practice:

- **Plans are static.** A rained-out afternoon, a delayed flight, or a closed attraction forces someone in the group to manually re-shuffle the whole itinerary, usually mid-trip and under stress.
- **Preferences conflict.** Groups mix people who want food and culture with people who want shopping and nightlife, and reconciling that by chat thread is slow and often unfair to whoever speaks up least.
- **Money tracking is an afterthought.** Expenses get paid ad hoc and "who owes who" is reconstructed from memory at the end of the trip.
- **Discovery is generic.** Recommendations come from generic listicles rather than people who've actually been.

**Stakeholders:** groups of friends/family travelling together, budget-conscious travellers who need fair cost-splitting, and trip organizers who currently absorb all the replanning effort themselves.

**Existing apps and where they fall short:** apps like *Wanderlog* and *TripIt* are good at consolidating bookings and building a shareable itinerary, but they treat the itinerary as a static document — if a day gets disrupted, the user still has to manually find replacements and re-slot them. None of them close the loop with automatic, preference-aware re-optimization, in-app expense settlement, and group-preference balancing in one workspace.

### Our Solution

TripSync is a collaborative trip-planning workspace that generates AI-scored itinerary options from everyone's preferences and budget, then keeps that plan alive when things change — automatically re-arranging around disruptions instead of asking a human to do it. It bundles the whole trip lifecycle (planning → discovery → in-trip adaptation → expense settlement → retrospective) into one shared space that anyone in the group can open with just a link.

**Feature set:**

- **AI-scored itinerary options** — multiple candidate plans ranked on budget fit, group satisfaction, preference match, travel efficiency, convenience, and schedule feasibility, with an in-line feedback loop to tweak and regenerate.
- **Discover** — a place browser mixing AI recommendations and real-traveller-submitted spots, with save/bookmark and the ability to add your own places into the plan.
- **Preservation-First replanning** — when a disruption is detected (e.g. rain forecast on an outdoor day), TripSync rearranges saved places first, so every place the group already committed to still gets visited, before ever suggesting something new.
- **Flight delay auto-reflow** — a changed flight time automatically reflows the remaining schedule and surfaces "bonus" activities in the time that opens up.
- **Colour Walk** — a 30-minute group mini-game the trip pet offers when a disruption leaves an unplanned gap; a colour-based photo scavenger hunt with a shape-based mode for colour-blind travellers.
- **Group preferences** — each traveller sets their own interests and pace; plans are scored against the whole group, not just the organizer.
- **Expense tracking & settle-up** — shared expenses with automatic debt simplification (who pays whom, minimizing the number of transactions).
- **Accountless sharing** — a trip link opens read-only for anyone, edit access stays with invited members — no sign-up wall for viewers.
- **Post-trip retrospective** — actual spend vs. budget, ratings, shared memories, and a learned preference profile that TripSync carries into the next trip.
- **Mochi**, the trip pet, gives lightweight emotional feedback (happy/sad/angry/aggrieved/shy/scared) throughout the flow instead of dry system notifications.

---

## 2. Ideation & Process

### 2.1 Ideas We Considered

<!-- TODO: fill in with the ideas your team actually generated, chosen ideas first. -->

| Idea | Why it was dropped / kept |
| --- | --- |
| A (Chosen) | |
| B (Chosen) | |
| C | |

### 2.2 Ideation Boards

<!-- TODO: embed your mindmap/crazy-eights/affinity-diagram images here, 1-2 lines of context under each. -->

```md
![Mindmap](mindmap.png)
```

### 2.3 Mentor Consultation

<!-- TODO: log each mentor session, even ones where you pushed back on the advice. -->

| Date | Mentor | Feedback Received | What Was Changed |
| --- | --- | --- | --- |
| | | | |

---

## 3. Design & Prototype

**UI Prototype:** _[Public Link — TODO, verify it opens in an incognito window]_

<!-- TODO: embed/link 4-8 key screens with a caption per screen. Candidates from the current build:
     Welcome, CreateTrip, Preferences, AIPlans, Discover, Replanning, FlightDelay,
     Expenses, Share, PostTrip — see src/screens/ for the full set. -->

---

## 4. What Makes It Different

- **Preservation-First replanning, not regeneration.** Most planners either freeze the itinerary or throw it out and regenerate from scratch after a disruption. TripSync's replanning engine explicitly re-slots the places the group already saved before it ever suggests something new, so a rained-out afternoon doesn't cost you the attraction you actually wanted to see.
- **A disruption becomes an activity, not just a problem.** Colour Walk turns a scheduling gap (caused by weather, delay, or a cancelled slot) into a bonded group activity instead of dead time — with a shape-based mode built in for colour-blind travellers from day one.
- **Group-fair AI scoring, shown transparently.** Itinerary options are scored per-traveller-preference and shown as explicit scores (budget fit, group satisfaction, preference match, efficiency, convenience, feasibility) rather than a black-box "recommended for you."
- **The trip keeps learning.** The post-trip retrospective feeds a learned preference profile forward into future trips, instead of every trip starting from a blank slate.
- **Zero-friction sharing.** Anyone with the link can view the live trip with no account; only invited collaborators can edit.

<!-- TODO: optional comparison table vs. Wanderlog/TripIt if you want to make this explicit. -->

---

## 5. Technical Architecture & Feasibility

### Tech stack

| Layer | Choice | Why | Constraints |
| --- | --- | --- | --- |
| Frontend | React 19 + TypeScript, Vite | Fast dev loop, strong typing for a screen-flow-heavy prototype | — |
| Styling | Tailwind CSS v4 | Rapid iteration on a large number of screens without a component library | Needs discipline to keep design tokens consistent across screens |
| Motion | Framer Motion | Screen transitions and micro-interactions (e.g. Mochi's reactions) | Adds bundle size; used sparingly |
| Icons | lucide-react | Consistent icon set across the app | — |
| Linting | Oxlint | Fast, zero-config linting | — |
| Hosting | Vercel | Free tier, auto-deploy from GitHub `main`, zero-config for Vite | — |
| Data (current) | Local mock data (`src/data/mockData.ts`) | Lets the UI/UX prototype run fully client-side for the submission phase | No persistence, no real users/trips yet — see Build plan |

**Currently, this repository is a client-side UI/UX prototype**: all trips, places, travelers, and expenses are mock data bundled with the app. There is no backend, database, or external API integrated yet.

### Build plan & scope

What we plan to build in the building phase, in priority order:

1. **Persistence layer** — a real backend + database (e.g. Supabase/Postgres) to replace `mockData.ts`, so trips, places, and expenses survive a refresh and are shared across devices.
2. **Real-time collaboration** — multiple travellers editing/viewing the same trip and seeing each other's changes live (e.g. via Supabase Realtime or a WebSocket layer).
3. **AI itinerary generation** — wire the AI-plans and replanning screens to an actual LLM/optimization call instead of static mock scores, using each traveller's stored preferences.
4. **Live disruption signals** — a weather API and flight-status API to trigger the Preservation-First replanning flow automatically instead of via a scripted demo.
5. **Accountless share links** — a real read-only vs. edit token scheme backing the `Share` screen's link.

Deliberately out of scope for the hackathon build: native mobile apps, payment processing for expense settlement (we compute who-owes-who, we don't move money), and multi-language support.

---

## Repository structure & running locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

**Scripts**

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

**Deploying**

This project is deployed on Vercel (project `trip-sync`, linked via `.vercel/`).

```bash
npm install -g vercel   # one-time
vercel login            # one-time
vercel --prod           # deploy current working directory to production
```

Alternatively, connect the GitHub repo at [vercel.com/new](https://vercel.com/new) to enable auto-deploy on every push to `main`.

**Mochi — the TripSync pet**

Mochi's illustrations live in `src/assets/pet/` (6 reactive expressions: happy, sad, angry, aggrieved, shy, scared — used by [`Pet.tsx`](src/components/Pet.tsx)) and `src/assets/icon/` (the static map/backpack mark used for the app icon and header logo, via [`AppIcon.tsx`](src/components/AppIcon.tsx)).
