"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";
import "./WhatsAppSticky.css";

export function WhatsAppSticky() {
  const pathname = usePathname() ?? "/";
  const hidden = pathname.startsWith("/contato/sucesso");
  const alwaysVisible = pathname === "/contato";
  const [visible, setVisible] = useState(alwaysVisible);

  useEffect(() => {
    if (hidden) return;

    const onScroll = () => {
      if (alwaysVisible) {
        setVisible(true);
        return;
      }
      setVisible(window.scrollY > 500);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysVisible, hidden]);

  if (hidden) return null;

  return (
    <a
      href={WHATSAPP_URL}
      className={`wa-sticky${visible ? " show" : ""}`}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
    >
      <img src={ASSETS.whatsappIcon} alt="" />
    </a>
  );
}
