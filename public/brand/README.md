# Brand assets

The official Wildwoods logo was not included with this build, so the site
currently renders a **placeholder mark** (`wildwoods-mark-placeholder.svg`,
also used as `app/icon.svg`) in the brand palette.

To use the official artwork:

1. Copy the logo file into this folder, e.g. `public/brand/wildwoods-logo.svg`.
2. Set `NEXT_PUBLIC_LOGO_SRC=/brand/wildwoods-logo.svg` in `.env.local`
   (and adjust `logo.width` / `logo.height` in `lib/site.ts` to its aspect ratio).
3. Replace `app/icon.svg` with a square version of the mark for the favicon.
4. Re-sample the exact brand colours from the artwork and update the tokens at
   the top of `app/globals.css` if they differ.
