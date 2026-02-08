"use client";

import { useState, useEffect } from "react";
import styles from "./ThemeToggle.module.scss";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setDark(false);
    }
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={dark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
    >
      <span className={styles.icon} aria-hidden="true">{dark ? "\u2600" : "\u263E"}</span>
    </button>
  );
}
