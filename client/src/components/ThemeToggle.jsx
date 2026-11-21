import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "nexpress-theme";

function initialTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(initialTheme);
  const timer = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode: the choice just won't persist.
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#020617" : "#f8fafc");
  }, [isDark, theme]);

  const toggle = () => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      root.classList.add("theme-transition");
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(
        () => root.classList.remove("theme-transition"),
        320,
      );
    }
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <Sun
          aria-hidden="true"
          className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <Moon
          aria-hidden="true"
          className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </span>
    </button>
  );
}
