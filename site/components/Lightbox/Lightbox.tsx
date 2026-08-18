"use client";

import { useEffect, useRef, useState } from "react";
import type { Service } from "@/lib/services";
import "./Lightbox.css";

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

  return (
    <div
      className={`svc-lightbox${open ? " open" : ""}`}
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
      <div className="svc-lb-backdrop" onClick={onClose}></div>
      <div className="svc-lb-panel">
        <button
          className="svc-lb-close"
          ref={closeRef}
          aria-label="Fechar galeria"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <button
          className="svc-lb-nav svc-lb-prev"
          aria-label="Foto anterior"
          disabled={!canPrev}
          onClick={onPrev}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="svc-lb-img-wrap">
          <img
            className="svc-lb-img"
            src={imgSrc}
            alt={imgAlt}
            style={{ opacity: imgOpaque ? 1 : 0 }}
          />
        </div>
        <button
          className="svc-lb-nav svc-lb-next"
          aria-label="Próxima foto"
          disabled={!canNext}
          onClick={onNext}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div className="svc-lb-footer">
          <div className="svc-lb-info">
            <h3>{service?.fullTitle || service?.title}</h3>
            <p>{service?.subtitle || service?.desc}</p>
          </div>
          <div className="svc-lb-dots">
            {service?.photos.map((item, index) => (
              <button
                key={item.src}
                className={`svc-lb-dot${index === photoIndex ? " active" : ""}`}
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
