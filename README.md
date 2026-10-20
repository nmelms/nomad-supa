# Nomad Collective frontend

A Next.js frontend for browsing dispersed camping places on a live Mapbox map. The map, markers, search, filters, map area search, style switch, geolocation, detail cards, and browser-local saved places work now. Account creation and sign-in screens are ready for a Supabase Auth connection.

## Run locally

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_MAPBOX_TOKEN` to a Mapbox **public** access token (`pk...`).
3. Run `npm run dev` and open the printed localhost URL.

The public token is read in `components/ExploreApp.tsx`. `.env.local` is ignored by Git. If you restrict the token by URL in Mapbox, allow your local development URL and eventual production domain.

## Connect Supabase later

- Replace the illustrative records in `lib/camps.ts` with a query for verified campsite records. Keep the `Camp` shape or update `components/ExploreApp.tsx` accordingly. Mapbox coordinates are `[longitude, latitude]`.
- Wire the sign-in and create-account actions in `authSubmit` in `components/ExploreApp.tsx` to Supabase Auth. The form currently validates its fields and explains that authentication has not been connected.
- Replace the `savedIds` browser `localStorage` state with a user-specific saved-places table when accounts are ready.

The sample listings are for interface development. Their names, descriptions, access details, and campsite status have **not** been verified. Replace them before offering directions to travelers.
