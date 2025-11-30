"use client";

import { ThemeToggle } from "./theme";
import { useTheme } from "@/contexts/ThemeContext";
import Swal from "sweetalert2";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Footer() {
  const { theme } = useTheme();

  const handleCoffeeClick = () => {
    const isDark = theme === "dark";

    Swal.fire({
      title:
        '<i class="fas fa-coffee" style="color: #FF6B35;"></i> Buy Me a Coffee?',
      html: `
        <p>The best coffee you could buy is by supporting this project!</p>
        <p>Give it a <i class="fas fa-star" style="color: #FFD700;"></i> on GitHub:</p>
        <a href="https://github.com/siyabuilds/shukuma-web" target="_blank" rel="noopener noreferrer" style="color: #FF6B35; font-weight: bold;">
          github.com/siyabuilds/shukuma-web
        </a>
      `,
      icon: "info",
      confirmButtonText: "Will do!",
      confirmButtonColor: "#FF6B35",
      background: isDark ? "#1e1e1e" : "#f8f9fa",
      color: isDark ? "#eaeaea" : "#212529",
      customClass: {
        popup: isDark ? "swal2-dark" : "swal2-light",
      },
    });
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-neutral bg-background py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        {/* Left: Copyright & LinkedIn */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-foreground">
            © {new Date().getFullYear()} Shukuma
          </span>
          <a
            href="https://linkedin.com/in/siyabuilds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-primary transition-colors"
          >
            /in/siyabuilds
          </a>
        </div>

        {/* Right: Theme Toggle */}
        <div>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
