import type { Metadata } from "next";
import Script from "next/script";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.scss";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const title = "PvdAI — Statuten & Reglementen van de PvdA";
const description =
  "Doorzoek de statuten en reglementen van de PvdA met AI. Stel vragen in gewone taal en krijg direct antwoord. Gratis, open source en onafhankelijk.";
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
  alternates: {
    canonical: "https://pvdai.tech",
    languages: { nl: "https://pvdai.tech", "x-default": "https://pvdai.tech" },
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="nl" className={inter.variable}>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("theme");if(t==="light")document.documentElement.setAttribute("data-theme","light")})()`,
          }}
        />
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js')})}`,
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
                  sameAs: ["https://github.com/julianaijal/PvdAI"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: "https://pvdai.tech/?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
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
                  datePublished: "2024-06-01",
                  dateModified: new Date().toISOString().split("T")[0],
                  author: { "@type": "Person", name: "Julian Aijal" },
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://pvdai.tech/#faq",
                  mainEntity: [
                    {
                      "@type": "Question",
                      name: "Hoe word ik lid van de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Je kunt lid worden als je 16 jaar of ouder bent. Je meldt je aan bij de partij en het bestuur beslist over je toelating.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Wat doet het congres van de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Het congres is het hoogste orgaan van de PvdA. Het stelt het politiek programma vast, wijzigt statuten en reglementen, en kiest het partijbestuur.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Hoe wordt de lijsttrekker van de PvdA gekozen?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "De lijsttrekker wordt gekozen door de leden via een ledenraadpleging of door het congres, afhankelijk van de procedure die het partijbestuur vaststelt.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Wat is het verschil tussen statuten en reglementen?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Statuten zijn de grondregels van de partij en kunnen alleen door het congres gewijzigd worden. Reglementen werken de statuten verder uit en bevatten praktische regels.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Welke organen heeft de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "De PvdA heeft onder andere het congres, het partijbestuur, de Politieke Ledenraad, de Verenigingsraad, afdelingen, gewesten en diverse commissies.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Hoe kan ik de statuten van de PvdA doorzoeken?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Met PvdAI kun je de statuten en reglementen van de PvdA doorzoeken via een AI-gestuurde zoekmachine. Je kunt vragen stellen in gewone taal en krijgt direct antwoord.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is PvdAI gratis te gebruiken?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ja, PvdAI is volledig gratis en open source. Je kunt het gebruiken zonder account of registratie.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Zijn de statuten van de PvdA openbaar?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ja, de statuten en reglementen van de PvdA zijn openbaar beschikbaar. Het officiële document is te vinden op de website van de PvdA.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Kan ik vragen stellen over de reglementen van de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ja, PvdAI heeft een AI-chatfunctie waarmee je in gewone taal vragen kunt stellen over zowel de statuten als de reglementen van de PvdA.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Is PvdAI een officieel product van de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Nee, PvdAI is een onafhankelijk open-source project en is niet gelieerd aan of goedgekeurd door de PvdA. Raadpleeg altijd het officiële document voor bindende informatie.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Wat zijn de statuten van een politieke partij?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Statuten zijn de grondregels van een politieke partij. Ze beschrijven hoe de partij is georganiseerd, wie lid kan worden, hoe besluiten worden genomen en welke organen de partij heeft.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Hoe is de PvdA georganiseerd?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "De PvdA is opgebouwd uit lokale afdelingen, gewesten, een congres, een partijbestuur, een Politieke Ledenraad en diverse commissies. Het congres is het hoogste orgaan.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Waar vind ik de reglementen van de PvdA?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "De officiële reglementen zijn beschikbaar op de website van de PvdA als PDF. Je kunt ze ook doorzoeken via PvdAI, een gratis AI-tool die de reglementen toegankelijk maakt.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Hoe werkt de AI-chat van PvdAI?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "De AI-chat zoekt relevante passages in de statuten en reglementen op basis van je vraag en geeft een antwoord in begrijpelijk Nederlands. Het verwijst altijd naar de specifieke artikelen.",
                      },
                    },
                    {
                      "@type": "Question",
                      name: "Kan ik als niet-lid de PvdA-statuten inzien?",
                      acceptedAnswer: {
                        "@type": "Answer",
                        text: "Ja, de statuten en reglementen zijn openbaar. Iedereen kan ze inzien via de officiële PvdA-website of doorzoeken via PvdAI.",
                      },
                    },
                  ],
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
          strategy="lazyOnload"
          nonce={nonce}
        />
        <Script id="gtag-init" strategy="lazyOnload" nonce={nonce}>
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-H4VK7HXVHV',{'allow_google_signals':false,'allow_ad_personalization_signals':false});`}
        </Script>
      </body>
    </html>
  );
}
