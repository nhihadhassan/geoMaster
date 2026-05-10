# GeoMaster

GeoMaster is a Next.js App Router geography trainer. The first playable version renders a full-screen Mapbox map and supports Mode A: type a country name, match it with Fuse.js, fly the map to the country, mark it as guessed, and show success feedback.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_public_mapbox_token_here
```

The token must be a Mapbox public access token and must start with `pk.`. Restart the dev server after changing `.env.local`; Next.js only exposes `NEXT_PUBLIC_*` values to client components at build/dev-server start.

## Run

```bash
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Mapbox Notes

- `mapbox-gl` is imported in the client-only `MapContainer`.
- `mapbox-gl/dist/mapbox-gl.css` is imported globally in `src/app/layout.tsx`.
- If `NEXT_PUBLIC_MAPBOX_TOKEN` is missing, GeoMaster shows a setup message instead of a blank map.
- The MVP uses Mapbox's default `light-v11` style so the base map is visible before any custom country layers load.

## Verification

```bash
npm run lint
npm run build
```
