# SceneIt

Get movie recommendations based on your interests.

## Project Overview

SceneIt is a Next.js app that surfaces daily-trending movies and lets you explore curated lists by genre. Users can sign up, complete a simple onboarding to select interests, and enjoy a personalized browsing experience.

## Mockups

![alt text](<Screenshot 2025-09-22 105317.png>)
![alt text](<Screenshot 2025-09-22 172229.png>)
![alt text](<Screenshot 2025-09-22 105345.png>)
![alt text](<Screenshot 2025-09-22 110710.png>)

## Features

- Trending movies section
- Browse by genre with pagination and progress indicators
- Supabase authentication with protected routes
- Data fetching/caching with TanStack Query
- Agentic AI discovery with verified TMDB cards, regional providers, TV metadata, and cited web research

## Tech Stack / Tools

- Next.js 15, React 19, TypeScript
- UI: Mantine, Tailwind CSS 4, next-themes
- State/Data: TanStack Query 5
- Backend/Auth: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Media/UX: embla carousel, react-player, lucide-react, react-toastify

## Prerequisites

- Node.js 18+
- npm
- A Supabase project with the following available:
  - Project URL (anon/public)
  - Anonymous (public) API key
  - A `user_interests` table
  - A `user_interactions` table

## Environment Variables

Create a `.env.local` at the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=your_tmdb_api_key
TMDB_READ_ACCESS_TOKEN=your_tmdb_read_access_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
SCENEIT_AI_MODEL=@cf/zai-org/glm-4.7-flash
SERPER_API_KEY=your_serper_api_key
GEMINI_API_KEY=your_gemini_api_key
```

These are required by `utils/supabase/client.ts` and `utils/supabase/middleware.ts`.
TMDB, Cloudflare, Serper, and Gemini credentials are server-only and must never use a `NEXT_PUBLIC_` prefix. The Cloudflare API token needs Workers AI access and **Browser Rendering: Edit** (shown as Browser Rendering Write in some token UIs). `SCENEIT_AI_MODEL` is optional and defaults to `@cf/zai-org/glm-4.7-flash`; Gemini is attempted only as a reliability fallback.

`POST /api/ai/discover` accepts `{ message, region?, messages? }` and returns the answer, normalized movie cards, cited sources, concise tool activity, and follow-up prompts. The browser stores recent conversation messages in session storage so follow-up questions keep context without introducing a new persistence service.

The former Supabase `ai` Edge Function has been removed from this repository. If it was deployed previously, delete it manually during deployment cleanup (for example, with the current Supabase CLI or Dashboard); removing local configuration does not undeploy an existing remote function.

## Installation & Setup

```bash
npm install
npm run dev
```

Common scripts:

- `npm run build` — Build with Turbopack
- `npm run dev` — Run the development server
- `npm run lint` — Run ESLint
- `npm run test` — Run unit tests once

## Usage

1.  Sign up / log in. The app uses Supabase for auth and persists sessions.
2.  If you’re a new user, you’ll be redirected to `/onboarding` to select interests.
3.  Explore the home page:
    - Trending section and genre-based sections
    - Pagination controls and a progress bar for genres

Public routes include `/`, `/login`, `/signup`, `/auth/confirm`, `/auth/callback`, and `/details/...`. All other routes are protected by middleware.

## Testing

- Test runner: Jest (`jest.config.ts`)
- Environment: `jsdom`
- Setup: `jest.setup.ts` (adds `@testing-library/jest-dom` matchers)
- Example tests: `__tests__/HomePageContent.test.tsx`, `__tests__/MovieCard.test.tsx`, `__tests__/LikeButton.test.tsx`

Run tests:

```bash
npm run test:watch
```
