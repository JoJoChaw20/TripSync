# TripSync

A collaborative travel workspace prototype — AI-optimized itineraries, recommendations from real travellers, and a Preservation-First replanning engine that adapts your trip when the weather (or the world) doesn't cooperate.

**Live demo:** https://trip-sync-blue.vercel.app

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion

## Getting started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Scripts

- `npm run dev` — start the local dev server
- `npm run build` — type-check and build for production (outputs to `dist/`)
- `npm run preview` — preview the production build locally
- `npm run lint` — run Oxlint

## Deploying

This project is deployed on Vercel (project `trip-sync`, linked via `.vercel/`).

```bash
npm install -g vercel   # one-time
vercel login            # one-time
vercel --prod           # deploy current working directory to production
```

Alternatively, connect the GitHub repo at [vercel.com/new](https://vercel.com/new) to enable auto-deploy on every push to `main`.

## Mochi — the TripSync pet

Mochi's illustrations live in `src/assets/pet/` (6 reactive expressions: happy, sad, angry, aggrieved, shy, scared — used by [`Pet.tsx`](src/components/Pet.tsx)) and `src/assets/icon/` (the static map/backpack mark used for the app icon and header logo, via [`AppIcon.tsx`](src/components/AppIcon.tsx)).
