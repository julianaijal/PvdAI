"use client";

import { useState, useRef, useEffect, useMemo, useCallback, memo, Children } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import styles from "./Chat.module.scss";
import type { TocItem } from "@/lib/types";
import { hasArticleRefs } from "@/lib/chat-utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface ChatProps {
  onArticleClick?: (articleId: string) => void;
  toc?: TocItem[];
}

const ALL_STARTER_QUESTIONS = [
  // Lidmaatschap
  "Hoe word ik lid van de PvdA?",
  "Wat kost het lidmaatschap?",
  "Kan ik als jeugdlid ook stemmen?",
  "Wanneer verlies je je lidmaatschap?",
  "Wat zijn de rechten en plichten van leden?",
  "Hoe werkt royement bij de PvdA?",
  "Vanaf welke leeftijd kun je lid worden?",
  // Democratie & invloed
  "Hoe kan ik meebeslissen in de partij?",
  "Wat doet het congres?",
  "Wat is de Politieke Ledenraad?",
  "Wat is de Verenigingsraad?",
  "Hoe werkt stemmen binnen de partij?",
  "Wat is een ledenraadpleging?",
  "Hoe kan ik een motie indienen?",
  // Structuur & organisatie
  "Wat is het verschil tussen statuten en reglementen?",
  "Welke organen heeft de PvdA?",
  "Wat doet het partijbestuur?",
  "Wat is een afdeling?",
  "Wat is een gewest?",
  "Wat doet het presidium?",
  "Wat is de rol van de politiek leider?",
  // Verkiezingen & kandidaten
  "Hoe wordt een kandidatenlijst opgesteld?",
  "Hoe wordt de lijsttrekker gekozen?",
  "Hoe kan ik me verkiesbaar stellen?",
  "Hoe werkt de kandidaatstelling voor de Tweede Kamer?",
  "Hoe worden wethouders gekozen?",
  "Wat is een lijstverbinding?",
  // Geld & integriteit
  "Hoe wordt de PvdA gefinancierd?",
  "Wat is de erecode van de PvdA?",
  "Wat doet de Commissie Integriteit?",
  "Hoe gaat de PvdA om met belangenverstrengeling?",
  "Wat zijn de regels rond giften?",
  // Beroep & toezicht
  "Wat doet de beroepscommissie?",
  "Hoe kan ik in beroep gaan binnen de partij?",
  "Hoe werkt bemiddeling en toezicht?",
  // Samenwerking
  "Hoe werkt de PvdA samen in de EU?",
  "Wat zijn geestverwante organisaties?",
  // Praktisch
  "Wat is het doel van de PvdA?",
  "Waar is de PvdA gevestigd?",
  "Hoe worden de statuten gewijzigd?",
];

