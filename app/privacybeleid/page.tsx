import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Privacybeleid — PvdAI",
  description:
    "Het privacybeleid van PvdAI: welke gegevens worden verwerkt, hoe werkt de beveiliging en wat zijn je rechten als gebruiker.",
  alternates: {
    canonical: "https://pvdai.tech/privacybeleid",
    languages: {
      nl: "https://pvdai.tech/privacybeleid",
      "x-default": "https://pvdai.tech/privacybeleid",
    },
  },
  openGraph: {
    title: "Privacybeleid — PvdAI",
    description: "Het privacybeleid van PvdAI.",
    url: "https://pvdai.tech/privacybeleid",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://pvdai.tech/privacybeleid/#webpage",
  name: "Privacybeleid — PvdAI",
  url: "https://pvdai.tech/privacybeleid",
  isPartOf: { "@id": "https://pvdai.tech/#website" },
  inLanguage: "nl",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://pvdai.tech" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Privacybeleid",
        item: "https://pvdai.tech/privacybeleid",
      },
    ],
  },
};

export default function PrivacybeleidPage() {
  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          Pvd<span className={styles.logoAccent}>AI</span>
        </Link>
      </header>

      <main className={styles.main}>
        <h1>Privacybeleid</h1>
        <p className={styles.meta}>Laatst bijgewerkt: februari 2026</p>

        <section className={styles.section}>
          <h2>Geen account nodig</h2>
          <p>
            PvdAI vereist geen registratie of account. Je kunt de tool
            anoniem gebruiken zonder persoonlijke gegevens achter te laten.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Welke gegevens worden verwerkt?</h2>
          <p>
            Wanneer je een vraag stelt via de AI-chat, wordt die vraag
            doorgestuurd naar de API van OpenAI voor verwerking. OpenAI
            verwerkt de tekst van je vraag om een antwoord te genereren.
            Raadpleeg het{" "}
            <a
              href="https://openai.com/policies/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacybeleid van OpenAI
            </a>{" "}
            voor meer informatie over hoe zij met gegevens omgaan.
          </p>
          <p>
            PvdAI slaat de inhoud van vragen of antwoorden niet op in een
            eigen database. Er worden geen gespreksgeschiedenissen bewaard.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Gebruik van IP-adressen</h2>
          <p>
            Om misbruik te voorkomen geldt een limiet van 20 vragen per dag
            per IP-adres. Daarvoor wordt je IP-adres tijdelijk in het
            geheugen van de server bewaard. Dit wordt niet opgeslagen in een
            database en wordt niet gedeeld met derden.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Analytische gegevens</h2>
          <p>
            PvdAI maakt gebruik van Vercel Analytics en Google Analytics
            (geanonimiseerd) voor inzicht in het bezoekersaantal en de
            gebruikte apparaten. Er worden geen individuele gebruikers
            gevolgd. Er worden geen advertentietrackers gebruikt.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Cookies</h2>
          <p>
            PvdAI gebruikt alleen functionele opslag via{" "}
            <code>localStorage</code> in je browser, voor voorkeuren zoals
            het kleurthema (donker/licht). Er worden geen tracking-cookies
            geplaatst.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Beveiliging</h2>
          <p>
            De verbinding met PvdAI is beveiligd via HTTPS. API-sleutels zijn
            nooit zichtbaar voor bezoekers.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact</h2>
          <p>
            PvdAI is een onafhankelijk open-source project van{" "}
            <a
              href="https://github.com/julianaijal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Julian Aijal
            </a>
            . De broncode is beschikbaar op{" "}
            <a
              href="https://github.com/julianaijal/PvdAI"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            . Voor vragen of opmerkingen kun je een issue aanmaken op GitHub.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaButton}>
            Terug naar PvdAI
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <nav>
          <Link href="/">Home</Link>
          {" · "}
          <Link href="/over">Over PvdAI</Link>
          {" · "}
          <Link href="/veelgestelde-vragen">Veelgestelde vragen</Link>
        </nav>
      </footer>
    </div>
  );
}
