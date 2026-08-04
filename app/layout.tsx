import type { Metadata } from "next";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/utils/seo/site";
import Script from "next/script";
import AnalyticsConsent from "@/components/Analytics/AnalyticsConsent";
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from "@/components/Common/Providers";
import GlobalLayout from "@/components/GlobalLayout";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: "Find movies and TV shows by mood, streaming service, runtime, decade, and occasion with SceneIt's AI-assisted recommendations.",
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, title: SITE_NAME, description: "AI-assisted movie and TV recommendations for your mood, time, and streaming services.", url: "/", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: "AI-assisted movie and TV recommendations for your mood, time, and streaming services.", images: ["/opengraph-image"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${geist.variable} font-sans`}>
      <Script id="sceneit-consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`}</Script>
      <body
        className="antialiased"
      >
        <Providers>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </Providers>
        <AnalyticsConsent />
      </body>
    </html>
  );
}
