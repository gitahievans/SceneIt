# Restore Discovery Features, Add Catalog Heroes, and Fix Broken Images

## Summary

Implement from `main` while leaving `archive/pre-seo-2026-08-03` untouched as the reference version. Preserve the new SEO architecture and homepage.

The image investigation found two concrete risks: the reworked grids removed the archived UI's `unoptimized` behavior, routing many more TMDB images through Next.js optimization, and several components lack protection against missing paths or failed image requests. The solution will retain optimization when it works, fall back to the direct TMDB asset when it does not, and always show an intentional placeholder instead of a broken image.

## Key Changes

### Movies and TV catalog heroes

- Keep `/` structurally and visually unchanged, apart from the shared navigation update.
- Add the cinematic one-large/two-side-card hero to `/movies` and `/tv`, between each page's existing introduction and trending section.
- Size it at approximately 50–56vh on desktop, capped near 560px, so the first existing card row remains almost completely visible.
- Preserve all existing catalog sections and their order.
- Select hero titles on every visit:
  - Guests: randomized from current trending titles.
  - Authenticated movie users: interests, favorites, watched history, searches, and current trends.
  - Authenticated TV users: mapped genre interests, searches, and current trends.
- Require a valid backdrop for featured candidates; prefer an official YouTube trailer for the main card.
- Movie heroes retain favorite/watched actions. TV heroes provide trailer, detail navigation, and show-level favorites; TV watch history remains out of scope.

### Delayed autoplay

- Initially render an optimized backdrop.
- When at least 60% of the main hero has remained visible for two seconds, load a privacy-enhanced YouTube embed and start muted, inline autoplay on all device sizes.
- Pause when offscreen or when the document is hidden; resume only if the user did not explicitly pause.
- Respect `prefers-reduced-motion` by requiring manual playback.
- Provide accessible play/pause and mute/unmute controls.
- If autoplay is blocked or no trailer exists, retain the backdrop and show a manual Play action without disrupting the page.

### Navigation and personalized discovery

- Public navigation: Movies, TV, AI Discover, Providers.
- Authenticated navigation additionally includes For You and Favorites.
- For You links to `/discover`; authentication protection and `noindex` remain in place.
- Preserve AI Discover, watch, authentication, and movie-personalization behavior while combining movie and TV favorites.

### Provider browsing

- Restore the archived provider browsing experience within the new design and routing architecture.
- `/providers` loads the union of US movie and TV providers, deduplicated by TMDB provider ID.
- Display the maintained nine featured services first, followed by the searchable complete catalog.
- Provider cards link to `/providers/[providerId]`.
- Restore the detailed results UI with:
  - Movies/TV selector.
  - Provider and genre selectors.
  - Popularity, rating, newest, and oldest sorting.
  - Rating, runtime, and year ranges.
  - Stable pagination.
- Remove the old Availability selector and do not restrict results to one monetization type.
- Store filters in URL parameters: `kind`, `genre`, `sort`, `ratingMin`, `ratingMax`, `runtimeMin`, `runtimeMax`, `yearMin`, `yearMax`, and `page`.
- Use per-provider `sessionStorage` only as a fallback when the URL contains no filter state.
- Switching provider preserves compatible filters and resets the page. Switching Movies/TV preserves sort/rating/runtime/year but resets genre and page.
- Keep interactive provider pages and filter combinations `noindex`; retain the curated movie/TV provider landing pages as the indexable canonical pages.

### Image reliability

- Introduce one typed TMDB image URL utility for posters, backdrops, and provider logos. It will validate nullable paths and approved TMDB sizes and never generate URLs containing `null`, `undefined`, or malformed paths.
- Introduce a reusable media-image component with three states:
  1. Normal Next.js optimized delivery.
  2. Retry the same valid TMDB asset directly with optimization bypassed if the optimizer fails.
  3. Render an intentional local placeholder if the source also fails.
- Use poster placeholders for missing artwork, gradient backdrops for missing hero/detail backgrounds, and provider initials/name placeholders for missing logos.
- Bypass optimization initially for remote SVG provider logos while continuing to optimize supported raster assets.
- Apply the component to public SEO cards, legacy movie cards, search results, favorites, details, providers, and the new heroes.
- Add correct responsive `sizes`, fixed aspect ratios, and loading priorities. Only the above-the-fold main hero/detail artwork will be prioritized.
- Tighten the Next.js remote image configuration to TMDB's `/t/p/**` path.
- Keep structured-data image URLs direct, validated, and omitted when no valid artwork exists.

## Interfaces

- Retain the shared `ContentKind = "movie" | "tv"`.
- Add a shared hero candidate model containing media kind, ID, title, overview, rating, poster/backdrop paths, and optional trailer key.
- Add typed TMDB image sizes and a helper returning a valid URL or `null`.
- Extend the server-side TMDB layer for TV discovery, provider union data, genre filtering, hero candidates, and trailer lookup while preserving existing cache durations.
- Store favorites in the media-aware `user_media_interactions` table while retaining the old movie-interaction table temporarily for rollback and movie-only watched history.

## Verification

- Test `/`, `/movies`, `/tv`, `/providers`, representative provider details, movie/TV details, search, favorites, and personalized discovery anonymously and while authenticated.
- Confirm the homepage remains unchanged and both catalog heroes appear in the agreed location and height.
- Test hero behavior for autoplay allowed, autoplay blocked, reduced motion, scrolling offscreen, manual pause, absent trailers, and failed YouTube embeds.
- Test guest and authenticated hero selection across repeated visits without changing cached TMDB data behavior.
- Test provider union/deduplication, Movies/TV switching, every filter, pagination, URL restoration, session fallback, provider switching, empty results, and TMDB failures.
- Test valid raster images, provider SVGs, null paths, malformed paths, optimizer failures, direct-source failures, and fallback rendering.
- Verify representative TMDB source URLs and Next.js optimization requests return successfully after deployment.
- Inspect raw HTML for titles, canonical links, visible content, and crawlable links; confirm interactive provider permutations remain `noindex`.
- Run unit tests, TypeScript, lint, production build, and browser-level responsive checks.
- Run Lighthouse on `/`, `/movies`, `/tv`, a detail page, and a provider page, checking layout stability, image sizing, accessibility, SEO, and Core Web Vitals.

## Assumptions

- US availability remains the initial market.
- The archived branch remains unchanged and implementation is based on `main`.
- Missing or failed images use deliberate placeholders; no broken-image browser icons should remain.
- The old provider filtering capabilities are restored, but the new public SEO pages, canonical routes, metadata, and server rendering remain intact.
- Deployment, commit, and push occur only after the implementation and verification pass.
