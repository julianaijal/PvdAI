import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Veelgestelde vragen over PvdA-statuten en -reglementen",
  description:
    "Antwoorden op veelgestelde vragen over de statuten en reglementen van de PvdA: lidmaatschap, congres, kandidaatstelling, organen en meer. Doorzoek alles met PvdAI.",
  alternates: {
    canonical: "https://pvdai.tech/veelgestelde-vragen",
    languages: {
      nl: "https://pvdai.tech/veelgestelde-vragen",
      "x-default": "https://pvdai.tech/veelgestelde-vragen",
    },
  },
  openGraph: {
    title: "Veelgestelde vragen over PvdA-statuten en -reglementen",
    description:
      "Antwoorden op veelgestelde vragen over de statuten en reglementen van de PvdA.",
    url: "https://pvdai.tech/veelgestelde-vragen",
  },
};

const faqs = [
  {
    question: "Hoe word ik lid van de PvdA?",
    answer:
      "Je kunt lid worden als je 16 jaar of ouder bent. Je meldt je aan bij de partij en het bestuur beslist over je toelating.",
  },
  {
    question: "Wat doet het congres van de PvdA?",
    answer:
      "Het congres is het hoogste orgaan van de PvdA. Het stelt het politiek programma vast, wijzigt statuten en reglementen, en kiest het partijbestuur.",
  },
  {
    question: "Hoe wordt de lijsttrekker van de PvdA gekozen?",
    answer:
      "De lijsttrekker wordt gekozen door de leden via een ledenraadpleging of door het congres, afhankelijk van de procedure die het partijbestuur vaststelt.",
  },
  {
    question: "Wat is het verschil tussen statuten en reglementen?",
    answer:
      "Statuten zijn de grondregels van de partij en kunnen alleen door het congres gewijzigd worden. Reglementen werken de statuten verder uit en bevatten praktische regels.",
  },
  {
    question: "Welke organen heeft de PvdA?",
    answer:
      "De PvdA heeft onder andere het congres, het partijbestuur, de Politieke Ledenraad, de Verenigingsraad, afdelingen, gewesten en diverse commissies.",
  },
  {
    question: "Hoe kan ik de statuten van de PvdA doorzoeken?",
    answer:
      "Met PvdAI kun je de statuten en reglementen van de PvdA doorzoeken via een AI-gestuurde zoekmachine. Je kunt vragen stellen in gewone taal en krijgt direct antwoord.",
  },
  {
    question: "Is PvdAI gratis te gebruiken?",
    answer:
      "Ja, PvdAI is volledig gratis en open source. Je kunt het gebruiken zonder account of registratie.",
  },
  {
    question: "Zijn de statuten van de PvdA openbaar?",
    answer:
      "Ja, de statuten en reglementen van de PvdA zijn openbaar beschikbaar. Het officiële document is te vinden op de website van de PvdA.",
  },
  {
    question: "Kan ik vragen stellen over de reglementen van de PvdA?",
    answer:
      "Ja, PvdAI heeft een AI-chatfunctie waarmee je in gewone taal vragen kunt stellen over zowel de statuten als de reglementen van de PvdA.",
  },
  {
    question: "Is PvdAI een officieel product van de PvdA?",
    answer:
      "Nee, PvdAI is een onafhankelijk open-source project en is niet gelieerd aan of goedgekeurd door de PvdA. Raadpleeg altijd het officiële document voor bindende informatie.",
  },
  {
    question: "Wat zijn de statuten van een politieke partij?",
    answer:
      "Statuten zijn de grondregels van een politieke partij. Ze beschrijven hoe de partij is georganiseerd, wie lid kan worden, hoe besluiten worden genomen en welke organen de partij heeft.",
  },
  {
    question: "Hoe is de PvdA georganiseerd?",
    answer:
      "De PvdA is opgebouwd uit lokale afdelingen, gewesten, een congres, een partijbestuur, een Politieke Ledenraad en diverse commissies. Het congres is het hoogste orgaan.",
  },
  {
    question: "Waar vind ik de reglementen van de PvdA?",
    answer:
      "De officiële reglementen zijn beschikbaar op de website van de PvdA als PDF. Je kunt ze ook doorzoeken via PvdAI, een gratis AI-tool die de reglementen toegankelijk maakt.",
  },
  {
    question: "Hoe werkt de AI-chat van PvdAI?",
    answer:
      "De AI-chat zoekt relevante passages in de statuten en reglementen op basis van je vraag en geeft een antwoord in begrijpelijk Nederlands. Het verwijst altijd naar de specifieke artikelen.",
  },
  {
    question: "Kan ik als niet-lid de PvdA-statuten inzien?",
    answer:
      "Ja, de statuten en reglementen zijn openbaar. Iedereen kan ze inzien via de officiële PvdA-website of doorzoeken via PvdAI.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "@id": "https://pvdai.tech/veelgestelde-vragen/#faq",
      name: "Veelgestelde vragen over PvdA-statuten en -reglementen",
      url: "https://pvdai.tech/veelgestelde-vragen",
      isPartOf: { "@id": "https://pvdai.tech/#website" },
      inLanguage: "nl",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://pvdai.tech/veelgestelde-vragen/#breadcrumb",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://pvdai.tech" },
        {
          "@type": "ListItem",
          position: 2,
          name: "Veelgestelde vragen",
          item: "https://pvdai.tech/veelgestelde-vragen",
        },
      ],
    },
  ],
};

export default function VeelgesteldeVragenPage() {
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
        <h1>Veelgestelde vragen</h1>
        <p className={styles.intro}>
          Antwoorden op veelgestelde vragen over de statuten en reglementen van
          de PvdA en over het gebruik van PvdAI.
        </p>

        <ol className={styles.faqList}>
          {faqs.map(({ question, answer }) => (
            <li key={question} className={styles.faqItem}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </li>
          ))}
        </ol>

        <div className={styles.cta}>
          <Link href="/" className={styles.ctaButton}>
            Stel zelf een vraag
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <nav>
          <Link href="/">Home</Link>
          {" · "}
          <Link href="/over">Over PvdAI</Link>
          {" · "}
          <Link href="/privacybeleid">Privacybeleid</Link>
        </nav>
      </footer>
    </div>
  );
}
