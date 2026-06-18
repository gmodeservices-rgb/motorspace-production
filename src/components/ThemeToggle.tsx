import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const STORAGE_KEY = "motorspace-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-10 items-center gap-1 rounded-full border border-white/15 bg-white/8 p-1 text-white shadow-[0_0_18px_oklch(0.63_0.21_252_/_0.18)] transition hover:border-[var(--brand-accent)] hover:bg-white/12 ${className}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          !isDark ? "bg-white text-[var(--navy-deep)]" : "text-white/65"
        }`}
      >
        <Sun className="h-4 w-4" />
      </span>
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
          isDark ? "bg-[var(--brand-accent)] text-white" : "text-white/65"
        }`}
      >
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}
