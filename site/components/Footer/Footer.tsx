"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS, NAV_LINKS, SITE, WHATSAPP_URL } from "@/lib/site";
import { container } from "@/lib/styles";

export function Footer() {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";

  return (
    <footer className="relative overflow-hidden border-t border-white/10 pt-12 pb-6 text-[rgba(250,250,247,0.6)]">
      <div className={container}>
        <div className="mb-8 border-b border-white/10 pb-6">
          <img
            src={ASSETS.logoBranca}
            alt={SITE.name}
            className="h-14 w-auto opacity-90 max-[560px]:h-[52px]"
          />
        </div>
        <div className="mb-6 grid grid-cols-3 gap-[clamp(32px,4vw,64px)] border-b border-white/10 pb-12 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-8">
          <div>
            <span className="mb-6 block font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-[rgba(250,250,247,0.4)]">
              Navegação
            </span>
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={isHome ? link.homeHref : link.href}
                  className="text-[clamp(13px,0.9vw,15px)] text-[rgba(250,250,247,0.65)] transition-colors duration-[250ms] hover:text-linen"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <span className="mb-6 block font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-[rgba(250,250,247,0.4)]">
              Contato
            </span>
            <div className="flex flex-col gap-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                className="border-b border-transparent text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)] transition-colors duration-[250ms] hover:border-[rgba(250,250,247,0.3)] hover:text-linen"
              >
                {SITE.phoneDisplay}
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="border-b border-transparent text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)] transition-colors duration-[250ms] hover:border-[rgba(250,250,247,0.3)] hover:text-linen"
              >
                {SITE.email}
              </a>
              <span className="text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)]">
                {SITE.hoursShort}
              </span>
            </div>
          </div>
          <div>
            <span className="mb-6 block font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-[rgba(250,250,247,0.4)]">
              Endereço
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)]">
                {SITE.address.street}
              </span>
              <span className="text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)]">
                {SITE.address.neighborhood}, {SITE.address.city}
              </span>
              <span className="text-[clamp(13px,0.9vw,15px)] leading-[1.5] text-[rgba(250,250,247,0.65)]">
                CEP {SITE.address.cep}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-white/[0.08] pt-8 pb-6 font-display text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.01em] text-linen opacity-[0.88] max-[560px]:text-[clamp(22px,7vw,28px)]">
          Pontos, Fios &amp; Amor.
        </div>
        <div className="flex flex-wrap items-center justify-between gap-6 font-body text-[clamp(11px,0.7vw,12px)] tracking-[0.05em] max-[560px]:flex-col max-[560px]:items-start">
          <span>© 2025 {SITE.name}. Todos os direitos reservados.</span>
          <span className="inline-flex items-center gap-4">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="text-[1.1rem] text-[rgba(250,250,247,0.45)] transition-colors duration-[250ms] hover:text-white/90"
            >
              <i className="bi bi-instagram"></i>
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener"
              aria-label="Facebook"
              className="text-[1.1rem] text-[rgba(250,250,247,0.45)] transition-colors duration-[250ms] hover:text-white/90"
            >
              <i className="bi bi-facebook"></i>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
