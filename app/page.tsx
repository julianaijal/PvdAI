import { readFileSync } from "fs";
import { join } from "path";
import MainLayout from "./components/MainLayout/MainLayout";
import styles from "./page.module.scss";

function getToc() {
  const data = readFileSync(
    join(process.cwd(), "data", "toc.json"),
    "utf-8"
  );
  return JSON.parse(data);
}

export default function Home() {
  const toc = getToc();

  return (
    <>
      <MainLayout toc={toc} />
      <div className={styles.summary} aria-hidden="true">
        <h2>PvdAI — AI-documentbrowser voor PvdA Statuten &amp; Reglementen</h2>
        <p>
          PvdAI maakt de statuten en reglementen van de Partij van de Arbeid
          (PvdA) doorzoekbaar met behulp van kunstmatige intelligentie. Blader
          door het volledige document, stel vragen in gewone taal en ontvang
          direct antwoord op basis van de officiële tekst.
        </p>
        <p>
          De AI-assistent beantwoordt vragen over onder andere de structuur van
          de partij, lidmaatschap, afdelingen, congressen, kandidaatstellingen en
          geschillenbeslechting. Antwoorden worden gegeven in begrijpelijk
          Nederlands (B1-niveau).
        </p>
        <p>
          PvdAI is een onafhankelijk open-source project en is niet gelieerd aan
          of goedgekeurd door de PvdA. Raadpleeg altijd het officiële document
          voor bindende informatie.
        </p>
      </div>
    </>
  );
}
