"use client";

import { useCallback, useEffect, useState } from "react";
import type { Service } from "@/lib/services";

export interface LightboxState {
  svcIndex: number;
  photoIndex: number;
}

function totalPhotos(services: Service[]): number {
  return services.reduce((acc, service) => acc + service.photos.length, 0);
}

function globalIndex(services: Service[], svcIndex: number, photoIndex: number): number {
  return (
    services.slice(0, svcIndex).reduce((acc, service) => acc + service.photos.length, 0) +
    photoIndex
  );
}

function navigate(
  services: Service[],
  current: LightboxState,
  direction: -1 | 1
): LightboxState {
  const service = services[current.svcIndex];
  if (!service) return current;

  const nextPhoto = current.photoIndex + direction;

  if (nextPhoto >= 0 && nextPhoto < service.photos.length) {
    return { svcIndex: current.svcIndex, photoIndex: nextPhoto };
  }

  if (direction > 0 && current.svcIndex < services.length - 1) {
    return { svcIndex: current.svcIndex + 1, photoIndex: 0 };
  }

  if (direction < 0 && current.svcIndex > 0) {
    const previous = services[current.svcIndex - 1];
    return {
      svcIndex: current.svcIndex - 1,
      photoIndex: previous.photos.length - 1,
    };
  }

  return current;
}

export function useServiceLightbox(services: Service[]) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<LightboxState>({ svcIndex: 0, photoIndex: 0 });

  const openAt = useCallback((svcIndex: number, photoIndex = 0) => {
    setState({ svcIndex, photoIndex });
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const go = useCallback(
    (direction: -1 | 1) => {
      setState((current) => navigate(services, current, direction));
    },
    [services]
  );

  const showPhoto = useCallback((svcIndex: number, photoIndex: number) => {
    setState({ svcIndex, photoIndex });
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, go]);

  const currentGlobal = globalIndex(services, state.svcIndex, state.photoIndex);
  const lastGlobal = totalPhotos(services) - 1;

  return {
    open,
    svcIndex: state.svcIndex,
    photoIndex: state.photoIndex,
    openAt,
    close,
    go,
    showPhoto,
    canPrev: currentGlobal > 0,
    canNext: currentGlobal < lastGlobal,
  };
}
