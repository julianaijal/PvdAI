import type { Metadata } from "next";
import "./globals.scss";

const title = "PvdAI — Statuten & Reglementen van de PvdA";
const description =
  "Doorzoek en stel vragen over de statuten en reglementen van de Partij van de Arbeid. AI-gestuurde antwoorden in begrijpelijke taal.";
const url = "https://pvdai.vercel.app";

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
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "PvdAI — Stel vragen over de statuten van de PvdA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "theme-color": "#E30613",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
