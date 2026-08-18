"use client";

import { SERVICES } from "@/lib/services";
import { Lightbox } from "@/components/Lightbox/Lightbox";
import { useServiceLightbox } from "@/hooks/useServiceLightbox";
import "./ServiceGallery.css";

export function ServiceGallery() {
  const lightbox = useServiceLightbox(SERVICES);

  return (
    <section className="section service-gallery">
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
      <div className="container">
        <div className="svc-cat-grid">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className={`svc-cat-card reveal${index % 3 === 1 ? " delay-1" : index % 3 === 2 ? " delay-2" : ""}`}
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
              <div className="svc-cat-img">
                <img src={service.capa} alt={service.capaAlt} loading="lazy" />
                <div className="svc-cat-overlay">
                  <span className="svc-cat-action">
                    <i className="bi bi-images"></i> Ver fotos
                  </span>
                </div>
              </div>
              <div className="svc-cat-body">
                <h3>{service.fullTitle}</h3>
                <p>{service.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
