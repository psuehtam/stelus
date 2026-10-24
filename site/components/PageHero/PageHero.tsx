import type { ReactNode } from "react";
import { container, eyebrowLine } from "@/lib/styles";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas pt-[clamp(140px,18vh,180px)] pb-[clamp(60px,8vh,80px)] max-[900px]:pt-[clamp(120px,16vh,150px)] max-[900px]:pb-[clamp(40px,6vh,64px)]">
      <div className={container}>
        <span className={`${eyebrowLine} reveal`}>{eyebrow}</span>
        <h1 className="reveal delay-1 mt-6 mb-4 font-display text-[clamp(40px,5.4vw,72px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink max-[560px]:text-[clamp(32px,9vw,44px)] [&_em]:not-italic [&_em]:font-extrabold [&_em]:text-brand">
          {title}
        </h1>
        <p className="reveal delay-2 max-w-[640px] text-[clamp(17px,1.4vw,20px)] leading-[1.65] text-ink-soft max-[560px]:text-base">
          {description}
        </p>
      </div>
    </section>
  );
}
