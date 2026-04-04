import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cairo } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "@/app/globals.css";
import { LanguageProvider } from "@/components/language-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const googleSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-main",
  weight: ["400", "500", "600", "700", "800"]
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-ar",
  weight: ["400", "600", "700"]
});

export const metadata: Metadata = {
  title: {
    default: "JobRadar.ma - Jobs Maroc clairs et fiables",
    template: "%s | JobRadar.ma"
  },
  description:
    "Agrégateur d'offres d'emploi au Maroc: recherche rapide, données structurées, badge de confiance, redirection vers la source officielle.",
  openGraph: {
    title: "JobRadar.ma",
    description: "Découvre les offres d'emploi au Maroc et postule directement depuis la source.",
    url: "https://jobradar.ma",
    siteName: "JobRadar.ma",
    locale: "fr_MA",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  return (
    <html lang="fr" suppressHydrationWarning className={`${googleSans.variable} ${cairo.variable}`}>
      <head>
        {adsenseId ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider>
          <div className="min-h-screen">
            <Suspense fallback={<div className="h-16 border-b border-border/80 bg-background/95" />}>
              <SiteHeader />
            </Suspense>
            <main className="container py-6">{children}</main>
            <SiteFooter />
          </div>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
