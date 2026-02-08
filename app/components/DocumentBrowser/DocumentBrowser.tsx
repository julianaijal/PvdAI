"use client";

import { useState } from "react";
import styles from "./DocumentBrowser.module.scss";

interface Section {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Section[];
}

interface DocumentBrowserProps {
  structure: Section[];
  highlightId?: string | null;
}

function TOCItem({
  section,
  onSelect,
  highlightId,
}: {
  section: Section;
  onSelect: (id: string) => void;
  highlightId?: string | null;
}) {
  const [expanded, setExpanded] = useState(section.level === 0);
  const hasChildren = section.children.length > 0;

  return (
    <li className={styles.tocItem}>
      <div
        className={`${styles.tocLabel} ${highlightId === section.id ? styles.tocActive : ""}`}
        style={{ paddingLeft: `${section.level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            className={styles.tocToggle}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Inklappen" : "Uitklappen"}
          >
            {expanded ? "▾" : "▸"}
          </button>
        )}
        <button
          className={styles.tocLink}
          onClick={() => onSelect(section.id)}
        >
          {section.title}
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className={styles.tocChildren}>
          {section.children.map((child) => (
            <TOCItem
              key={child.id}
              section={child}
              onSelect={onSelect}
              highlightId={highlightId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function SectionContent({
  section,
}: {
  section: Section;
}) {
  return (
    <div id={section.id} className={styles.section}>
      {section.level === 0 && (
        <h2 className={styles.sectionTitle}>{section.title}</h2>
      )}
      {section.level === 1 && (
        <h3 className={styles.chapterTitle}>{section.title}</h3>
      )}
      {section.level === 2 && (
        <h4 className={styles.articleTitle}>{section.title}</h4>
      )}
      {section.content && (
        <div className={styles.sectionContent}>
          {section.content.split("\n").map((line, i) => (
            <p key={i} className={styles.paragraph}>
              {line}
            </p>
          ))}
        </div>
      )}
      {section.children.map((child) => (
        <SectionContent key={child.id} section={child} />
      ))}
    </div>
  );
}

export default function DocumentBrowser({
  structure,
  highlightId,
}: DocumentBrowserProps) {
  const [tocOpen, setTocOpen] = useState(true);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className={styles.browser}>
      <div className={styles.tocHeader}>
        <button
          className={styles.tocHeaderToggle}
          onClick={() => setTocOpen(!tocOpen)}
        >
          {tocOpen ? "▾" : "▸"} Inhoudsopgave
        </button>
      </div>
      {tocOpen && (
        <nav className={styles.toc}>
          <ul className={styles.tocList}>
            {structure.map((section) => (
              <TOCItem
                key={section.id}
                section={section}
                onSelect={scrollToSection}
                highlightId={highlightId}
              />
            ))}
          </ul>
        </nav>
      )}
      <div className={styles.content}>
        {structure.map((section) => (
          <SectionContent key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
}
