import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.scss";

const title = "PvdAI — Statuten & Reglementen van de PvdA";
const description =
  "Doorzoek en stel vragen over de statuten en reglementen van de Partij van de Arbeid. AI-gestuurde antwoorden in begrijpelijke taal. Geen officieel product van of goedgekeurd door de PvdA.";
const url = "https://pvdai.tech";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s | PvdAI",
  },
  description,
  metadataBase: new URL(url),
  keywords: [
    "PvdA",
    "statuten",
    "reglementen",
    "Partij van de Arbeid",
    "AI",
    "vraag en antwoord",
    "politiek",
    "Nederland",
  ],
  authors: [{ name: "Julian Aijal" }],
  openGraph: {
    title,
    description,
    url,
    siteName: "PvdAI",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#E30613",
    "apple-mobile-web-app-title": "PvdAI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")})()`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://pvdai.tech/#website",
                  name: "PvdAI",
                  url: "https://pvdai.tech",
                  description,
                  inLanguage: "nl",
                  isAccessibleForFree: true,
                },
                {
                  "@type": "WebPage",
                  "@id": "https://pvdai.tech/#webpage",
                  name: title,
                  url: "https://pvdai.tech",
                  isPartOf: { "@id": "https://pvdai.tech/#website" },
                  description,
                  inLanguage: "nl",
                  isAccessibleForFree: true,
                  author: { "@type": "Person", name: "Julian Aijal" },
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://pvdai.tech/#app",
                  name: "PvdAI",
                  url: "https://pvdai.tech",
                  applicationCategory: "ReferenceApplication",
                  operatingSystem: "Any",
                  browserRequirements: "Requires a modern browser with JavaScript enabled",
                  inLanguage: "nl",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "EUR",
                  },
                  featureList:
                    "AI-gestuurde vraag en antwoord, documentbrowser, zoekfunctie, donker/licht thema",
                  author: { "@type": "Person", name: "Julian Aijal" },
                  license: "https://opensource.org/licenses/MIT",
                },
                {
                  "@type": "DigitalDocument",
                  "@id": "https://pvdai.tech/#document",
                  name: "Statuten en reglementen PvdA 2023",
                  url: "https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf",
                  encodingFormat: "application/pdf",
                  inLanguage: "nl",
                  datePublished: "2023",
                  isAccessibleForFree: true,
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H4VK7HXVHV"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-H4VK7HXVHV');`}
        </Script>
      </body>
    </html>
  );
}
