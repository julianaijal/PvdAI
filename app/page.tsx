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
        <section>
          <h3>Wat staat er in de statuten van de PvdA?</h3>
          <p>Hoofdstuk 1 (Algemeen) beschrijft de naam, het doel en de grondbeginselen van de partij. Hoofdstuk 2 (De leden) regelt wie lid kan worden, hoe het lidmaatschap eindigt en welke rechten en plichten leden hebben. Hoofdstuk 3 (Geledingen) behandelt de organisatiestructuur: afdelingen, gewesten, het congres, het partijbestuur, de Politieke Ledenraad en de Verenigingsraad. Hoofdstuk 4 (Overige bepalingen) bevat regels over financiën, statutenwijziging en ontbinding.</p>
        </section>
        <section>
          <h3>Wat staat er in de reglementen van de PvdA?</h3>
          <p>Deel 1 (Algemeen deel) werkt de statuten verder uit met regels over vergaderorde, ledenraadplegingen, lidmaatschapsprocedures, bemiddeling en beroep, geldmiddelen en integriteit. Deel 2 behandelt de afdelingen, Deel 3 de gewesten. Deel 4 beschrijft de landelijke organen: het Congres, de Politieke Ledenraad, de Verenigingsraad en het Partijbestuur. De Delen 5 tot en met 10 regelen de kandidaatstelling voor lokale, provinciale, nationale en Europese verkiezingen.</p>
        </section>
        <section>
          <h3>Lidmaatschap van de PvdA</h3>
          <p>Je kunt lid worden van de PvdA als je 16 jaar of ouder bent en de beginselen van de partij onderschrijft. Aanmelding verloopt via de afdeling. Het partijbestuur beslist over toelating. Leden hebben stemrecht op de ledenraadpleging en het congres, en kunnen zich kandidaat stellen voor partijfuncties.</p>
        </section>
        <section>
          <h3>Congres en besluitvorming</h3>
          <p>Het congres is het hoogste orgaan van de PvdA en vergadert minimaal tweemaal per jaar. Het stelt het politieke programma vast, wijzigt statuten en reglementen, en kiest het partijbestuur. Elk lid kan via de afdeling moties en amendementen indienen.</p>
        </section>
        <section>
          <h3>Kandidaatstelling en verkiezingen</h3>
          <p>De reglementen bevatten gedetailleerde procedures voor kandidaatstelling bij gemeenteraads-, provinciale staten-, Tweede Kamer-, Eerste Kamer- en Europese Parlementsverkiezingen. Dit omvat de samenstelling van adviescommissies, de rol van de ledenraadpleging en de vaststelling van de kandidatenlijst.</p>
        </section>
        <nav>
          <h3>Inhoudsopgave</h3>
          <ul>
            {toc.map((section: { id: string; title: string; children: { id: string; title: string; children: { id: string; title: string }[] }[] }) => (
              <li key={section.id}>
                {section.title}
                {section.children.length > 0 && (
                  <ul>
                    {section.children.map((child) => (
                      <li key={child.id}>
                        {child.title}
                        {child.children?.length > 0 && (
                          <ul>
                            {child.children.map((sub) => (
                              <li key={sub.id}>{sub.title}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
