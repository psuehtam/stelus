import { initContactForm } from "./components/contact-form.js";
import { initGalleryModal } from "./components/gallery-modal.js";
import { initNavigation } from "./components/navigation.js";

const initializers = [initNavigation, initGalleryModal, initContactForm];

const safelyInitialize = (initializer) => {
  try {
    initializer();
  } catch (error) {
    console.error(`Não foi possível iniciar ${initializer.name}.`, error);
  }
};

const boot = () => initializers.forEach(safelyInitialize);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
