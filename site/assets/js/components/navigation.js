import { listen, select, selectAll } from "../utils/dom.js";

export const initNavigation = () => {
  const header = select("[data-header]");
  if (!header) return;

  const mobileMenu = select(".c-mobile-menu", header);
  const isAlwaysCompact = header.hasAttribute("data-header-compact");
  let animationFrame;
  let isCompact = header.classList.contains("c-header--compact");

  const renderHeader = () => {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      const nextCompactState = Boolean(isAlwaysCompact || window.scrollY > 40);
      if (nextCompactState === isCompact) return;
      header.classList.toggle("c-header--compact", nextCompactState);
      isCompact = nextCompactState;
    });
  };
  const closeMobileMenu = () => {
    if (mobileMenu?.open) mobileMenu.open = false;
  };

  renderHeader();
  listen(window, "scroll", renderHeader, { passive: true });

  if (mobileMenu) {
    selectAll("a", mobileMenu).forEach((link) =>
      listen(link, "click", closeMobileMenu),
    );
  }
};
