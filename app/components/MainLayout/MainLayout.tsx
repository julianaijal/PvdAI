"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import DocumentBrowser from "../DocumentBrowser/DocumentBrowser";
import styles from "./MainLayout.module.scss";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Chat = dynamic(() => import("../Chat/Chat"), {
  loading: () => <div className={styles.chatLoading}>Laden...</div>,
});

interface TocItem {
  id: string;
  title: string;
  level: number;
  children: TocItem[];
}

interface MainLayoutProps {
  toc: TocItem[];
}

export default function MainLayout({ toc }: MainLayoutProps) {
  const [activePanel, setActivePanel] = useState<"browser" | "chat">("chat");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const isMobile = useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia("(max-width: 768px)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 768px)").matches,
    () => false,
  );
  const browserPanelRef = useRef<HTMLElement>(null);
  const chatPanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Only manage focus on mobile
    if (!isMobile) return;
    const panelRef = activePanel === "browser" ? browserPanelRef : chatPanelRef;
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus({ preventScroll: true });
  }, [activePanel, isMobile]);

  const handleArticleClick = useCallback((articleId: string) => {
    setHighlightId(articleId);
    setActivePanel("browser");
    setTimeout(() => {
      const el = document.getElementById(articleId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }, []);

  return (
    <div className={styles.layout}>
      <a href="#main-content" className="skip-link">
        Ga naar inhoud
      </a>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Pvd<span>AI</span></h1>
          <span className={styles.tagline}>
            Stel vragen over de statuten en reglementen van de PvdA
          </span>
        </div>
        <div className={styles.headerRight}>
          <nav className={styles.mobileNav} aria-label="Paneelnavigatie">
            <button
              className={`${styles.navButton} ${activePanel === "browser" ? styles.navActive : ""}`}
              onClick={() => setActivePanel("browser")}
              aria-pressed={activePanel === "browser"}
            >
              Document
            </button>
            <button
              className={`${styles.navButton} ${activePanel === "chat" ? styles.navActive : ""}`}
              onClick={() => setActivePanel("chat")}
              aria-pressed={activePanel === "chat"}
            >
              Chat
            </button>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content" className={styles.main}>
        <section
          ref={browserPanelRef}
          className={`${styles.browserPanel} ${activePanel === "browser" ? styles.panelActive : ""}`}
          aria-label="Documentbrowser"
          {...(isMobile && activePanel !== "browser" ? { inert: true } : {})}
        >
          <DocumentBrowser
            toc={toc}
            highlightId={highlightId}
          />
        </section>
        <section
          ref={chatPanelRef}
          className={`${styles.chatPanel} ${activePanel === "chat" ? styles.panelActive : ""}`}
          aria-label="Chat"
          {...(isMobile && activePanel !== "chat" ? { inert: true } : {})}
        >
          <Chat onArticleClick={handleArticleClick} toc={toc} />
        </section>
      </main>
      <footer className={styles.footer}>
        <p>
          <a href="https://github.com/julianaijal/PvdAI" target="_blank" rel="noopener noreferrer">
            PvdAI
          </a>{" "}
          is een onafhankelijk open-source project van{" "}
          <a href="https://github.com/julianaijal" target="_blank" rel="noopener noreferrer">
            Julian Aijal
          </a>.
          Dit is geen officieel product van en niet goedgekeurd door de Partij van de Arbeid (PvdA).
          Antwoorden worden gegenereerd door AI en kunnen onjuistheden bevatten.
          Aan de inhoud kunnen geen rechten worden ontleend.
          Raadpleeg altijd het{" "}
          <a
            href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            officiële document
          </a>{" "}
          voor bindende informatie.
          Je vragen worden niet opgeslagen of gebruikt voor AI-training.
          Er worden geen persoonsgegevens bewaard.
          De broncode is openbaar beschikbaar op{" "}
          <a href="https://github.com/julianaijal/PvdAI" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>.
        </p>
      </footer>
    </div>
  );
}
