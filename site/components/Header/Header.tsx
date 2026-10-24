"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS, NAV_LINKS, SITE, WHATSAPP_URL } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { container } from "@/lib/styles";

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

  const logoHeight = scrolled
    ? "h-[52px] max-[1100px]:h-12 max-[900px]:h-[42px] max-[560px]:h-10"
    : "h-16 max-[1100px]:h-14 max-[900px]:h-12 max-[560px]:h-11";

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-[100] border-b border-line bg-canvas transition-[padding] duration-[400ms] ease-signature ${
          scrolled
            ? "py-2.5 max-[900px]:pt-[max(8px,env(safe-area-inset-top,0px))] max-[900px]:pb-2"
            : "py-3.5 max-[900px]:pt-[max(10px,env(safe-area-inset-top,0px))] max-[900px]:pb-2.5"
        }`}
        id="nav"
      >
        <div className={`${container} flex items-center justify-between gap-8 max-[1100px]:gap-6 max-[900px]:gap-3 flex-nowrap`}>
          <Link
            href="/"
            className={`inline-flex shrink-0 items-center transition-[opacity,height] duration-[400ms] ease-signature hover:opacity-75 ${logoHeight}`}
            aria-label="Stelus Bordados — voltar para o início"
          >
            <img
              src={ASSETS.logoMarinho}
              alt={SITE.name}
              className="h-full w-auto max-w-[min(260px,55vw)] select-none max-[900px]:max-w-[min(210px,calc(100vw-108px))]"
            />
          </Link>
          <ul className="flex list-none items-center gap-12 max-[1100px]:gap-6 max-[900px]:hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={isHome ? link.homeHref : link.href}
                  className="relative text-sm font-medium text-ink-soft transition-colors duration-200 hover:text-ink after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-ink after:transition-[width] after:duration-300 after:ease-signature hover:after:w-full max-[1100px]:text-[13px]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <a
              href={WHATSAPP_URL}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-[18px] py-[11px] text-[13px] font-medium text-canvas transition-[transform,background-color] duration-300 ease-signature hover:-translate-y-px hover:bg-ink max-[1100px]:px-3.5 max-[1100px]:py-2.5 max-[1100px]:text-xs max-[900px]:hidden [&_svg]:h-3.5 [&_svg]:w-3.5"
              target="_blank"
              rel="noopener"
            >
              <WhatsAppIcon />
              Falar agora
            </a>
            <button
              className="relative hidden h-11 w-11 shrink-0 rounded-lg max-[900px]:flex max-[900px]:items-center max-[900px]:justify-center max-[900px]:border-[1.5px] max-[900px]:border-line max-[900px]:bg-elevated"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              type="button"
              onClick={() => setOpen(!menuOpen)}
            >
              <span
                className={`absolute left-[11px] h-0.5 w-[22px] rounded bg-ink transition-[transform,top] duration-[360ms] ease-signature ${
                  menuOpen ? "top-[21px] rotate-45" : "top-4"
                }`}
              />
              <span
                className={`absolute left-[11px] h-0.5 w-[22px] rounded bg-ink transition-[transform,top] duration-[360ms] ease-signature ${
                  menuOpen ? "top-[21px] -rotate-45" : "top-[26px]"
                }`}
              />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[199] transition-[background-color] duration-[380ms] ease-signature ${
          menuOpen ? "pointer-events-auto bg-black/38" : "pointer-events-none bg-transparent"
        }`}
        aria-hidden={!menuOpen}
        onClick={() => setOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 z-[200] flex w-[min(340px,86vw)] flex-col overflow-y-auto border-l border-line bg-[rgba(247,246,244,0.9)] shadow-[-8px_0_40px_rgba(0,0,0,0.12)] backdrop-blur-[24px] backdrop-saturate-[1.4] transition-[transform,visibility] duration-[380ms] ease-signature max-[900px]:w-[min(360px,100vw)] max-[900px]:pb-[env(safe-area-inset-bottom,0px)] max-[560px]:w-full max-[560px]:border-l-0 ${
          menuOpen
            ? "visible translate-x-0 pointer-events-auto"
            : "invisible translate-x-full pointer-events-none"
        }`}
        id="mobileMenu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex shrink-0 items-center justify-end gap-4 border-b border-line px-6 py-[18px] max-[900px]:pt-[max(18px,env(safe-area-inset-top,0px))]">
          <button
            className="relative h-10 w-10 shrink-0 cursor-pointer rounded-full border-[1.5px] border-line bg-elevated transition-[border-color,background-color] duration-200 hover:border-ink hover:bg-canvas"
            type="button"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <span className="absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-ink" />
            <span className="absolute top-1/2 left-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded bg-ink" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col pt-3" aria-label="Menu principal">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={isHome ? link.homeHref : link.href}
              onClick={() => setOpen(false)}
              className="border-b border-line px-6 py-4 font-display text-[clamp(22px,5.5vw,30px)] font-bold tracking-[-0.02em] text-ink transition-[color,padding] duration-200 hover:pl-8 hover:text-brand max-[560px]:py-[18px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href={WHATSAPP_URL}
          className="mx-5 mt-6 mb-8 block rounded-full bg-brand px-6 py-4 text-center font-body text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-ink max-[560px]:mb-[max(32px,calc(24px+env(safe-area-inset-bottom,0px)))]"
          target="_blank"
          rel="noopener"
        >
          Falar no WhatsApp →
        </a>
      </div>
    </>
  );
}
