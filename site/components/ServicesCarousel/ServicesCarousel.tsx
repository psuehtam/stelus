"use client";

import Link from "next/link";
import { HOME_SERVICES } from "@/lib/services";
import { useDragScroll } from "@/hooks/useDragScroll";
import "./ServicesCarousel.css";

export function ServicesCarousel() {
  const trackRef = useDragScroll<HTMLDivElement>();

  return (
    <section className="services" id="servicos">
      <div className="container">
        <div className="section-head">
          <div className="section-head-label reveal">
            <span className="eyebrow eyebrow-line">O que bordamos</span>
          </div>
          <h2 className="section-head-title reveal delay-1">
            Bordamos o que você <em>imaginar.</em>
          </h2>
        </div>
        <div className="svc-carousel-wrap reveal">
          <div className="svc-track" ref={trackRef} role="list">
            {HOME_SERVICES.map((service) => (
              <article
                key={service.id}
                className="svc-card svc-card--static"
                role="listitem"
              >
                <div className="svc-card-img">
                  <img src={service.capa} alt={service.capaAlt} loading="lazy" />
                </div>
                <div className="svc-card-body">
                  <h3>{service.title}</h3>
                  <p>{service.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="services-cta-strip reveal">
          <p>Todos os nossos serviços em um só lugar</p>
          <Link href="/servicos" className="btn-strip">
            Ver todos os serviços →
          </Link>
        </div>
      </div>
    </section>
  );
}
