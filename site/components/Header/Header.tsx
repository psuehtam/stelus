"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS, NAV_LINKS, SITE, WHATSAPP_URL } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import "./Header.css";

export function Header() {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const startsScrolled = !isHome;
  const [scrolled, setScrolled] = useState(startsScrolled);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (startsScrolled) {
        setScrolled(true);
        return;
      }
      setScrolled(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [startsScrolled]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const setOpen = useCallback((isOpen: boolean) => {
    setMenuOpen(isOpen);
    document.body.classList.toggle("menu-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen, setOpen]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} id="nav">
        <div className="container nav-inner">
          <Link href="/" className="logo" aria-label="Stelus Bordados — voltar para o início">
            <img src={ASSETS.logoMarinho} alt={SITE.name} />
          </Link>
          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={isHome ? link.homeHref : link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <a href={WHATSAPP_URL} className="nav-cta" target="_blank" rel="noopener">
              <WhatsAppIcon />
              Falar agora
            </a>
            <button
              className={`menu-toggle${menuOpen ? " open" : ""}`}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              type="button"
              onClick={() => setOpen(!menuOpen)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`menu-backdrop${menuOpen ? " open" : ""}`}
        aria-hidden={!menuOpen}
        onClick={() => setOpen(false)}
      />
      <div
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        id="mobileMenu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="mobile-menu-top">
          <button
            className="mobile-menu-close"
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
        <nav className="mobile-menu-links" aria-label="Menu principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={isHome ? link.homeHref : link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a href={WHATSAPP_URL} className="mobile-wa" target="_blank" rel="noopener">
          Falar no WhatsApp →
        </a>
      </div>
    </>
  );
}
