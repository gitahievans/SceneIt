import type { Metadata } from "next";
import "./globals.css";
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import Providers from "@/components/Providers";
import GlobalLayout from "@/components/GlobalLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "SceneIt",
  description: "Bring the Fun to your next Scene",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Providers>
          <GlobalLayout>
            {children}
          </GlobalLayout>
        </Providers>
      </body>
    </html>
  );
}
