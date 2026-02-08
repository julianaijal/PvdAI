"use client";

import { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.scss";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={dark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
    >
      <span className={styles.icon}>{dark ? "\u2600" : "\u263E"}</span>
    </button>
  );
}
