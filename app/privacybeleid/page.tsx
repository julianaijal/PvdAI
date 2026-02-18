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
            gebruiken zonder je te identificeren.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Verwerking door OpenAI</h2>
          <p>
            Wanneer je een vraag stelt, wordt de tekst van je vraag
            doorgestuurd naar de API van OpenAI. Bij een gesprek met meerdere
            berichten wordt ook de gespreksgeschiedenis meegestuurd. OpenAI
            verwerkt deze gegevens om een antwoord te genereren.
          </p>
          <p>
            PvdAI stuurt uitdrukkelijk de instructie mee dat OpenAI de
            gegevens niet mag opslaan voor trainingsdoeleinden (
            <code>store: false</code>). PvdAI zelf slaat de inhoud van
            vragen of antwoorden niet op. Raadpleeg het{" "}
            <a
              href="https://openai.com/policies/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              privacybeleid van OpenAI
            </a>{" "}
            voor de volledige verwerkingsvoorwaarden van OpenAI.
          </p>
          <p>
            Om dubbele verwerkingen te voorkomen kunnen vragen tijdelijk in
            het geheugen van de server worden gecacht. Dit cache verdwijnt bij
            een herstart van de server en wordt niet gedeeld.
          </p>
        </section>

        <section className={styles.section}>
          <h2>IP-adressen en gebruikslimiet</h2>
          <p>
            Om overmatig gebruik te beperken geldt een maximum van 20 vragen
            per dag per IP-adres. Daarvoor wordt een SHA-256-hash van je
            IP-adres opgeslagen in een Redis-database met een vervaltijd van
            24 uur. Na 24 uur wordt de hash automatisch verwijderd. Je
            werkelijke IP-adres wordt nooit opgeslagen. De hashes worden niet
            gedeeld met derden en niet voor andere doeleinden gebruikt.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Analytische gegevens</h2>
          <p>
            PvdAI maakt gebruik van{" "}
            <a
              href="https://vercel.com/docs/analytics"
              target="_blank"
              rel="noopener noreferrer"
            >
              Vercel Analytics
            </a>{" "}
            en{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics 4
            </a>
            . Deze diensten verzamelen gegevens over paginabezoeken,
            browsertype, apparaattype en globale locatie (land/stad). Google
            Analytics plaatst daarvoor cookies in je browser (zie hieronder).
            PvdAI heeft Google Signals en advertentiepersonalisatie
            uitgeschakeld, zodat je gegevens niet worden gebruikt voor
            advertentiedoeleinden.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Cookies en lokale opslag</h2>
          <p>
            Google Analytics 4 plaatst analytische cookies in je browser,
            waaronder <code>_ga</code> en <code>_ga_*</code>. Deze cookies
            worden gebruikt om bezoeken te onderscheiden en gebruiksstatistieken
            bij te houden.
          </p>
          <p>
            PvdAI slaat twee voorkeuren op via <code>localStorage</code> in
            je browser: je themakeuze (donker/licht) en of je de
            welkomstmelding hebt weggeklikt. Dit blijft lokaal op je apparaat
            en wordt niet naar servers verstuurd.
          </p>
          <p>
            Er worden geen advertentiecookies of third-party tracking-cookies
            geplaatst anders dan die van Google Analytics.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Beveiliging</h2>
          <p>
            De verbinding met PvdAI verloopt via HTTPS. API-sleutels zijn
            uitsluitend beschikbaar op de server en nooit zichtbaar voor
            bezoekers.
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
