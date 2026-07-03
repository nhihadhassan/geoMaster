# GeoMaster

A premium, map-first **geography learning game** built with Next.js and Mapbox GL. Type a
country, get it fuzzy-matched, watch the map fly to it, and learn something about it — wrapped
in an "atlas HUD" interface with quiz feedback, hints, and end-of-round stats.

**Live demo:** https://geo-master-livid.vercel.app

---

## Features

- 🗺️ **Interactive Mapbox map** — full-screen, flies to each country as you guess it
- ⌨️ **Type-to-fill matching** — fuzzy country matching with [Fuse.js] (handles typos and
  alternate names)
- 🎓 **Learning mode** — country education cards with stories, hints, and physical-feature data
- 💡 **Hints & target cards** — progressive assistance when you're stuck
- 📊 **Results dashboard** — per-round scoring, accuracy, and a perfect-run celebration
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
| Matching | Fuse.js |
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
npm run generate:countries   # regenerate the country dataset
npm run validate:countries   # validate the generated dataset
npm run test:matcher         # test the country-name matcher
```

## Project structure

```
src/
├── app/                # App Router entry (renders the full-screen map game)
├── components/
│   ├── game/           # HUD, type-to-fill input, education & results cards, celebrations
│   └── map/            # Mapbox container, Caribbean inset, country popups
├── hooks/              # world topology, country matcher, sound effects, overlay focus
├── data/               # generated countries, subdivisions, cities, stories, features
├── store/              # Zustand game state
└── utils/              # matching, hints, education, flags, sound helpers
```

See [`DESIGN.md`](DESIGN.md) for the design system (colors, typography, layout tokens).

## License

Released under the [MIT License](LICENSE).

[Fuse.js]: https://www.fusejs.io/
