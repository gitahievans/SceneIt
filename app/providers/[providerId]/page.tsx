import { Suspense } from "react";
import ProviderResults from "@/components/Providers/ProviderResults";

export default async function ProviderPage({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = await params;
  return <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10">Loading provider catalog…</main>}><ProviderResults providerId={providerId} /></Suspense>;
}
