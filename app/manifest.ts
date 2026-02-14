import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PvdAI — Statuten & Reglementen van de PvdA",
    short_name: "PvdAI",
    description:
      "Doorzoek de statuten en reglementen van de PvdA met AI. Stel vragen in gewone taal en krijg direct antwoord. Gratis, open source en onafhankelijk.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#E30613",
    lang: "nl",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
