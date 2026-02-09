"use client";

import { useState, useCallback, useEffect, memo, useMemo, useRef } from "react";
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

interface SearchResult {
  sectionId: string;
  sectionTitle: string;
  snippet: string;
  matchIndex: number;
}

function searchStructure(
  sections: Section[],
  query: string,
  results: SearchResult[] = [],
  maxResults: number = 20
): SearchResult[] {
  const lower = query.toLowerCase();
  for (const section of sections) {
    if (results.length >= maxResults) break;

    const titleIdx = section.title.toLowerCase().indexOf(lower);
    if (titleIdx !== -1) {
      results.push({
        sectionId: section.id,
        sectionTitle: section.title,
        snippet: section.title,
        matchIndex: titleIdx,
      });
    }

    if (section.content && results.length < maxResults) {
      const contentLower = section.content.toLowerCase();
      const contentIdx = contentLower.indexOf(lower);
      if (contentIdx !== -1) {
        const start = Math.max(0, contentIdx - 50);
        const end = Math.min(section.content.length, contentIdx + query.length + 50);
        const prefix = start > 0 ? "..." : "";
        const suffix = end < section.content.length ? "..." : "";
        results.push({
          sectionId: section.id,
          sectionTitle: section.title,
          snippet: prefix + section.content.slice(start, end) + suffix,
          matchIndex: contentIdx - start + prefix.length,
        });
      }
    }

    if (results.length < maxResults) {
      searchStructure(section.children, query, results, maxResults);
    }
  }
  return results;
}

function tocMatchesQuery(item: TocItem, matchingIds: Set<string>): boolean {
  if (matchingIds.has(item.id)) return true;
  return item.children.some((child) => tocMatchesQuery(child, matchingIds));
}

interface DocumentBrowserProps {
  toc: TocItem[];
  highlightId?: string | null;
}

const TOCItem = memo(function TOCItem({
  item,
  onSelect,
  highlightId,
  matchingIds,
}: {
  item: TocItem;
  onSelect: (id: string) => void;
  highlightId?: string | null;
  matchingIds?: Set<string> | null;
}) {
  const [expanded, setExpanded] = useState(item.level === 0);
  const hasChildren = item.children.length > 0;

  const isSearching = !!matchingIds;
  const effectiveExpanded = isSearching ? true : expanded;

  const filteredChildren = matchingIds
    ? item.children.filter((child) => tocMatchesQuery(child, matchingIds))
    : item.children;

  return (
    <li className={styles.tocItem} role="treeitem" aria-selected={highlightId === item.id} aria-expanded={hasChildren ? effectiveExpanded : undefined}>
      <div
        className={`${styles.tocLabel} ${highlightId === item.id ? styles.tocActive : ""}`}
        style={{ paddingLeft: `${item.level * 16 + 8}px` }}
      >
        {hasChildren && (
          <button
            className={styles.tocToggle}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={effectiveExpanded}
            aria-label={`${item.title} ${effectiveExpanded ? "inklappen" : "uitklappen"}`}
          >
            <span aria-hidden="true">{effectiveExpanded ? "\u25BE" : "\u25B8"}</span>
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
      {hasChildren && effectiveExpanded && (
        <ul className={styles.tocChildren} role="group">
          {filteredChildren.map((child) => (
            <TOCItem
              key={child.id}
              item={child}
              onSelect={onSelect}
              highlightId={highlightId}
              matchingIds={matchingIds}
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedSections, setLoadedSections] = useState<Record<string, Section>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [structureData, setStructureData] = useState<Section[] | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const structureLoadedRef = useRef(false);

  // Lazy-load structure.json on first search interaction
  const loadStructure = useCallback(async () => {
    if (structureLoadedRef.current) return;
    structureLoadedRef.current = true;
    try {
      const res = await fetch("/api/structure");
      if (res.ok) {
        const data = await res.json();
        setStructureData(data);
      }
    } catch {
      structureLoadedRef.current = false;
    }
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Compute search results
  const searchResults = useMemo(() => {
    if (!debouncedQuery || !structureData) return [];
    return searchStructure(structureData, debouncedQuery);
  }, [debouncedQuery, structureData]);

  // Set of all section IDs that match (for TOC filtering)
  const matchingTocIds = useMemo(() => {
    if (!debouncedQuery || !structureData) return null;
    const ids = new Set<string>();
    for (const r of searchResults) {
      ids.add(r.sectionId);
    }
    function walkToc(items: TocItem[]) {
      for (const item of items) {
        if (item.title.toLowerCase().includes(debouncedQuery.toLowerCase())) {
          ids.add(item.id);
        }
        walkToc(item.children);
      }
    }
    walkToc(toc);
    return ids;
  }, [debouncedQuery, structureData, searchResults, toc]);

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
      <div className={styles.searchBar}>
        <input
          className={styles.searchInput}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={loadStructure}
          placeholder="Zoek in het document..."
          aria-label="Zoek in het document"
        />
        {searchQuery && (
          <button
            className={styles.searchClear}
            onClick={() => setSearchQuery("")}
            aria-label="Zoekopdracht wissen"
          >
            &times;
          </button>
        )}
      </div>
      {tocOpen && (
        <nav id="toc-nav" className={styles.toc} aria-label="Inhoudsopgave">
          <ul className={styles.tocList} role="tree">
            {toc
              .filter((item) => !matchingTocIds || tocMatchesQuery(item, matchingTocIds))
              .map((item) => (
                <TOCItem
                  key={item.id}
                  item={item}
                  onSelect={handleSelect}
                  highlightId={highlightId}
                  matchingIds={matchingTocIds}
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
