import React, { useState, useEffect } from "react";
import { navigation, isActive } from "@/lib/navigation";
import type { NavItem } from "@/lib/navigation";

interface NavigationProps {
  currentPath: string;
}

function Navigation({ currentPath }: NavigationProps) {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Initialize theme
  useEffect(() => {
    const getInitialTheme = () => {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme !== null) return savedTheme === "dark";
      return (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
      );
    };

    const initialIsDark = getInitialTheme();
    setIsDark(initialIsDark);
    applyTheme(initialIsDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("theme") === null) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  // Auto-hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const threshold = 10;

      if (Math.abs(currentScrollY - lastScrollY) < threshold) return;

      const shouldBeVisible =
        currentScrollY < lastScrollY || currentScrollY < 100;
      setIsVisible(shouldBeVisible);

      if (!shouldBeVisible && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  const applyTheme = (dark: boolean) => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const handleThemeToggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    applyTheme(newIsDark);
  };

  const checkIsActive = (path: string) => {
    return isActive(path, currentPath);
  };

  return (
    <nav className={`${isVisible ? "nav-visible" : "nav-hidden"}`}>
      <div className="logo">
        <img src="src/assets/images/slime-bunny.png" alt="Cookie's logo" />
        <a href="/#">CtrlAltCookie</a>
      </div>

      <ul className={`nav-links ${isMobileMenuOpen ? "nav-active" : ""}`}>
        {navigation.main.map((item: NavItem, index: number) => (
          <li
            key={item.path}
            style={{
              transitionDelay: isMobileMenuOpen ? `${index * 0.1}s` : "0s",
            }}
          >
            <a
              href={item.path}
              className={checkIsActive(item.path) ? "active" : ""}
              aria-label={item.ariaLabel}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          </li>
        ))}
        <li className="toggle-theme" onClick={handleThemeToggle}>
          <svg className="sun-icon" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75.75zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM21 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25A.75.75 0 0121 12zM5.47 5.47a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06L5.47 6.53a.75.75 0 010-1.06zM18.53 5.47a.75.75 0 010 1.06l-1.59 1.59a.75.75 0 01-1.06-1.06l1.59-1.59a.75.75 0 011.06 0zM5.47 18.53a.75.75 0 010-1.06l1.59-1.59a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM18.53 18.53a.75.75 0 01-1.06 0l-1.59-1.59a.75.75 0 011.06-1.06l1.59 1.59a.75.75 0 010 1.06z" />
          </svg>
          <svg className="moon-icon" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        </li>
      </ul>

      <div
        className={`burger ${isMobileMenuOpen ? "toggle" : ""}`}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <div className="line1"></div>
        <div className="line2"></div>
        <div className="line3"></div>
      </div>

      <style>{`
        @keyframes navLinkFade {
          from {
            opacity: 0;
            transform: translateX(3.125rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        nav {
          position: relative;
          max-width: 1920px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 100px;
          padding: 0 1.25rem;
          color: light-dark(var(--color-1), var(--color-2));
          transition: transform 0.3s ease;
        }

        nav.nav-hidden {
          transform: translateY(-100%);
        }

        nav.nav-visible {
          transform: translateY(0);
        }

        .logo {
          display: flex;
          align-items: center;
        }

        .logo img {
          margin-inline-end: 1rem;
          max-width: 72px;
          max-height: 72px;
          transition: 0.3s ease;
          cursor: pointer;
        }

        .logo img:hover {
          scale: 1.1;
        }

        .logo a {
          text-decoration: none;
          font-size: 2rem;
          font-weight: 700;
          transition: all 0.3s ease;
          background: -webkit-linear-gradient(
            0deg,
            rgb(131, 63, 187),
            rgb(219, 121, 213)
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          justify-content: end;
          align-items: center;
          gap: 25px;
        }

        .nav-links li {
          list-style: none;
        }

        .nav-links a {
          color: var(--foreground);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          padding: 0.875rem 0.625rem;
          transition: all 0.3s ease-out;
        }

        .nav-links a:hover,
        .nav-links a.active {
          color: var(--color-3);
          transform: rotateX(-25deg);
        }

        .nav-links li:nth-child(2) a:hover,
        .nav-links li:nth-child(2) a.active {
          transform: rotateX(15deg);
        }

        .nav-links li:nth-child(3) a:hover,
        .nav-links li:nth-child(3) a.active {
          transform: rotate(-15deg);
        }

        .nav-links li:nth-child(4) a:hover,
        .nav-links li:nth-child(4) a.active {
          transform: rotate(10deg);
        }

        .toggle-theme {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 8px;
          transition: all 0.3s ease;
        }

        .toggle-theme:hover {
          transform: scale(1.1);
        }

        .toggle-theme svg {
          width: 24px;
          height: 24px;
          fill: currentColor;
          transition: all 0.3s ease;
        }

        .sun-icon {
          display: block;
        }

        .moon-icon {
          display: none;
        }

        :global(.dark) .sun-icon {
          display: none;
        }

        :global(.dark) .moon-icon {
          display: block;
        }

        .burger {
          display: none;
          cursor: pointer;
        }

        .burger div {
          width: 30px;
          height: 4px;
          margin: 5px;
          background-color: var(--color-3, var(--foreground));
          transition: all 0.3s ease-out;
          border-radius: 10px;
        }

        .nav-active {
          transform: translateX(0%);
        }

        .nav-active li {
          opacity: 1;
          transform: translateX(0);
        }

        .toggle .line1 {
          transform: rotate(-45deg) translate(-0.3125rem, 0.375rem);
        }

        .toggle .line2 {
          opacity: 0;
        }

        .toggle .line3 {
          transform: rotate(45deg) translate(-0.3125rem, -0.375rem);
        }

        @media screen and (max-width: 550px) {
          .logo {
            width: 64px;
          }

          .logo a {
            font-size: 1.4rem;
          }
        }

        @media screen and (max-width: 880px) {
          nav {
            overflow-x: clip;
            z-index: 998;
          }

          .nav-links {
            position: absolute;
            display: flex;
            flex-direction: column;
            justify-content: center;
            right: 0;
            top: 100px;
            height: 100%;
            min-height: 300px;
            width: 33%;
            min-width: 300px;
            gap: 15%;
            background-color: var(--color-4, var(--card));
            transform: translateX(150%);
            transition: transform 0.5s ease-out;
            z-index: 999;
          }

          .nav-active {
            transform: translateX(0);
          }

          .nav-links li {
            opacity: 0;
            transform: translateX(100%);
            transition: transform 0.5s ease-out, opacity 0.5s ease-out;
          }

          .nav-active li {
            animation: navLinkFade 0.5s ease forwards;
          }

          .nav-links a {
            padding: 0.625rem;
            font-size: 1.2rem;
          }

          .nav-links a:hover,
          .nav-links a.active {
            color: wheat;
            transform: none;
          }

          .burger {
            display: block;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navigation;
