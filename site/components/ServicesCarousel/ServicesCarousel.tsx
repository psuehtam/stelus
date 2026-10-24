"use client";

import Link from "next/link";
import { HOME_SERVICES } from "@/lib/services";
import { useDragScroll } from "@/hooks/useDragScroll";
import { container, eyebrowLine, sectionHead, sectionHeadLabel, sectionHeadTitle } from "@/lib/styles";

export function ServicesCarousel() {
  const trackRef = useDragScroll<HTMLDivElement>();

  return (
    <section className="bg-canvas py-[clamp(100px,14vh,160px)]" id="servicos">
      <div className={container}>
        <div className={sectionHead}>
          <div className={`${sectionHeadLabel} reveal`}>
            <span className={eyebrowLine}>O que bordamos</span>
          </div>
          <h2 className={`${sectionHeadTitle} reveal delay-1`}>
            Bordamos o que você <em>imaginar.</em>
          </h2>
        </div>
        <div className="reveal relative mt-[clamp(36px,5vw,56px)] [mask-image:linear-gradient(to_right,transparent_0,#000_32px,#000_calc(100%-32px),transparent_100%)] min-[900px]:[mask-image:none]">
          <div
            className="flex cursor-grab gap-4 overflow-x-auto scroll-px-4 snap-x snap-mandatory px-8 py-1 pb-5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden active:cursor-grabbing min-[900px]:cursor-default min-[900px]:flex-wrap min-[900px]:justify-center min-[900px]:overflow-visible min-[900px]:px-0 min-[900px]:snap-none min-[900px]:active:cursor-default"
            ref={trackRef}
            role="list"
          >
            {HOME_SERVICES.map((service) => (
              <article
                key={service.id}
                className="flex w-[clamp(200px,28vw,280px)] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-line bg-elevated text-left max-[900px]:w-[clamp(180px,42vw,260px)] max-[560px]:w-[clamp(160px,72vw,260px)]"
                role="listitem"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-deep">
                  <img src={service.capa} alt={service.capaAlt} loading="lazy" className="block h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col gap-1 px-5 pt-[18px] pb-5">
                  <h3 className="m-0 font-display text-[clamp(16px,1.8vw,20px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
                    {service.title}
                  </h3>
                  <p className="m-0 text-[clamp(13px,0.9vw,15px)] text-ink-soft">{service.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="reveal mt-[clamp(32px,5vw,48px)] flex flex-wrap items-center justify-between gap-[clamp(16px,3vw,40px)] rounded-lg bg-brand px-[clamp(28px,4vw,48px)] py-[clamp(24px,3.5vw,36px)] max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4">
          <p className="m-0 font-display text-[clamp(18px,2.4vw,24px)] font-bold tracking-[-0.02em] text-white">
            Todos os nossos serviços em um só lugar
          </p>
          <Link
            href="/servicos"
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-3.5 font-body text-[15px] font-bold text-brand transition-[background-color,color] duration-200 hover:bg-ink hover:text-white max-[900px]:w-full max-[900px]:justify-center"
          >
            Ver todos os serviços →
          </Link>
        </div>
      </div>
    </section>
  );
}
