"use client";

import { useState, useCallback } from "react";
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
          className={`${styles.browserPanel} ${activePanel === "browser" ? styles.panelActive : ""}`}
          aria-label="Documentbrowser"
          aria-hidden={activePanel !== "browser" ? true : undefined}
        >
          <DocumentBrowser
            toc={toc}
            highlightId={highlightId}
          />
        </section>
        <section
          className={`${styles.chatPanel} ${activePanel === "chat" ? styles.panelActive : ""}`}
          aria-label="Chat"
          aria-hidden={activePanel !== "chat" ? true : undefined}
        >
          <Chat onArticleClick={handleArticleClick} />
        </section>
      </main>
    </div>
  );
}
