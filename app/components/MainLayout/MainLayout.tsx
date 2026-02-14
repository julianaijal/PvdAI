"use client";

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DocumentBrowser from "../DocumentBrowser/DocumentBrowser";
import styles from "./MainLayout.module.scss";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Chat = dynamic(() => import("../Chat/Chat"), {
  loading: () => <div className={styles.chatLoading}>Laden...</div>,
  ssr: false,
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

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "PvdAI — Statuten & Reglementen van de PvdA",
      text: "Doorzoek de statuten en reglementen van de PvdA met AI",
      url: "https://pvdai.tech",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
    }
  }, []);

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
      <div className={styles.accentBar} aria-hidden="true" />
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoLink}>
            <svg className={styles.logoRose} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5 5 3 6.5 3 9c0 2 1.5 3.5 3 4-0.5 1.5 0 3.5 1.5 4.5 1 0.7 2.2 0.8 3.2 0.5L12 21l1.3-3c1 0.3 2.2 0.2 3.2-0.5C18 16.5 18.5 14.5 18 13c1.5-0.5 3-2 3-4 0-2.5-2-4-4-3.5C16.5 3.5 14.5 2 12 2z"/>
            </svg>
            <h1 className={styles.logo}>Pvd<span>AI</span></h1>
          </div>
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
          <button
            className={styles.shareButton}
            onClick={handleShare}
            aria-label="Deel PvdAI"
            title="Deel PvdAI"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
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
          {isMobile && activePanel === "browser" && (
            <button
              className={styles.backToChat}
              onClick={() => setActivePanel("chat")}
              aria-label="Terug naar chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Terug naar chat
            </button>
          )}
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
          is een open-source project van{" "}
          <a href="https://github.com/julianaijal" target="_blank" rel="noopener noreferrer">
            Julian Aijal
          </a>{" "}
          — geen officieel product van de PvdA.
          AI-antwoorden kunnen onjuistheden bevatten; raadpleeg altijd het{" "}
          <a
            href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            officiële document
          </a>.
          Er worden geen gegevens opgeslagen.{" "}
          <Link href="/over">Over PvdAI</Link>
        </p>
      </footer>
    </div>
  );
}
