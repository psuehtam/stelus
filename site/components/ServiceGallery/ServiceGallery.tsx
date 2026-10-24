"use client";

import { SERVICES } from "@/lib/services";
import { Lightbox } from "@/components/Lightbox/Lightbox";
import { useServiceLightbox } from "@/hooks/useServiceLightbox";
import { container, section } from "@/lib/styles";

export function ServiceGallery() {
  const lightbox = useServiceLightbox(SERVICES);

  return (
    <section className={section}>
      <Lightbox
        open={lightbox.open}
        services={SERVICES}
        svcIndex={lightbox.svcIndex}
        photoIndex={lightbox.photoIndex}
        canPrev={lightbox.canPrev}
        canNext={lightbox.canNext}
        onClose={lightbox.close}
        onPrev={() => lightbox.go(-1)}
        onNext={() => lightbox.go(1)}
        onDot={(photoIndex) => lightbox.showPhoto(lightbox.svcIndex, photoIndex)}
      />
      <div className={container}>
        <div className="grid grid-cols-1 gap-6 min-[561px]:grid-cols-2 min-[1101px]:grid-cols-3 max-[900px]:gap-4">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className={`reveal group flex cursor-pointer flex-col overflow-hidden rounded-lg border-[1.5px] border-line bg-elevated transition-[border-color,transform,box-shadow] duration-300 ease-signature hover:-translate-y-[5px] hover:border-brand hover:shadow-[0_16px_40px_rgba(0,0,0,0.10)] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand ${
                index % 3 === 1 ? "delay-1" : index % 3 === 2 ? "delay-2" : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label={`Ver galeria de ${service.fullTitle}`}
              onClick={() => lightbox.openAt(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  lightbox.openAt(index);
                }
              }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-deep max-[560px]:aspect-[3/2]">
                <img
                  src={service.capa}
                  alt={service.capaAlt}
                  loading="lazy"
                  className="block h-full w-full object-cover transition-transform duration-[600ms] ease-signature group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-end justify-start bg-transparent p-6 transition-[background-color] duration-[320ms] group-hover:bg-[rgba(37,40,56,0.52)] max-[560px]:bg-[rgba(37,40,56,0.36)]">
                  <span className="inline-flex translate-y-2 items-center gap-2 rounded-full bg-elevated px-[18px] py-2.5 font-body text-[clamp(13px,0.9vw,15px)] font-bold text-ink opacity-0 transition-[opacity,transform] duration-[280ms] ease-signature group-hover:translate-y-0 group-hover:opacity-100 max-[560px]:translate-y-0 max-[560px]:opacity-100">
                    <i className="bi bi-images"></i> Ver fotos
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <h3 className="m-0 font-display text-[clamp(20px,1.7vw,24px)] font-bold leading-[1.2] tracking-[-0.02em] text-ink">
                  {service.fullTitle}
                </h3>
                <p className="m-0 text-[clamp(15px,1.1vw,17px)] leading-[1.65] text-ink-soft">{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
