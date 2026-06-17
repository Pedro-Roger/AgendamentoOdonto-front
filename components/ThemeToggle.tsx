"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { setTheme } from "@/src/lib/theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    setTheme(next);
    setIsDark(next === "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="w-10 h-10 rounded-full bg-cream-100 border border-sage-100 flex items-center justify-center text-ink-500 hover:bg-cream-200 transition-colors shrink-0 dark:bg-ink-700/40 dark:border-ink-700 dark:text-cream-100 dark:hover:bg-ink-700/60"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
