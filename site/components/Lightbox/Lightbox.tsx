"use client";

import { useEffect, useRef, useState } from "react";
import type { Service } from "@/lib/services";

interface LightboxProps {
  open: boolean;
  services: Service[];
  svcIndex: number;
  photoIndex: number;
  canPrev: boolean;
  canNext: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDot: (photoIndex: number) => void;
}

export function Lightbox({
  open,
  services,
  svcIndex,
  photoIndex,
  canPrev,
  canNext,
  onClose,
  onPrev,
  onNext,
  onDot,
}: LightboxProps) {
  const service = services[svcIndex];
  const photo = service?.photos[photoIndex];
  const [imgSrc, setImgSrc] = useState(photo?.src ?? "");
  const [imgAlt, setImgAlt] = useState(photo?.alt ?? "");
  const [imgOpaque, setImgOpaque] = useState(true);
  const touchX = useRef(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open || !photo) return;
    setImgOpaque(false);
    const timer = window.setTimeout(() => {
      setImgSrc(photo.src);
      setImgAlt(photo.alt);
      setImgOpaque(true);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [open, photo]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  const navBtn =
    "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/25 disabled:pointer-events-none disabled:opacity-25 max-[560px]:hidden [&_svg]:h-[22px] [&_svg]:w-[22px]";

  return (
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onTouchStart={(event) => {
        touchX.current = event.touches[0].clientX;
      }}
      onTouchEnd={(event) => {
        const dx = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) {
          if (dx < 0) onNext();
          else onPrev();
        }
      }}
    >
      <div
        className={`absolute inset-0 transition-[background-color] duration-[340ms] ${
          open ? "bg-[rgba(10,10,10,0.88)]" : "bg-transparent"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative z-[1] flex items-center gap-4 max-w-[90vw] transition-[transform,opacity] duration-[360ms] ease-signature ${
          open ? "scale-100 opacity-100" : "scale-[0.92] opacity-0"
        }`}
      >
        <button
          className="fixed top-5 right-5 z-[2] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/[0.12] text-white transition-colors duration-200 hover:bg-white/25 max-[560px]:top-[max(12px,env(safe-area-inset-top,0px))] max-[560px]:right-[max(12px,env(safe-area-inset-right,0px))] [&_svg]:h-5 [&_svg]:w-5"
          ref={closeRef}
          aria-label="Fechar galeria"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button className={navBtn} aria-label="Foto anterior" disabled={!canPrev} onClick={onPrev}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex max-h-[80vh] max-w-[min(70vw,840px)] items-center justify-center max-[560px]:max-w-[90vw]">
          <img
            className="block max-h-[72vh] max-w-full rounded-lg object-contain transition-opacity duration-[220ms]"
            src={imgSrc}
            alt={imgAlt}
            style={{ opacity: imgOpaque ? 1 : 0 }}
          />
        </div>
        <button className={navBtn} aria-label="Próxima foto" disabled={!canNext} onClick={onNext}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-center max-[560px]:bottom-[max(16px,env(safe-area-inset-bottom,0px))]">
          <div>
            <h3 className="m-0 font-display text-[clamp(17px,1.4vw,20px)] font-bold text-white">
              {service?.fullTitle || service?.title}
            </h3>
            <p className="mt-1 mb-0 text-[clamp(13px,0.9vw,15px)] text-white/60">
              {service?.subtitle || service?.desc}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {service?.photos.map((item, index) => (
              <button
                key={item.src}
                className={`h-1.5 w-1.5 cursor-pointer rounded-full border-none p-0 transition-[background-color,transform] duration-200 ${
                  index === photoIndex ? "scale-[1.4] bg-white" : "bg-white/35"
                }`}
                aria-label={`Foto ${index + 1}`}
                onClick={() => onDot(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
