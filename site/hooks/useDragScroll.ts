"use client";

import { useEffect, useRef } from "react";

export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (event: MouseEvent) => {
      isDown = true;
      startX = event.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    };

    const onLeave = () => {
      isDown = false;
    };

    const onUp = () => {
      isDown = false;
    };

    const onMove = (event: MouseEvent) => {
      if (!isDown) return;
      event.preventDefault();
      track.scrollLeft = scrollLeft - (event.pageX - track.offsetLeft - startX);
    };

    track.addEventListener("mousedown", onDown);
    track.addEventListener("mouseleave", onLeave);
    track.addEventListener("mouseup", onUp);
    track.addEventListener("mousemove", onMove);

    return () => {
      track.removeEventListener("mousedown", onDown);
      track.removeEventListener("mouseleave", onLeave);
      track.removeEventListener("mouseup", onUp);
      track.removeEventListener("mousemove", onMove);
    };
  }, []);

  return ref;
}
