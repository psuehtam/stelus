"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";
import { HERO_SLIDES } from "@/lib/services";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import "./Hero.css";

const SLIDE_DURATION = 4000;

export function Hero() {
  const [current, setCurrent] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || HERO_SLIDES.length < 2) return;

    const timer = window.setInterval(() => {
      if (!pausedRef.current) {
        setCurrent((value) => (value + 1) % HERO_SLIDES.length);
      }
    }, SLIDE_DURATION);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const nextIndex = (current + 1) % HERO_SLIDES.length;
    const preload = new window.Image();
    preload.src = HERO_SLIDES[nextIndex];
  }, [current]);

  return (
    <section
      className="hero"
      id="heroCarousel"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="hero-media" aria-hidden="true">
        {HERO_SLIDES.map((src, index) => (
          <div key={src} className={`hero-slide${index === current ? " is-active" : ""}`}>
            <img src={src} alt="" loading={index === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>
      <div className="hero-scrim" aria-hidden="true"></div>
      <div className="container hero-inner">
        <img src={ASSETS.logoWordmark} className="hero-wordmark" alt="Stelus" />
        <h1 className="hero-headline">
          <span className="word">
            <span>Bordados</span>
          </span>
          <span className="word">
            <span>que</span>
          </span>
          <span className="word">
            <span>vestem</span>
          </span>
          <span className="word">
            <span>a sua</span>
          </span>
          <span className="word">
            <span>
              <em>marca.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          Bordados computadorizados em Alm. Tamandaré. Uniformes, patches e logotipos com
          acabamento que se vê de perto.
        </p>
        <div className="hero-actions">
          <Link href="/#servicos" className="btn btn-primary">
            Ver serviços
          </Link>
          <a href={WHATSAPP_URL} className="btn btn-whatsapp" target="_blank" rel="noopener">
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
        <div className="hero-segments" aria-hidden="true">
          <span>Empresas</span>
          <span>Escolas</span>
          <span>Times</span>
          <span>Eventos</span>
          <span>Enxovais</span>
          <span>Marcas</span>
        </div>
        <div className="hero-carousel-progress" aria-hidden="true">
          {HERO_SLIDES.map((src, index) => (
            <span
              key={index === current ? `active-${current}` : src}
              className={
                index < current ? "is-filled" : index === current ? "is-active" : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
