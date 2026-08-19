# SceneIt

SceneIt is an AI-assisted movie and TV discovery app built with Next.js. It helps people decide what to watch by combining TMDB metadata, streaming availability, curated SEO-friendly collection pages, user preferences, and an agentic recommendation flow that can reason about mood, runtime, providers, recaps, and current entertainment research.

## Why This Project Stands Out

- **Full-stack product thinking:** public discovery pages, authenticated personalization, usage-limited AI features, favorites, onboarding, analytics consent, SEO metadata, sitemaps, and structured data.
- **Agentic AI with guardrails:** SceneIt AI uses tool-calling instead of guessing, verifies movie and TV cards against TMDB, cites web-grounded claims, applies daily usage limits, and falls back from Cloudflare Workers AI to Gemini when appropriate.
- **Recruiter-relevant engineering surface:** server routes, Supabase RLS-backed persistence, typed validation with Zod, reusable UI components, cached TMDB access, Jest coverage, and production-oriented SEO.
- **Media-aware design:** movies and TV shows are modeled separately across detail pages, favorites, provider filters, genres, collections, seasons, and episodes.

## Product Features

- AI movie and TV recommendations at `/ai-movie-recommendations`
- Public movie and TV catalog pages for trending, top-rated, mood, decade, occasion, genre, and provider-based discovery
- TMDB-backed detail pages with ratings, vote counts, runtime, overview, provider availability, and canonical links
- TV season and episode browsing with validated pagination
- Supabase authentication, onboarding, personalized interests, favorites, watched-title tracking, and protected profile flows
- Streaming provider catalogs for United States availability
- Optional Google Analytics consent flow with analytics disabled by default
- SEO support through metadata helpers, Open Graph image generation, JSON-LD, robots configuration, sitemap indexes, and sectioned sitemaps

## Tech Stack

- **Framework:** Next.js 15 App Router, React 19, TypeScript
- **Styling/UI:** Tailwind CSS 4, Mantine, shadcn-style primitives, Radix UI, next-themes, lucide-react
- **Data and state:** TanStack Query, Supabase SSR/client SDKs, TMDB API
- **AI:** Vercel AI SDK, Cloudflare OpenAI-compatible Workers AI endpoint, Gemini fallback, Serper web search
- **Media UX:** Embla Carousel, React Player, TMDB image helpers
- **Quality:** Jest 30, Testing Library, MSW, ESLint

## Architecture Highlights

- `app/` contains App Router pages, route handlers, metadata, sitemap, robots, auth, and protected sections.
- `lib/ai-discover/` contains the SceneIt AI agent, tool definitions, URL security helpers, response contracts, and fallback behavior.
- `utils/tmdb/` normalizes TMDB access, caching, images, movie details, TV details, seasons, and episodes.
- `utils/supabase/` centralizes browser/server clients, middleware session refresh, and interaction queries.
- `utils/seo/` handles canonical URLs, page metadata, JSON-LD, slugging, and sitemap generation.
- `components/` is organized by product area: search, home, SEO catalog cards, details, TV, providers, analytics, auth, player, and common UI.
- `supabase/migrations/` includes database migrations for media-aware interactions and AI discovery daily usage.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- TMDB API credentials
- Cloudflare Workers AI credentials for the primary AI provider
- Serper API key for web search
- Gemini API key if you want fallback AI generation

### Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

TMDB_API_KEY=
TMDB_READ_ACCESS_TOKEN=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
SCENEIT_AI_MODEL=@cf/zai-org/glm-4.7-flash
SERPER_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
SITE_URL=
NEXT_PUBLIC_SITE_URL=
```

Keep TMDB, Cloudflare, Serper, and Gemini credentials server-only. Do not add a `NEXT_PUBLIC_` prefix to those secrets.

### Database Setup

Run the migrations in `supabase/migrations/` and ensure the app has the expected tables and RPCs:

- `user_interests`
- `user_searches`
- `user_movie_interactions`
- `user_media_interactions`
- `ai_discover_daily_usage`
- `consume_ai_discover_daily_credit(p_usage_date, p_limit)`

The newer `user_media_interactions` table supports both `movie` and `tv` favorites. `user_movie_interactions` is still referenced for watched movie history and rollback compatibility.

### Install and Run

```bash
npm install
npm run dev
```

The development server starts with Turbopack. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev        # Start the local Next.js dev server
npm run build      # Build the app with Turbopack
npm run start      # Start the production build
npm run lint       # Run ESLint
npm run test       # Run the Jest test suite once
npm run test:watch # Run Jest in watch mode
```

## Testing Focus

The test suite covers the highest-risk areas of the product:

- AI discovery route validation, daily usage limits, provider fallback, tool limits, and URL security
- Multi-turn AI discovery UI behavior
- Media-aware favorites and interactions
- TV season and episode pagination
- TMDB image URL validation
- Home page loading, error, content, and pagination states

## Notable Routes

- `/` - public landing and trending movie/TV discovery
- `/movies` and `/tv` - catalog hubs with collections, genres, and providers
- `/movies/[slug]` and `/tv/[slug]` - TMDB-backed detail pages
- `/tv/[slug]/season/[seasonNumber]` - TV season and episode browsing
- `/ai-movie-recommendations` - authenticated SceneIt AI experience
- `/favorites`, `/profile`, `/onboarding` - authenticated user flows
- `/providers`, `/movies/providers/[slug]`, `/tv/providers/[slug]` - streaming provider discovery

## Data Credits

This product uses the TMDB API but is not endorsed or certified by TMDB.
