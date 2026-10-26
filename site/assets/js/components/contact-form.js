import { createWhatsAppUrl } from "../config/site.js";
import { listen, select } from "../utils/dom.js";

const buildMessage = ({ name, email, phone, message }) => {
  const lines = ["Olá, Stelus! 👋", "", `Meu nome é *${name}*.`];
  if (email) lines.push(`E-mail: ${email}`);
  if (phone) lines.push(`Telefone: ${phone}`);
  lines.push("", "Mensagem:", message);
  return lines.join("\n");
};

export const initContactForm = () => {
  const form = select("[data-contact-form]");
  if (!form) return;

  const feedback = select("[data-form-feedback]");
  const submitButton = select('[type="submit"]', form);
  const setFeedback = (message, state) => {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.dataset.state = state;
  };

  listen(
    form,
    "invalid",
    (event) => event.target.setAttribute("aria-invalid", "true"),
    true,
  );
  listen(form, "input", (event) => {
    if (!event.target.matches(".c-field__input")) return;
    event.target.removeAttribute("aria-invalid");
    if (feedback?.dataset.state === "error") setFeedback("", "idle");
  });

  listen(form, "submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      setFeedback("Revise os campos indicados para continuar.", "error");
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const fields = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value.trim()]),
    );
    try {
      submitButton?.setAttribute("aria-busy", "true");
      submitButton?.setAttribute("disabled", "");
      window.open(
        createWhatsAppUrl(buildMessage(fields)),
        "_blank",
        "noopener,noreferrer",
      );
      setFeedback(
        "A conversa deve abrir em uma nova aba. Se isso não acontecer, use o botão do WhatsApp.",
        "success",
      );
    } catch {
      setFeedback(
        "Não foi possível preparar sua mensagem. Tente novamente.",
        "error",
      );
    } finally {
      window.setTimeout(() => {
        submitButton?.removeAttribute("aria-busy");
        submitButton?.removeAttribute("disabled");
      }, 500);
    }
  });
};
