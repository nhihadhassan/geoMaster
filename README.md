# GeoMaster

A premium, map-first **geography learning game** built with Next.js and Mapbox GL. Type a
country, get it fuzzy-matched, watch the map fly to it, and learn something about it — wrapped
in an "atlas HUD" interface with quiz feedback, hints, and end-of-round stats.

**Live demo:** https://geo-master-livid.vercel.app

---

## Features

- 🗺️ **Interactive Mapbox map** — full-screen, flies to each country as you guess it
- ⌨️ **Type-to-fill matching** — forgiving country matching (handles typos and alternate names)
- 🎓 **Explore mode** — country, city, landmark, subdivision, and physical-feature cards,
  with search and zoom/recenter controls
- 💡 **Hints & target cards** — progressive assistance when you're stuck, and a wrong map pick
  is shown against the right answer once it's revealed
- 📈 **Local mastery tracking** — remembers what you keep missing, and can quiz you on exactly
  those countries
- 📊 **Results dashboard** — scoring, review, a shareable card, and next actions
  (Practice, Try Again, Change Region, Explore)
- 🗓️ **Daily Challenge** — a date-seeded set of 12, the same for everyone, with a local streak
- 🌴 **Detail touches** — Caribbean inset map, country popups, Antarctica handling, sound effects
- 🎞️ **Polished motion** — Framer Motion animations and a dark "atlas" design system
- 🗃️ **Generated, validated country dataset** — TopoJSON world geometry plus scripted data
  generation, validation, and matcher tests

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) · React · TypeScript |
| Mapping | Mapbox GL · topojson-client |
| State | Zustand |
| Matching | Hand-rolled Damerau-Levenshtein matcher |
| Styling / motion | Tailwind CSS · Framer Motion |

## Getting started

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root with a **public** Mapbox access token (must start
with `pk.`):

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_public_mapbox_token_here
```

> Next.js only exposes `NEXT_PUBLIC_*` values at build / dev-server start, so restart the dev
> server after changing `.env.local`. If the token is missing, GeoMaster shows a setup message
> instead of a blank map.

Run the dev server:

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Scripts

```bash
npm run dev                  # start dev server
npm run build                # production build
npm run start                # serve production build
npm run lint                 # lint
npm test                     # dataset validation + all test suites
npm run generate:countries   # regenerate the country dataset
npm run validate:countries   # validate the generated dataset
npm run test:matcher         # country-name matcher
npm run test:store           # quiz engine, timer, persistence
npm run test:progress        # mastery model
npm run test:search          # explore search
npm run test:daily           # daily challenge
npm run test:motion          # map motion curves
npm run test:e2e             # Playwright smoke journeys (desktop + mobile)
```

## Project structure

```
src/
├── app/                # App Router entry (renders the full-screen map game)
├── components/
│   ├── game/           # HUD, type-to-fill input, education & results cards, celebrations
│   └── map/            # Mapbox container, layers, search, controls, inset, popups
├── config/             # feature flags
├── hooks/              # world topology, matcher, sound, focus, environment, progress
├── data/               # generated countries, subdivisions, cities, stories, features
├── store/              # Zustand game state, persistence, preferences, progress
└── utils/              # matching, hints, education, mastery, search, daily challenge
```

Features added in the August 2026 round are individually switchable in
[`src/config/features.ts`](src/config/features.ts) — see
[`docs/product-round-2026-08.md`](docs/product-round-2026-08.md) and the
follow-up [`docs/refinement-round-2026-08.md`](docs/refinement-round-2026-08.md).

See [`DESIGN.md`](DESIGN.md) for the design system (colors, typography, layout tokens).

## License

Released under the [MIT License](LICENSE).
