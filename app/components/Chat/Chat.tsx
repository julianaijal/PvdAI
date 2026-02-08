"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.scss";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  onArticleClick?: (articleId: string) => void;
}

const STARTER_QUESTIONS = [
  "Hoe word ik lid van de PvdA?",
  "Wat doet het congres?",
  "Hoe werkt royement?",
  "Wat zijn de rechten van leden?",
];

function parseArticleRefs(text: string, onClick?: (id: string) => void) {
  const parts = text.split(/(Artikel\s+\d+[\w.]*(?:,?\s*lid\s+\d+)?)/gi);
  return parts.map((part, i) => {
    if (/^Artikel\s+\d+/i.test(part)) {
      const id = part
        .toLowerCase()
        .replace(/[.,]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
      return (
        <button
          key={i}
          className={styles.articleRef}
          onClick={() => onClick?.(id)}
        >
          {part}
        </button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Chat({ onArticleClick }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Er is iets misgegaan. Probeer het opnieuw.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Er is een fout opgetreden. Probeer het later opnieuw.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.chat}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <h3 className={styles.welcomeTitle}>Stel een vraag</h3>
            <p className={styles.welcomeText}>
              Vraag iets over de statuten en reglementen van de PvdA.
            </p>
            <div className={styles.starters}>
              {STARTER_QUESTIONS.map((q) => (
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
            className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.assistantMessage}`}
          >
            <div className={styles.messageContent}>
              {msg.role === "assistant"
                ? parseArticleRefs(msg.content, onArticleClick)
                : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              <span className={styles.loading}>Aan het nadenken...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className={styles.inputArea}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          className={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Stel een vraag over de statuten..."
          disabled={loading}
        />
        <button className={styles.sendButton} type="submit" disabled={loading || !input.trim()}>
          Vraag
        </button>
      </form>
    </div>
  );
}
