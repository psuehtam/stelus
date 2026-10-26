import { listen, select, selectAll } from "../utils/dom.js";

const placeholderImage =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const initGalleryModal = () => {
  const modal = select("[data-gallery-modal]");
  if (!modal) return;

  const image = select("[data-modal-image]", modal);
  const closeButton = select("[data-modal-close]", modal);
  const status = select("[data-modal-status]", modal);
  const cards = selectAll("[data-gallery-image]");
  if (!image || !closeButton) return;

  const open = (source) => {
    const sourceUrl = source.dataset.galleryImage;
    if (!sourceUrl) return;

    image.src = placeholderImage;
    image.alt = "";
    if (status) status.textContent = "Carregando imagem…";
    modal.showModal();

    const preview = new Image();
    preview.onload = () => {
      image.src = sourceUrl;
      image.alt = source.dataset.galleryAlt || "";
      if (status) status.textContent = "";
    };
    preview.onerror = () => {
      if (status)
        status.textContent =
          "Não foi possível carregar esta imagem. Tente novamente.";
    };
    preview.src = sourceUrl;
  };

  cards.forEach((card) => listen(card, "click", () => open(card)));
  listen(closeButton, "click", () => modal.close());
  listen(modal, "click", (event) => {
    if (event.target === modal) modal.close();
  });
};
