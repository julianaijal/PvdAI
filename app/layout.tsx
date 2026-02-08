import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "PvdAI",
  description: "Stel vragen over de statuten en reglementen van de PvdA",
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
