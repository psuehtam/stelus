"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";

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
      className={`fixed right-6 bottom-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-[0_6px_24px_rgba(0,0,0,0.18)] transition-[opacity,transform,background-color] duration-[400ms] ease-signature max-[900px]:right-[max(16px,env(safe-area-inset-right,0px))] max-[900px]:bottom-[max(16px,env(safe-area-inset-bottom,0px))] max-[900px]:h-[52px] max-[900px]:w-[52px] hover:-translate-y-[3px] hover:scale-105 hover:bg-ink ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-5 scale-90 opacity-0"
      }`}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
    >
      <img src={ASSETS.whatsappIcon} alt="" className="h-8 w-8" />
    </a>
  );
}
