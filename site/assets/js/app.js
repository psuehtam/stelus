/* Standalone interactions, preserving the original website's timing and behavior. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const page = document.documentElement.dataset.page;
  const nav = $("#nav"),
    menu = $("#mobileMenu");
  const toggle = $('[aria-controls="mobileMenu"]');
  const backdrop = menu.previousElementSibling;
  backdrop.dataset.menuBackdrop = "";
  const sticky = $('.site-content > a[aria-label="Falar no WhatsApp"]');
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", page !== "/" || scrollY > 40);
    sticky?.classList.toggle(
      "is-visible",
      page === "/contato" || scrollY > 500,
    );
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  let returnFocus;
  const setMenu = (open) => {
    if (open) returnFocus = document.activeElement;
    menu.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    menu.inert = !open;
    menu.setAttribute("aria-hidden", String(!open));
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
    if (open) $("button", menu).focus();
    else returnFocus?.focus();
  };
  toggle.addEventListener("click", () =>
    setMenu(!menu.classList.contains("is-open")),
  );
  backdrop.addEventListener("click", () => setMenu(false));
  $("button", menu).addEventListener("click", () => setMenu(false));
  $$("a", menu).forEach((link) =>
    link.addEventListener("click", () => setMenu(false)),
  );
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
    if (e.matches && menu.classList.contains("is-open")) setMenu(false);
  });
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
    );
    reveals.forEach((el) => observer.observe(el));
    setTimeout(
      () =>
        reveals.forEach((el) => {
          if (el.getBoundingClientRect().top < innerHeight + 200)
            el.classList.add("in");
        }),
      1500,
    );
  } else reveals.forEach((el) => el.classList.add("in"));

  const hero = $("#heroCarousel");
  if (hero) {
    const slides = [...hero.firstElementChild.children];
    const bars = [...hero.lastElementChild.lastElementChild.children];
    if (slides.length > 1 && bars.length === slides.length) {
      const duration = 4000;
      let current = 0;
      let timer;

      // Load all three banners before they rotate into view.
      slides.forEach((slide) => {
        $("img", slide).loading = "eager";
      });

      const show = (index) => {
        current = index;
        slides.forEach((slide, i) =>
          slide.classList.toggle("is-current", i === index),
        );
        bars.forEach((bar, i) => {
          bar.classList.remove("is-current", "is-complete");
          if (i < index) bar.classList.add("is-complete");
        });
        // Restart the current bar's animation after wrapping to the first slide.
        void bars[index].offsetWidth;
        bars[index].classList.add("is-current");
      };

      const schedule = () => {
        clearTimeout(timer);
        if (!document.hidden)
          timer = setTimeout(() => {
            show((current + 1) % slides.length);
            schedule();
          }, duration);
      };

      show(0);
      schedule();
      document.addEventListener("visibilitychange", () => {
        clearTimeout(timer);
        if (!document.hidden) {
          show(current);
          schedule();
        }
      });
    }
  }

  const track = $('#servicos [role="list"]');
  if (track) {
    let drag;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, left: track.scrollLeft };
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("dragstart", (e) => e.preventDefault());
    track.addEventListener("pointermove", (e) => {
      if (!drag) return;
      e.preventDefault();
      track.scrollLeft = drag.left - (e.clientX - drag.x);
    });
    track.addEventListener("pointerup", () => {
      drag = null;
    });
    track.addEventListener("pointercancel", () => {
      drag = null;
    });
  }

  const gallery = $('[aria-label="Galeria de fotos"]');
  let closeGallery = () => {},
    galleryMove = () => {};
  if (gallery) {
    const services = window.STELUS_SERVICES;
    const image = $("img", gallery),
      close = $('[aria-label="Fechar galeria"]', gallery);
    const prev = $('[aria-label="Foto anterior"]', gallery),
      next = $('[aria-label="Próxima foto"]', gallery);
    const title = $("h2", gallery);
    const subtitle = title?.nextElementSibling;
    const dots = title?.parentElement?.nextElementSibling;

    if (
      !Array.isArray(services) ||
      !services.length ||
      !image ||
      !close ||
      !prev ||
      !next ||
      !title ||
      !subtitle ||
      !dots
    ) {
      console.warn(
        "A galeria não pôde ser iniciada porque faltam elementos ou dados necessários.",
      );
    } else {
      const photos = services.flatMap((service, svc) =>
        service.photos.map((photo, index) => ({ ...photo, svc, index })),
      );
      let current = 0,
        opener,
        transition;
      const show = (index, immediate = false) => {
        current = Math.max(0, Math.min(photos.length - 1, index));
        const photo = photos[current],
          service = services[photo.svc];
        clearTimeout(transition);
        image.style.opacity = immediate ? "1" : "0";
        const update = () => {
          image.src = photo.src;
          image.alt = photo.alt;
          image.style.opacity = "1";
        };
        if (immediate || reducedMotion.matches) update();
        else transition = setTimeout(update, 120);
        title.textContent = service.fullTitle;
        subtitle.textContent = service.subtitle;
        prev.disabled = current === 0;
        next.disabled = current === photos.length - 1;
        dots.replaceChildren(
          ...service.photos.map((_, i) => {
            const dot = document.createElement("button");
            dot.className = "gallery-dot";
            dot.classList.toggle("is-active", i === photo.index);
            dot.setAttribute("aria-label", `Foto ${i + 1}`);
            dot.setAttribute("aria-pressed", String(i === photo.index));
            dot.addEventListener("click", () =>
              show(
                photos.findIndex((p) => p.svc === photo.svc && p.index === i),
              ),
            );
            return dot;
          }),
        );
      };
      $$('[role="button"][aria-label^="Ver galeria"]').forEach((card, svc) => {
        const open = () => {
          opener = card;
          show(
            photos.findIndex((p) => p.svc === svc),
            true,
          );
          gallery.inert = false;
          gallery.setAttribute("aria-hidden", "false");
          gallery.classList.add("is-open");
          document.body.classList.add("gallery-open");
          close.focus();
        };
        card.addEventListener("click", open);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        });
      });
      closeGallery = () => {
        clearTimeout(transition);
        gallery.classList.remove("is-open");
        gallery.inert = true;
        gallery.setAttribute("aria-hidden", "true");
        document.body.classList.remove("gallery-open");
        opener?.focus();
      };
      galleryMove = (direction) => show(current + direction);
      close.addEventListener("click", closeGallery);
      gallery.firstElementChild.addEventListener("click", closeGallery);
      prev.addEventListener("click", () => galleryMove(-1));
      next.addEventListener("click", () => galleryMove(1));
      let touchX = 0;
      gallery.addEventListener(
        "touchstart",
        (e) => {
          touchX = e.touches[0].clientX;
        },
        { passive: true },
      );
      gallery.addEventListener(
        "touchend",
        (e) => {
          const dx = e.changedTouches[0].clientX - touchX;
          if (Math.abs(dx) > 50) galleryMove(dx < 0 ? 1 : -1);
        },
        { passive: true },
      );
    }
  }
  document.addEventListener("keydown", (e) => {
    const dialog = gallery?.classList.contains("is-open")
      ? gallery
      : menu.classList.contains("is-open")
        ? menu
        : null;
    if (!dialog) return;
    if (e.key === "Escape")
      dialog === gallery ? closeGallery() : setMenu(false);
    if (dialog === gallery && ["ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      galleryMove(e.key === "ArrowLeft" ? -1 : 1);
    }
    if (e.key === "Tab") {
      const items = $$("a[href],button:not([disabled])", dialog).filter(
        (el) =>
          el.getClientRects().length && getComputedStyle(el).display !== "none",
      );
      const first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})();
