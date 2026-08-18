import type { ReactNode } from "react";
import "./PageHero.css";

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="container">
        <span className="eyebrow eyebrow-line reveal">{eyebrow}</span>
        <h1 className="reveal delay-1">{title}</h1>
        <p className="intro-text reveal delay-2">{description}</p>
      </div>
    </section>
  );
}
