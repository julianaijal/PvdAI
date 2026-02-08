"use client";

import { useState, useRef, useEffect, useMemo, useCallback, Children } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import styles from "./Chat.module.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
  children: TocItem[];
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

function parseArticleRefs(
  text: string,
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>
) {
  const parts = text.split(/(Artikel\s+\d+(?:\.\d+)?(?:,?\s*lid\s+\d+)?)/gi);
  return parts.map((part, i) => {
    const numMatch = part.match(/^Artikel\s+(\d+(?:\.\d+)?)/i);
    if (numMatch) {
      const key = numMatch[1];
      const tocId = articleLookup?.get(key);
      if (tocId && onClick) {
        return (
          <button
            key={i}
            className={styles.articleRef}
            onClick={() => onClick(tocId)}
            aria-label={`Ga naar ${part} in documentbrowser`}
          >
            {part}
          </button>
        );
      }
    }
    return <span key={i}>{part}</span>;
  });
}

function processChildren(
  children: React.ReactNode,
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>
): React.ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      return parseArticleRefs(child, onClick, articleLookup);
    }
    return child;
  });
}

function useMarkdownComponents(
  onClick?: (id: string) => void,
  articleLookup?: Map<string, string>
): Components {
  return useMemo(() => ({
    p: ({ children }) => (
      <p>{processChildren(children, onClick, articleLookup)}</p>
    ),
    li: ({ children }) => (
      <li>{processChildren(children, onClick, articleLookup)}</li>
    ),
    strong: ({ children }) => (
      <strong>{processChildren(children, onClick, articleLookup)}</strong>
    ),
    em: ({ children }) => (
      <em>{processChildren(children, onClick, articleLookup)}</em>
    ),
    a: ({ href, children }) => (
      <a href={href} className={styles.markdownLink} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className={styles.markdownList}>{children}</ul>,
    ol: ({ children }) => <ol className={styles.markdownList}>{children}</ol>,
    code: ({ children }) => <code className={styles.markdownCode}>{children}</code>,
  }), [onClick, articleLookup]);
}

export default function Chat({ onArticleClick, toc }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starterQuestions, setStarterQuestions] = useState<string[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const articleLookup = useMemo<Map<string, string>>(() => buildArticleLookup(toc || []), [toc]);
  const markdownComponents = useMarkdownComponents(onArticleClick, articleLookup);

  useEffect(() => {
    setStarterQuestions(pickRandomQuestions(4));
  }, []);

  useEffect(() => {
    if (isNearBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
  }, []);

  async function handleSubmit(question?: string) {
    const text = question || input.trim();
    if (!text || loading) return;

    setInput("");
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;

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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Kan geen verbinding maken. Controleer je internet en probeer het opnieuw.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.chat} role="region" aria-label="Chat met AI-assistent">
      <div className={styles.messages} aria-live="polite" aria-relevant="additions" ref={messagesContainerRef} onScroll={handleScroll}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <div className={styles.welcomeIcon} aria-hidden="true">?</div>
            <h2 className={styles.welcomeTitle}>Stel een vraag</h2>
            <p className={styles.welcomeText}>
              Vraag iets over de statuten en reglementen van de PvdA.
              {" "}
              <a
                href="https://www.pvda.nl/wp-content/uploads/2017/06/Statuten-en-reglementen-PvdA-2023.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pdfLink}
              >
                Bekijk het originele document (PDF)
              </a>
            </p>
            <div className={styles.starters} role="group" aria-label="Voorbeeldvragen">
              {starterQuestions.map((q) => (
                <button
                  key={q}
                  className={styles.starterButton}
                  onClick={() => handleSubmit(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage} ${msg.isError ? styles.errorMessage : ""}`}
            role={msg.role === "user" ? "log" : "status"}
            aria-label={msg.role === "user" ? "Jouw vraag" : "Antwoord"}
          >
            <div className={styles.messageContent}>
              {msg.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && !(messages.length > 0 && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].content.length > 0) && (
          <div
            className={`${styles.message} ${styles.assistantMessage}`}
            role="status"
            aria-label="Antwoord wordt geladen"
          >
            <div className={styles.messageContent}>
              <span className={styles.loading}>Aan het nadenken...</span>
            </div>
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
          <input
            id="chat-input"
            className={`${styles.input} ${loading ? styles.inputLoading : ""}`}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stel een vraag over de statuten..."
            disabled={loading}
            autoComplete="off"
          />
          <button
            className={styles.sendButton}
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Verstuur vraag"
          >
            Vraag
          </button>
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
