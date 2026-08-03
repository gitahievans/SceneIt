"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "sceneit-analytics-consent";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackEvent(name: string, parameters: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || window.localStorage.getItem(KEY) !== "granted") return;
  (window as any).gtag?.("event", name, parameters);
}

export default function AnalyticsConsent() {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  useEffect(() => { setConsent(window.localStorage.getItem(KEY) as "granted" | "denied" | null); }, []);
  const choose = (value: "granted" | "denied") => {
    window.localStorage.setItem(KEY, value); setConsent(value);
    (window as any).gtag?.("consent", "update", { analytics_storage: value });
  };
  return <>
    {GA_ID && consent === "granted" && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="sceneit-ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('consent','update',{analytics_storage:'granted'});gtag('config','${GA_ID}',{anonymize_ip:true});`}</Script>
    </>}
    {GA_ID && consent === null && <aside aria-label="Analytics consent" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900"><p className="text-sm text-gray-700 dark:text-gray-200">SceneIt uses optional analytics to understand which recommendations are useful. Analytics remains off unless you allow it.</p><div className="mt-3 flex gap-3"><button onClick={()=>choose("granted")} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white">Allow analytics</button><button onClick={()=>choose("denied")} className="rounded-lg border px-4 py-2 text-sm dark:border-gray-700 dark:text-white">Keep off</button></div></aside>}
  </>;
}