function pickRandomQuestions(count: number): string[] {
  const shuffled = [...ALL_STARTER_QUESTIONS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function buildArticleLookup(items: TocItem[]): Map<string, string> {
  const map = new Map<string, string>();
  function walk(list: TocItem[]) {
    for (const item of list) {
      const match = item.id.match(/artikel-(\d+)/);
      if (match) {
        const num = match[1];
        // Store as plain number key (e.g. "4" for statuten artikel-4)
        // and as dot-notation key (e.g. "1.1" for reglementen artikel-11)
        if (!map.has(num)) {
          map.set(num, item.id);
        }
        // For reglementen: artikel-51 → key "5.1", artikel-101 → key "10.1"
        if (item.id.startsWith("reglementen") && num.length >= 2) {
          const dotKey = num.slice(0, -1) + "." + num.slice(-1);
          if (!map.has(dotKey)) {
            map.set(dotKey, item.id);
          }
          // Also handle two-digit sub-articles: artikel-110 → "1.10"
          if (num.length >= 3) {
            const dotKey2 = num.slice(0, -2) + "." + num.slice(-2);
            if (!map.has(dotKey2)) {
              map.set(dotKey2, item.id);
            }
          }
        }
      }
      walk(item.children);
    }
  }
  walk(items);
  return map;
}

function makeArticleButton(
  text: string,
  key: string,
  index: number | string,
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>,
  onDismissHint?: () => void
): React.ReactElement {
  const tocId = articleLookup?.get(key);
  if (tocId && onClick) {
    return (
      <button
        key={index}
        className={styles.articleRef}
        onClick={() => {
          onClick(tocId);
          onDismissHint?.();
        }}
        aria-label={`Ga naar Artikel ${key} in documentbrowser`}
      >
        {text}
      </button>
    );
  }
  return <span key={index}>{text}</span>;
}

function parseArticleRefs(
  text: string,
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>,
  onDismissHint?: () => void
) {
  // Match both singular "Artikel X" and plural "Artikelen X, Y, Z"
  const parts = text.split(/(Artikelen\s+\d+(?:\.\d+)?(?:(?:,\s*(?:en\s+)?|\s+en\s+)\d+(?:\.\d+)?)*|Artikel\s+\d+(?:\.\d+)?(?:,?\s*lid\s+\d+)?)/gi);
  return parts.flatMap((part, i): React.ReactElement[] => {
    // Handle plural "Artikelen 1.12, 5.7, en 6.7"
    const pluralMatch = part.match(/^Artikelen\s+(.+)/i);
    if (pluralMatch) {
      const numberStr = pluralMatch[1];
      const numbers = numberStr.split(/(?:,\s*(?:en\s+)?|\s+en\s+)/);
      const result: React.ReactElement[] = [<span key={`${i}-prefix`}>Artikelen </span>];
      numbers.forEach((num, j) => {
        const trimmed = num.trim();
        if (j > 0) {
          const isLast = j === numbers.length - 1;
          result.push(<span key={`${i}-sep-${j}`}>{isLast ? " en " : ", "}</span>);
        }
        result.push(makeArticleButton(trimmed, trimmed, `${i}-${j}`, onClick, articleLookup, onDismissHint));
      });
      return result;
    }
    // Handle singular "Artikel X"
    const numMatch = part.match(/^Artikel\s+(\d+(?:\.\d+)?)/i);
    if (numMatch) {
      return [makeArticleButton(part, numMatch[1], i, onClick, articleLookup, onDismissHint)];
    }
    return [<span key={i}>{part}</span>];
  });
}

function processChildren(
  children: React.ReactNode,
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>,
  onDismissHint?: () => void
): React.ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return parseArticleRefs(child, onClick, articleLookup, onDismissHint);
    }
    return child;
  });
}

