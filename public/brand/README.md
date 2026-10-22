# Brand assets

- `wildwoods-logo.png` — official logo (transparent PNG, 239×100). Use on light backgrounds.
- `wildwoods-logo-light.png` — generated from the original with the black outlines and
  lettering ("the", "New Jersey", ™) lifted to white, for the teal navigation, footer and
  other dark surfaces.
- `wildwoods-mark.png` — square sun-and-wave "W" cropped from the logo; also used as the
  favicon (`app/icon.png`).

Paths are configured in `lib/site.ts` (`siteConfig.logo`). If a higher-resolution or
vector (SVG) version of the logo becomes available, replace these files and regenerate the
light variant — the current PNG is small, so it is shown no taller than ~48px.
