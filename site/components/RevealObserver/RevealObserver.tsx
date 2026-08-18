"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function RevealObserver() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    const fallback = window.setTimeout(() => {
      elements.forEach((el) => {
        if (el.classList.contains("in")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 200) el.classList.add("in");
      });
    }, 1500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
