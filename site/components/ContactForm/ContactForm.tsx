"use client";

import { FormEvent, useState } from "react";
import { getWhatsAppUrl } from "@/lib/site";
import { eyebrowLine } from "@/lib/styles";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const fieldClass =
  "w-full rounded-lg border border-line bg-elevated px-4 py-3.5 font-body text-base transition-[border-color,box-shadow] duration-300 ease-signature focus:border-brand focus:outline-none focus:shadow-[0_0_0_3px_var(--color-brand-pale)]";

export function ContactForm() {
  const [form, setForm] = useState<ContactFormState>(initialState);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!name || !message) {
      window.alert("Por favor, preencha o nome e a mensagem.");
      return;
    }

    let text = `Olá, Stelus! 👋\n\nMeu nome é *${name}*.\n`;
    if (email) text += `E-mail: ${email}\n`;
    if (phone) text += `Telefone: ${phone}\n`;
    text += `\nMensagem:\n${message}`;

    window.open(getWhatsAppUrl(text), "_blank");
  }

  return (
    <div className="reveal">
      <span className={eyebrowLine}>Formulário</span>
      <h2 className="mt-4 mb-8 font-display text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.01em] text-ink">
        Envie sua Mensagem
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <label htmlFor="name" className="mb-2 block font-body text-[11px] font-medium tracking-[0.12em] uppercase text-ink-mute">
            Nome
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="email" className="mb-2 block font-body text-[11px] font-medium tracking-[0.12em] uppercase text-ink-mute">
            E-mail (opcional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            className={fieldClass}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="phone" className="mb-2 block font-body text-[11px] font-medium tracking-[0.12em] uppercase text-ink-mute">
            Telefone (Opcional)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            className={fieldClass}
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="message" className="mb-2 block font-body text-[11px] font-medium tracking-[0.12em] uppercase text-ink-mute">
            Mensagem
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className={`${fieldClass} min-h-[140px] resize-y`}
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
          />
        </div>
        <button
          type="submit"
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-brand px-4 py-4 text-[15px] font-semibold text-canvas transition-[transform,background-color] duration-300 ease-signature hover:-translate-y-0.5 hover:bg-ink"
        >
          Enviar pelo WhatsApp →
        </button>
      </form>
    </div>
  );
}
