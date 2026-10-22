# The Wildwoods, New Jersey — destination website

Homepage and supporting pages for a Wildwoods tourism site, built with
Next.js 16 (App Router, TypeScript), Tailwind CSS 4, GSAP + ScrollTrigger,
Motion for React, Leaflet and Lucide.

```bash
npm install
cp .env.example .env.local   # optional — see "Configuration"
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## What's on the homepage

1. **Floating navigation**: capsule bar with wave-lip ends (`.nav-shape` in
   `globals.css`), active-section indicator, search overlay (`/` or ⌘K), hide on
   scroll down, animated mobile menu.
2. **Split video hero**: 50/50 beach / boardwalk videos with a draggable,
   keyboard-accessible seam (30–70%), pause control, parallax and an intro reveal.
   On mobile the panels stack.
3. **Itinerary builder** (`#itinerary`): style, length, interests, group and
   optional budget; a live "trip ticket"; a day-by-day plan generated locally
   from `data/itinerary.ts` (no AI service) with shuffle, copy and share.
4. **Explore by area** (`#explore`): Leaflet map with category filters, an
   illustrated 2D island with clickable areas, and a drag-to-look panorama viewer.
5. **Places to stay** (`#stays`): search, type/area/price/rating/amenity/guest
   filters, sort, active chips, mobile filter drawer, empty state, details dialog.
6. **Photo spots** (`#things-to-do`): scroll-driven filmstrip, filterable
   asymmetric gallery, lightbox (keyboard + swipe), and the QR "pocket guide" card.
7. **Destination CTA** (`#plan`).
8. **Footer**: link columns, newsletter (validated, with a `/api/newsletter`
   route), legal links, credits and back to top.

Supporting routes: `/guide` (the QR destination), `/events`, `/credits`,
`/legal/privacy|terms|accessibility` (placeholders) and a branded 404.

## Configuration

All team-supplied values live in `lib/site.ts`, fed by the environment variables
in `.env.example`. Anything left blank is hidden or clearly labeled, never
guessed:

| Item | Behavior when not configured |
| --- | --- |
| Logo (`NEXT_PUBLIC_LOGO_SRC`) | Placeholder sun-and-waves mark (see `public/brand/README.md`) |
| Site URL / QR target | QR uses the current browser origin + `/guide` and notes when it's a local address |
| Social profiles | Icons shown disabled with "coming soon" |
| Contact details | Not rendered |
| Legal URLs | Link to local placeholder pages |
| Map tiles | OpenStreetMap community tiles (switch to a keyed provider for production) |
| Newsletter webhook | Sign-ups validated but not stored; UI says "preview mode" |

## Content and data

Content is separated from presentation in `data/`, so each file can be swapped
for an API later:

- `data/attractions.ts`: areas and points of interest. Coordinates were looked
  up from OpenStreetMap and are labeled approximate in the UI. Confirm
  descriptions with venues before launch.
- `data/accommodations.ts`: **sample listings only.** Names, prices and ratings
  are fictional and are labeled "Sample" everywhere they appear. Replace with a
  booking or partner feed that matches the `Stay` type.
- `data/itinerary.ts` + `lib/itinerary.ts`: activity library and the
  deterministic local generator.
- `data/gallery.ts`, `data/media.ts`: gallery content and the image registry,
  including alt text and licence credit for every photo.
- `data/search.ts`: the site search index, built from the files above.

## Media

All photography is real Wildwoods imagery from Wikimedia Commons (public domain,
CC0, CC BY and CC BY-SA). Credits appear in the lightbox and on `/credits`.

- **Hero videos** (`public/media/hero/*.mp4`, ~3–4.5 MB each) are Ken Burns
  montages rendered from those photos, because no licensed Wildwoods footage was
  available. Replace them with real footage by dropping new files in place (keep
  the names, or update `heroVideos` in `data/media.ts`) and regenerating the
  `*-poster.webp` first frames. Suggested spec: H.264 MP4, ~960×1200, 15–20 s
  seamless loop, no audio, under 5 MB.
- **Panoramas** (`public/images/panoramas/`) are wide crops of standard photos,
  labeled in the viewer as "not a 360° capture". `PanoramaScene.kind` is
  reserved for real 360° media; true equirectangular rendering would need a
  WebGL viewer (e.g. three.js), loaded only when that tab opens.
- **Logo**: not supplied with this build. See `public/brand/README.md`.

## Animation system

- GSAP owns scroll storytelling (`lib/animation.ts`, `components/animation/*`):
  masked line reveals via SplitText (`data-split`), batched entrances
  (`data-reveal`), parallax, the hero intro and the gallery filmstrip. Everything
  runs inside `useGSAP` + `gsap.matchMedia()`, so it cleans up on unmount and is
  skipped under `prefers-reduced-motion`.
- Motion for React handles UI state: menus, dialogs, tabs, filters and the
  magnetic buttons (fine pointers only). The two never animate the same element.
- `ScrollRefresh` recalculates ScrollTrigger when the page height changes
  (itinerary results, filters, "show more").
- Content is never hidden without JavaScript: reveals only start once JS runs,
  and the hero intro has a CSS fallback.

## Project structure

```text
app/            routes, layout, global styles, /api/newsletter
components/     navigation, hero, itinerary, explore, stays, gallery, cta,
                footer, layout, animation, ui, brand
data/           content and sample data
lib/            site config, animation setup, hooks, itinerary generator, utils
public/         images, hero media, brand assets, og-image.jpg
```
