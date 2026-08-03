import type { Metadata } from "next";
import AiDiscoverPage from "@/app/ai-discover/page";
import { pageMetadata } from "@/utils/seo/metadata";

export const metadata: Metadata = pageMetadata("AI Movie Recommendations", "Describe your mood, runtime, provider, or occasion and get useful movie recommendations from SceneIt AI.", "/ai-movie-recommendations");
export default function Page() { return <AiDiscoverPage />; }
