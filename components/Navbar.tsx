"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/");
    setIsOpen(false);
  };

  const authenticatedLinks = [
    { name: "Home", href: "/" },
    { name: "Exercises", href: "/exercises" },
    { name: "Daily", href: "/daily" },
    { name: "Progress", href: "/progress" },
  ];

  const unauthenticatedLinks = [
    { name: "Home", href: "/" },
    { name: "Login", href: "/login" },
    { name: "Register", href: "/register" },
  ];

  const navLinks = isLoggedIn ? authenticatedLinks : unauthenticatedLinks;

  return (
    <nav className="bg-background shadow-lg sticky top-0 z-50 border-b border-neutral">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-primary">
              Shukuma
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            )}
          </div>

          {/* Hamburger Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-background border-t border-neutral"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              exit={{ y: -20 }}
              transition={{ duration: 0.3 }}
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3"
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-foreground hover:text-primary hover:bg-neutral px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: navLinks.length * 0.05 }}
                >
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-foreground hover:text-primary hover:bg-neutral px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
