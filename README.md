# SceneIt
 
Get movie recommendations based on your interests.
 
 
 ## Project Overview
 
 SceneIt is a Next.js app that surfaces daily-trending movies and lets you explore curated lists by genre. Users can sign up, complete a simple onboarding to select interests, and enjoy a personalized browsing experience.
 
 
 ## Features
 
 - Trending movies section
 - Browse by genre with pagination and progress indicators
 - Supabase authentication with protected routes
 - Data fetching/caching with TanStack Query
 
 
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
 ```
 
 These are required by `utils/supabase/client.ts` and `utils/supabase/middleware.ts`.
 
 
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
 
 1) Sign up / log in. The app uses Supabase for auth and persists sessions.
 2) If you’re a new user, you’ll be redirected to `/onboarding` to select interests.
 3) Explore the home page:
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

