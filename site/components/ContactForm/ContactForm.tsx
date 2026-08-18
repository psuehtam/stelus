"use client";

import { FormEvent, useState } from "react";
import { getWhatsAppUrl } from "@/lib/site";
import "./ContactForm.css";

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
    <div className="contact-form-wrapper reveal">
      <span className="eyebrow eyebrow-line">Formulário</span>
      <h2>Envie sua Mensagem</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail (opcional)</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefone (Opcional)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Mensagem</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
          />
        </div>
        <button type="submit" className="cta-button">
          Enviar pelo WhatsApp →
        </button>
      </form>
    </div>
  );
}
