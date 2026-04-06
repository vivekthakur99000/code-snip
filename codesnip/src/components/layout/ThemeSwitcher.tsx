"use client";

import { useEffect, useState } from "react";

type ThemeVariant = "dark" | "midnight" | "contrast";

const STORAGE_KEY = "codesnip-theme-variant";
const THEMES: ThemeVariant[] = ["dark", "midnight", "contrast"];

function applyTheme(theme: ThemeVariant) {
  document.documentElement.dataset.theme = theme;
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeVariant>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeVariant | null;
    const initialTheme = saved && THEMES.includes(saved) ? saved : "dark";

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const setAndPersistTheme = (nextTheme: ThemeVariant) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  return (
    <div className="hidden items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 p-1 md:flex">
      {THEMES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setAndPersistTheme(item)}
          className={[
            "rounded-full px-2.5 py-1 text-[11px] uppercase tracking-wide transition",
            theme === item
              ? "bg-green-900/50 text-green-200"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
          ].join(" ")}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
