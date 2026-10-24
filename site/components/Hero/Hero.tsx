"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";
import { HERO_SLIDES } from "@/lib/services";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { btnPrimary, btnWhatsapp, container } from "@/lib/styles";

const SLIDE_DURATION = 4000;
const WORD_DELAYS = ["[animation-delay:280ms]", "[animation-delay:360ms]", "[animation-delay:440ms]", "[animation-delay:520ms]", "[animation-delay:600ms]"];

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

  const words = ["Bordados", "que", "vestem", "a sua"];

  return (
    <section
      className="relative flex min-h-svh items-end overflow-hidden p-0 text-white max-[900px]:min-h-[78svh]"
      id="heroCarousel"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
    >
      <div className="absolute inset-0 z-0 bg-brand-dark" aria-hidden="true">
        {HERO_SLIDES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-[900ms] ease-soft ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={src}
              alt=""
              loading={index === 0 ? "eager" : "lazy"}
              className={`h-full w-full object-cover ${
                index === 0
                  ? "scale-[1.08] animate-hero-zoom [animation-delay:200ms]"
                  : index === current
                    ? "scale-100 transition-transform duration-[8000ms] linear"
                    : "scale-[1.06] transition-transform duration-[8000ms] linear"
              }`}
            />
          </div>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(26,26,26,0.35)_0%,rgba(26,26,26,0.15)_35%,rgba(26,26,26,0.72)_100%),linear-gradient(90deg,rgba(26,26,26,0.55)_0%,transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className={`${container} relative z-[2] max-w-[1400px] pt-[clamp(120px,16vh,160px)] pb-[clamp(40px,6vh,64px)] max-[900px]:pt-[clamp(88px,12vh,112px)] max-[900px]:pb-[clamp(20px,4vh,32px)]`}
      >
        <img
          src={ASSETS.logoWordmark}
          className="mb-[clamp(16px,2vh,28px)] block h-[clamp(44px,5.5vw,68px)] w-auto translate-y-3 animate-hero-in opacity-0 [animation-delay:120ms] max-[560px]:mb-2 max-[560px]:h-10"
          alt="Stelus"
        />
        <h1 className="mb-[clamp(16px,2vh,24px)] max-w-[16ch] font-display text-[clamp(28px,4.2vw,54px)] font-bold leading-[1.05] tracking-[-0.02em] text-white/[0.92] max-[900px]:mb-3 max-[900px]:max-w-none max-[900px]:text-[clamp(34px,8.5vw,44px)]">
          {words.map((word, index) => (
            <span
              key={word}
              className="inline-block overflow-hidden align-top pt-[0.05em] pr-[0.1em] pb-[0.12em] mt-[-0.05em] mb-[-0.08em]"
            >
              <span className={`inline-block translate-y-[110%] animate-word-in ${WORD_DELAYS[index]}`}>
                {word}
              </span>
            </span>
          ))}
          <span className="inline-block overflow-hidden align-top pt-[0.05em] pr-[0.1em] pb-[0.12em] mt-[-0.05em] mb-[-0.08em]">
            <span className={`inline-block translate-y-[110%] animate-word-in ${WORD_DELAYS[4]}`}>
              <em className="not-italic font-extrabold text-linen">marca.</em>
            </span>
          </span>
        </h1>
        <p className="mb-[clamp(24px,3vh,36px)] max-w-[42ch] translate-y-2 animate-hero-in text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-white/[0.78] opacity-0 [animation-delay:900ms] [animation-duration:700ms] max-[900px]:mb-5 max-[560px]:text-[18px]">
          Bordados computadorizados em Alm. Tamandaré. Uniformes, patches e logotipos com
          acabamento que se vê de perto.
        </p>
        <div className="flex flex-wrap items-center gap-4 translate-y-2 animate-hero-in opacity-0 [animation-delay:1050ms] [animation-duration:700ms] max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:[&_a]:w-full">
          <Link href="/#servicos" className={btnPrimary}>
            Ver serviços
          </Link>
          <a href={WHATSAPP_URL} className={btnWhatsapp} target="_blank" rel="noopener">
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
        <div
          className="mt-[clamp(28px,4vh,44px)] flex flex-wrap gap-2 translate-y-2 animate-hero-in opacity-0 [animation-delay:1200ms] [animation-duration:700ms] max-[560px]:hidden"
          aria-hidden="true"
        >
          {["Empresas", "Escolas", "Times", "Eventos", "Enxovais", "Marcas"].map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/[0.22] px-3.5 py-1.5 font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.12em] uppercase text-white/65"
            >
              {label}
            </span>
          ))}
        </div>
        <div
          className="mt-[clamp(36px,5vh,56px)] flex max-w-[280px] gap-1.5 animate-hero-in opacity-0 [animation-delay:1300ms] [animation-duration:700ms] max-[900px]:mt-6"
          aria-hidden="true"
        >
          {HERO_SLIDES.map((src, index) => (
            <span
              key={index === current ? `active-${current}` : src}
              className={`relative h-0.5 flex-1 overflow-hidden bg-white/[0.28] after:absolute after:inset-0 after:origin-left after:bg-white after:content-[''] ${
                index < current
                  ? "after:scale-x-100"
                  : index === current
                    ? "after:animate-progress-fill"
                    : "after:scale-x-0"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