function useMarkdownComponents(
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>,
  onDismissHint?: () => void
): Components {
  return useMemo(() => ({
    p: ({ children }) => {
      const text = typeof children === "string" ? children :
        Array.isArray(children) ? children.filter(c => typeof c === "string").join("") : "";
      if (/^Bron(?:nen)?:/i.test(text.trim())) {
        return (
          <div className={styles.sourceChips}>
            {processChildren(children, onClick, articleLookup, onDismissHint)}
          </div>
        );
      }
      return <p>{processChildren(children, onClick, articleLookup, onDismissHint)}</p>;
    },
    li: ({ children }) => (
      <li>{processChildren(children, onClick, articleLookup, onDismissHint)}</li>
    ),
    strong: ({ children }) => (
      <strong>{processChildren(children, onClick, articleLookup, onDismissHint)}</strong>
    ),
    em: ({ children }) => (
      <em>{processChildren(children, onClick, articleLookup, onDismissHint)}</em>
    ),
    a: ({ href, children }) => (
      <a href={href} className={styles.markdownLink} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className={styles.markdownList}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.markdownList}>{children}</ol>,
    code: ({ children }) => <code className={styles.markdownCode}>{children}</code>,
  }), [onClick, articleLookup, onDismissHint]);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      className={`${styles.actionButton} ${copied ? styles.actionButtonSuccess : ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Gekopieerd" : "Kopieer antwoord"}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span className={styles.tooltip} role="status">{copied ? "Gekopieerd!" : "Kopieer"}</span>
    </button>
  );
}

function ShareButton({ question }: { question: string }) {
  const [shared, setShared] = useState(false);

  const handleShare = useCallback(() => {
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("q", question);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    });
  }, [question]);

  return (
    <button
      className={`${styles.actionButton} ${shared ? styles.actionButtonSuccess : ""}`}
      onClick={handleShare}
      aria-label={shared ? "Link gekopieerd" : "Deel dit antwoord"}
    >
      {shared ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
      <span className={styles.tooltip} role="status">{shared ? "Link gekopieerd!" : "Deel"}</span>
    </button>
  );
}

const ChatMessage = memo(function ChatMessage({
  msg,
  index,
  messages,
  markdownComponents,
  onRetry,
}: {
  msg: Message;
  index: number;
  messages: Message[];
  markdownComponents: Components;
  onRetry: (index: number) => void;
}) {
  return (
    <article
      className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage} ${msg.isError ? styles.errorMessage : ""}`}
      aria-label={msg.role === "user" ? "Jouw vraag" : "Antwoord"}
    >
      {msg.role === "assistant" && (
        <div className={styles.aiBadge} aria-hidden="true">
          <span>AI</span>
        </div>
      )}
      <div className={styles.messageContent}>
        {msg.role === "assistant" ? (
          <>
            {msg.isError && <span className={styles.errorPrefix} aria-hidden="true">! </span>}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {msg.content}
            </ReactMarkdown>
            {msg.content && (
              <div className={styles.messageActions}>
                {!msg.isError && <CopyButton text={msg.content} />}
                {!msg.isError && index > 0 && messages[index - 1]?.role === "user" && (
                  <ShareButton question={messages[index - 1].content} />
                )}
                {index > 0 && messages[index - 1]?.role === "user" && (
                  <button
                    className={styles.actionButton}
                    onClick={() => onRetry(index)}
                    aria-label="Opnieuw proberen"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span className={styles.tooltip}>Opnieuw</span>
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          msg.content
        )}
      </div>
    </article>
  );
});

export default function Chat({ onArticleClick, toc }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [starterQuestions, setStarterQuestions] = useState<string[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const [showArticleHint, setShowArticleHint] = useState(false);
  const [articleHintDismissed, setArticleHintDismissed] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("pvdai_article_hint_dismissed") === "1"
      : false
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const articleLookup = useMemo<Map<string, string>>(() => buildArticleLookup(toc || []), [toc]);

  const handleDismissArticleHint = useCallback(() => {
    setShowArticleHint(false);
    setArticleHintDismissed(true);
    localStorage.setItem("pvdai_article_hint_dismissed", "1");
  }, []);

  const markdownComponents = useMarkdownComponents(onArticleClick, articleLookup, handleDismissArticleHint);

  const handleRetry = useCallback((index: number) => {
    const question = messages[index - 1].content;
    setMessages((prev) => prev.slice(0, index - 1));
    handleSubmit(question);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    setStarterQuestions(pickRandomQuestions(4));
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (articleHintDismissed) return;
    const hasAny = messages.some(
      (m) => m.role === "assistant" && !m.isError && hasArticleRefs(m.content)
    );
    if (hasAny) setShowArticleHint(true);
  }, [messages, articleHintDismissed]);

  // Pre-fill question from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) {
      window.history.replaceState({}, "", window.location.pathname);
      setInput(q);
      textareaRef.current?.focus();
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  function handleStop() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  }

  async function handleSubmit(question?: string) {
    const text = question || input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const recentHistory = messages.slice(-6).map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: recentHistory.length > 0 ? recentHistory : undefined }),
        signal: controller.signal,
      });

      const remaining = res.headers.get("X-RateLimit-Remaining");
      if (remaining !== null) {
        setRemainingQuestions(parseInt(remaining, 10));
      }

      if (!res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Er is iets misgegaan. Probeer het opnieuw.",
            isError: true,
          },
        ]);
        return;
      }

      // Add empty assistant message to stream into
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let receivedDone = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            receivedDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: parsed.error,
                  isError: true,
                };
                return updated;
              });
              receivedDone = true;
              break;
            }
            if (parsed.delta) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + parsed.delta,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      // Warn if stream ended without [DONE] (connection dropped)
      if (!receivedDone) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.content) {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + "\n\n*Antwoord mogelijk onvolledig door een verbindingsprobleem.*",
            };
            return updated;
          }
          return prev;
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Remove empty assistant message if no content was streamed yet
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Kan geen verbinding maken. Controleer je internet en probeer het opnieuw.",
          isError: true,
        },
      ]);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  return (
    <div className={styles.chat} role="region" aria-label="Chat met AI-assistent">
      {messages.length > 0 && (
        <div className={styles.chatHeader}>
          <button
            className={styles.newChatButton}
            onClick={() => {
              handleStop();
              setMessages([]);
              setStarterQuestions(pickRandomQuestions(4));
              setRemainingQuestions(null);
            }}
            aria-label="Nieuw gesprek"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuw gesprek
          </button>
        </div>
      )}
      <div className={styles.messages} aria-live="polite" aria-relevant="additions" ref={messagesContainerRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                <path d="M12 2C9.5 2 7.5 3.5 7 5.5C5 5 3 6.5 3 9c0 2 1.5 3.5 3 4-0.5 1.5 0 3.5 1.5 4.5 1 0.7 2.2 0.8 3.2 0.5L12 21l1.3-3c1 0.3 2.2 0.2 3.2-0.5C18 16.5 18.5 14.5 18 13c1.5-0.5 3-2 3-4 0-2.5-2-4-4-3.5C16.5 3.5 14.5 2 12 2z"/>
              </svg>
            </div>
            <h2 className={styles.welcomeTitle}>Stel een vraag</h2>
            <ol className={styles.howItWorks} aria-label="Hoe het werkt">
              <li className={styles.howItWorksStep}>
                <span className={styles.howItWorksIcon} aria-hidden="true">💬</span>
                <span>Stel een vraag over de statuten of reglementen</span>
              </li>
              <li className={styles.howItWorksStep}>
                <span className={styles.howItWorksIcon} aria-hidden="true">📎</span>
                <span>Ik verwijs je naar de relevante artikelen</span>
              </li>
              <li className={styles.howItWorksStep}>
                <span className={styles.howItWorksIcon} aria-hidden="true">📄</span>
                <span>Klik een artikel om het te lezen in de documentbrowser</span>
              </li>
            </ol>
            <div className={styles.starters} role="group" aria-label="Voorbeeldvragen">
              {starterQuestions.map((q) => (
                <button
                  key={q}
                  className={styles.starterButton}
                  onClick={() => handleSubmit(q)}
                >
                  <span className={styles.starterIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                  {q}
                </button>
              ))}
            </div>
            <a
              href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.pdfLink}
            >
              Bekijk het originele document (PDF)
            </a>
            <p className={styles.disclaimer}>
              Onafhankelijke AI-tool · Niet gemaakt door of namens de PvdA · Geen juridisch advies
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            msg={msg}
            index={i}
            messages={messages}
            markdownComponents={markdownComponents}
            onRetry={handleRetry}
          />
        ))}
        {loading && !(messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content.length > 0) && (
          <div
            className={`${styles.message} ${styles.assistantMessage}`}
            role="status"
            aria-label="Antwoord wordt geladen"
          >
            <div className={styles.aiBadge} aria-hidden="true">
              <span>AI</span>
            </div>
            <div className={styles.messageContent}>
              <div className={styles.typingDots} aria-label="Aan het nadenken">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        {showArticleHint && (
          <div className={styles.articleHint} role="note" aria-live="polite">
            <span>💡 Klik op een artikel om het te lezen in de documentbrowser</span>
            <button
              className={styles.articleHintDismiss}
              onClick={handleDismissArticleHint}
              aria-label="Sluit tip"
            >
              ×
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputWrapper}>
        <form
          className={styles.inputArea}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Stel een vraag over de statuten
          </label>
          <div className={`${styles.inputContainer} ${inputFocused ? styles.inputContainerFocused : ""}`}>
            <div className={styles.inputGlow} aria-hidden="true" />
            <textarea
              ref={textareaRef}
              id="chat-input"
              className={`${styles.input} ${loading ? styles.inputLoading : ""}`}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Stel een vraag over de statuten..."
              disabled={loading}
              autoComplete="off"
              enterKeyHint="send"
              rows={1}
            />
            <span className={styles.inputHint} aria-hidden="true">
              <kbd>Enter</kbd> om te versturen
            </span>
          </div>
          {loading ? (
            <button
              className={styles.stopButton}
              type="button"
              onClick={handleStop}
              aria-label="Stop antwoord"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              className={styles.sendButton}
              type="submit"
              disabled={!input.trim()}
              aria-label="Verstuur vraag"
            >
              Vraag
            </button>
          )}
        </form>
        {remainingQuestions !== null && remainingQuestions <= 5 && (
          <div className={styles.rateLimit} aria-live="polite">
            Nog {remainingQuestions} {remainingQuestions === 1 ? "vraag" : "vragen"} vandaag
          </div>
        )}
      </div>
    </div>
  );
}
