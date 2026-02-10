import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PvdAI — Statuten & Reglementen van de PvdA",
    short_name: "PvdAI",
    description:
      "Doorzoek en stel vragen over de statuten en reglementen van de Partij van de Arbeid.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#E30613",
    lang: "nl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
