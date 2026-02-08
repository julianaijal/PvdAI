"use client";

import { useState, useCallback, useEffect, memo } from "react";
import styles from "./DocumentBrowser.module.scss";

interface TocItem {
  id: string;
  title: string;
  level: number;
  children: TocItem[];
}

interface Section {
  id: string;
  title: string;
  level: number;
  content: string;
  children: Section[];
}

interface DocumentBrowserProps {
  toc: TocItem[];
  highlightId?: string | null;
}

const TOCItem = memo(function TOCItem({
  item,
  onSelect,
  highlightId,
}: {
  item: TocItem;
  onSelect: (id: string) => void;
  highlightId?: string | null;
}) {
  const [expanded, setExpanded] = useState(item.level === 0);
  const hasChildren = item.children.length > 0;

  return (
    <li className={styles.tocItem} role="treeitem" aria-selected={highlightId === item.id} aria-expanded={hasChildren ? expanded : undefined}>
      <div
        className={`${styles.tocLabel} ${highlightId === item.id ? styles.tocActive : ""}`}
        style={{ paddingLeft: `${item.level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            className={styles.tocToggle}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={`${item.title} ${expanded ? "inklappen" : "uitklappen"}`}
          >
            <span aria-hidden="true">{expanded ? "\u25BE" : "\u25B8"}</span>
          </button>
        )}
        <button
          className={styles.tocLink}
          onClick={() => onSelect(item.id)}
          aria-current={highlightId === item.id ? "location" : undefined}
        >
          {item.title}
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className={styles.tocChildren} role="group">
          {item.children.map((child) => (
            <TOCItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              highlightId={highlightId}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

function SectionContent({ section }: { section: Section }) {
  const Tag = section.level === 0 ? "h2" : section.level === 1 ? "h3" : "h4";
  const titleClass =
    section.level === 0
      ? styles.sectionTitle
      : section.level === 1
        ? styles.chapterTitle
        : styles.articleTitle;

  return (
    <div id={section.id} className={styles.section}>
      <Tag className={titleClass}>{section.title}</Tag>
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
  toc,
  highlightId,
}: DocumentBrowserProps) {
  const [tocOpen, setTocOpen] = useState(true);
  const [loadedSections, setLoadedSections] = useState<Record<string, Section>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const loadSection = useCallback(async (id: string) => {
    if (loadedSections[id]) {
      setActiveSectionId(id);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
      return;
    }

    setLoadingId(id);
    setErrorId(null);
    try {
      const res = await fetch(`/api/section?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const section: Section = await res.json();
        setLoadedSections((prev) => ({ ...prev, [id]: section }));
        setActiveSectionId(id);
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      } else {
        setErrorId(id);
      }
    } catch {
      setErrorId(id);
    } finally {
      setLoadingId(null);
    }
  }, [loadedSections]);

  // Find the top-level section ID for a given item
  const findTopLevelId = useCallback((id: string): string => {
    function findInChildren(item: TocItem, targetId: string): boolean {
      if (item.id === targetId) return true;
      return item.children.some((c) => findInChildren(c, targetId));
    }
    for (const section of toc) {
      if (section.id === id) return id;
      if (findInChildren(section, id)) return section.id;
    }
    return id;
  }, [toc]);

  const handleSelect = useCallback((id: string) => {
    const topId = findTopLevelId(id);
    loadSection(topId).then(() => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    });
  }, [findTopLevelId, loadSection]);

  // Auto-load section when highlightId changes (e.g. from chat article links)
  useEffect(() => {
    if (highlightId) {
      handleSelect(highlightId);
    }
  }, [highlightId, handleSelect]);

  return (
    <div className={styles.browser} role="region" aria-label="Documentbrowser">
      <div className={styles.tocHeader}>
        <button
          className={styles.tocHeaderToggle}
          onClick={() => setTocOpen(!tocOpen)}
          aria-expanded={tocOpen}
          aria-controls="toc-nav"
        >
          <span aria-hidden="true">{tocOpen ? "\u25BE" : "\u25B8"}</span> Inhoudsopgave
        </button>
        <a
          href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.pdfLink}
          aria-label="Origineel document openen als PDF"
        >
          PDF
        </a>
      </div>
      {tocOpen && (
        <nav id="toc-nav" className={styles.toc} aria-label="Inhoudsopgave">
          <ul className={styles.tocList} role="tree">
            {toc.map((item) => (
              <TOCItem
                key={item.id}
                item={item}
                onSelect={handleSelect}
                highlightId={highlightId}
              />
            ))}
          </ul>
        </nav>
      )}
      <div className={styles.content}>
        {!activeSectionId && !loadingId && (
          <div className={styles.placeholder}>
            <span className={styles.placeholderIcon} aria-hidden="true">{"\u{1F4D6}"}</span>
            <span className={styles.placeholderText}>
              Klik op een onderdeel in de inhoudsopgave om de tekst te lezen.
            </span>
          </div>
        )}
        {loadingId && (
          <div className={styles.placeholder} role="status" aria-label="Sectie wordt geladen">
            <div className={styles.spinner} aria-hidden="true" />
            <span className="sr-only">Laden...</span>
          </div>
        )}
        {errorId && !loadingId && (
          <div className={styles.placeholder} role="alert">
            <span className={styles.placeholderText}>
              Kan deze sectie niet laden.
            </span>
            <button
              className={styles.retryButton}
              onClick={() => loadSection(errorId)}
            >
              Opnieuw proberen
            </button>
          </div>
        )}
        {activeSectionId && loadedSections[activeSectionId] && (
          <SectionContent section={loadedSections[activeSectionId]} />
        )}
      </div>
    </div>
  );
}
