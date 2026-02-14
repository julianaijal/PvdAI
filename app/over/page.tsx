import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Over PvdAI — AI-documentbrowser voor PvdA-statuten",
  description:
    "PvdAI is een gratis, open-source AI-tool waarmee je de statuten en reglementen van de PvdA kunt doorzoeken en er vragen over kunt stellen. Onafhankelijk en niet gelieerd aan de PvdA.",
  alternates: {
    canonical: "https://pvdai.tech/over",
    languages: { nl: "https://pvdai.tech/over" },
  },
  openGraph: {
    title: "Over PvdAI — AI-documentbrowser voor PvdA-statuten",
    description:
      "Gratis AI-tool om de statuten en reglementen van de PvdA te doorzoeken. Open source en onafhankelijk.",
    url: "https://pvdai.tech/over",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": "https://pvdai.tech/over/#webpage",
      name: "Over PvdAI",
      url: "https://pvdai.tech/over",
      isPartOf: { "@id": "https://pvdai.tech/#website" },
      description:
        "PvdAI is een gratis, open-source AI-tool waarmee je de statuten en reglementen van de PvdA kunt doorzoeken.",
      inLanguage: "nl",
      breadcrumb: { "@id": "https://pvdai.tech/over/#breadcrumb" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://pvdai.tech/over/#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://pvdai.tech",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Over PvdAI",
          item: "https://pvdai.tech/over",
        },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "PvdAI",
      url: "https://pvdai.tech",
      applicationCategory: "ReferenceApplication",
      operatingSystem: "Any",
      inLanguage: "nl",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      author: {
        "@type": "Person",
        name: "Julian Aijal",
        url: "https://github.com/julianaijal",
      },
      license: "https://opensource.org/licenses/MIT",
    },
  ],
};

export default function OverPage() {
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
        <h1>Over PvdAI</h1>

        <section className={styles.section}>
          <h2>Wat is PvdAI?</h2>
          <p>
            PvdAI is een AI-gestuurde documentbrowser waarmee je de statuten en
            reglementen van de Partij van de Arbeid (PvdA) kunt doorzoeken. Stel
            vragen in gewone taal en ontvang direct antwoord in begrijpelijk
            Nederlands.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Hoe werkt het?</h2>
          <ul>
            <li>
              <strong>Documentbrowser</strong> — Blader door de volledige
              statuten en reglementen via een overzichtelijke inhoudsopgave.
            </li>
            <li>
              <strong>AI-chat</strong> — Stel vragen in gewone taal. De AI zoekt
              de relevante artikelen op en geeft een antwoord op B1-niveau.
            </li>
            <li>
              <strong>Verwijzingen</strong> — Elk antwoord verwijst naar de
              specifieke artikelen, zodat je altijd de bron kunt controleren.
            </li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Voor wie?</h2>
          <p>
            PvdAI is bedoeld voor iedereen die snel iets wil opzoeken in de
            partijregels van de PvdA: leden, journalisten, onderzoekers of
            ge&iuml;nteresseerde burgers.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Gratis en open source</h2>
          <p>
            PvdAI is volledig gratis te gebruiken, zonder account of
            registratie. De broncode is beschikbaar op{" "}
            <a
              href="https://github.com/julianaijal/PvdAI"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </section>

        <section className={styles.section}>
          <h2>Disclaimer</h2>
          <p>
            PvdAI is een onafhankelijk open-source project en is niet gelieerd
            aan of goedgekeurd door de PvdA. Raadpleeg altijd het{" "}
            <a
              href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              offici&euml;le document
            </a>{" "}
            voor bindende informatie.
          </p>
        </section>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaButton}>
            Probeer PvdAI
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>
          Gemaakt door{" "}
          <a
            href="https://github.com/julianaijal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Julian Aijal
          </a>
        </p>
      </footer>
    </div>
  );
}
