"use client";

import { useTheme } from "@/contexts/ThemeContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent flash during hydration
  if (!mounted) {
    return (
      <button
        className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center"
        aria-label="Toggle theme"
        disabled
      >
        <i className="fas fa-circle-notch fa-spin text-foreground"></i>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl active:scale-95"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <i className="fas fa-moon text-white text-xl"></i>
      ) : (
        <i className="fas fa-sun text-white text-xl"></i>
      )}
    </button>
  );
}
