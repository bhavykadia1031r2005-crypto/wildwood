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
2. **Video hero**: one full-bleed day-to-night background video, headline and
   CTAs bottom-left, and a tear-off "events calendar" bottom-right
   (`components/hero/EventCalendar.tsx`, data in `data/events.ts`) that
   auto-advances, pauses on hover/focus or with the hero's pause button, and
   stacks under the copy on mobile.
3. **Itinerary builder** (`#itinerary`): a "Create My Itinerary" button opens
   a boarding-pass popup with style, length, interests, group and
   optional budget; a live "trip ticket"; a day-by-day plan generated locally
   from `data/itinerary.ts` (no AI service) with shuffle, copy and share.
4. **Explore by area** (`#explore`): Leaflet map with category filters, an
   illustrated 2D island with clickable areas, and a drag-to-look panorama viewer.
5. **More to explore** (`#things-to-do`): the ten
   official "So Much To Do" categories (Amusements, Beaches, Boardwalk, Dining,
   Festivals & Events, Outdoor Activities, Nightlife, Local Spirits, History &
   Culture, Golf) as cards with a title and description, linking to their
   wildwoodsnj.com pages (`data/moreToExplore.ts`, images in
   `public/images/explore/`).
6. **Places to stay** (`#stays`): search, type/area/price/rating/amenity/guest
   filters, sort, active chips, mobile filter drawer, empty state, details dialog.
7. **Photo strip & pocket guide** (`#pocket-guide`): a scroll-driven photo strip
   followed by the QR "Take Wildwoods with you" card
   (`components/gallery/PhotoStripGuide.tsx`).
8. **Destination CTA** (`#plan`).
9. **Footer**: link columns, newsletter (validated, with a `/api/newsletter`
   route), legal links, credits and back to top.

**AI guide (every page):** a sticky button bottom-right opens a chat panel
(`components/chat/ChatWidget.tsx`) that streams answers from Claude Opus 5.5
via `app/api/chat/route.ts`. The assistant's knowledge is generated from the
same `data/` files the site renders (`lib/assistant/systemPrompt.ts`) and is
sent as a cached system prompt; it is told never to invent dates, hours or
prices and never to present the sample stays as real. Requests run at `low`
effort with Anthropic's automatic refusal fallback (`fallbacks: "default"`).
Set `ANTHROPIC_API_KEY` on the server to switch it on; until then the panel
says the guide isn't connected. The built-in rate limit is per server
instance; use a shared store before high-traffic launch.

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
| `ANTHROPIC_API_KEY` | AI guide panel opens but explains it isn't connected yet |

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
- `data/events.ts`: signature events shown in the hero calendar and on
  `/events`, described by month/season only. Replace with the official events
  feed for real dates.
- `data/gallery.ts`, `data/media.ts`: gallery content and the image registry,
  including alt text and licence credit for every photo.
- `data/search.ts`: the site search index, built from the files above.

## Media

All photography is real Wildwoods imagery from Wikimedia Commons (public domain,
CC0, CC BY and CC BY-SA). Credits appear in the lightbox and on `/credits`.

- **Hero video** (`public/media/hero/wildwoods-hero-1080.mp4` ~5.9 MB and
  `wildwoods-hero-720.mp4` ~2.7 MB for phones) is the team-supplied
  `public/1920x1080.mp4`, trimmed before its fade to black, muted and
  re-encoded (H.264, fast start). To swap it, re-encode the new file the same
  way, regenerate `wildwoods-hero-poster.webp` from its first frame and update
  `heroVideo` in `data/media.ts`. Keep key subjects near the centre so the
  portrait crop on phones still works.
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
