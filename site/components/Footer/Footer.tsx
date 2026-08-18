"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ASSETS, NAV_LINKS, SITE, WHATSAPP_URL } from "@/lib/site";
import "./Footer.css";

export function Footer() {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <img src={ASSETS.logoBranca} alt={SITE.name} className="footer-logo" />
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <span className="footer-col-label">Navegação</span>
            <nav className="footer-nav">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={isHome ? link.homeHref : link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="footer-col">
            <span className="footer-col-label">Contato</span>
            <div className="footer-contact">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                {SITE.phoneDisplay}
              </a>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              <span>{SITE.hoursShort}</span>
            </div>
          </div>
          <div className="footer-col">
            <span className="footer-col-label">Endereço</span>
            <div className="footer-contact">
              <span>{SITE.address.street}</span>
              <span>
                {SITE.address.neighborhood}, {SITE.address.city}
              </span>
              <span>CEP {SITE.address.cep}</span>
            </div>
          </div>
        </div>
        <div className="footer-tagline">Pontos, Fios &amp; Amor.</div>
        <div className="footer-inner">
          <span>© 2025 {SITE.name}. Todos os direitos reservados.</span>
          <span className="footer-social">
            <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href={SITE.facebook} target="_blank" rel="noopener" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
