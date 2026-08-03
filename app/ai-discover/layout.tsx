import type { Metadata } from "next";
export const metadata: Metadata = { alternates: { canonical: "/ai-movie-recommendations" }, robots: { index: false, follow: true } };
export default function Layout({children}:{children:React.ReactNode}){return children;}
