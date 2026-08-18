import { SITE, WHATSAPP_URL } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import "./Contact.css";

export function Contact() {
  return (
    <section className="contact" id="contato">
      <div className="container">
        <div className="contact-grid">
          <div>
            <div className="contact-eyebrow reveal">Falar com a Stelus</div>
            <h2 className="contact-title reveal delay-1">
              Vamos bordar <em>a sua ideia?</em>
            </h2>
            <div className="contact-actions reveal delay-2">
              <a href={WHATSAPP_URL} className="contact-cta-btn" target="_blank" rel="noopener">
                <WhatsAppIcon />
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="contact-info reveal delay-3">
            <div className="contact-info-block">
              <span className="contact-info-label">WhatsApp</span>
              <span className="contact-info-value">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener">
                  {SITE.phoneDisplay}
                </a>
              </span>
            </div>
            <div className="contact-info-block">
              <span className="contact-info-label">E-mail</span>
              <span className="contact-info-value">
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </span>
            </div>
            <div className="contact-info-block">
              <span className="contact-info-label">Horário</span>
              <span className="contact-info-value">{SITE.hours}</span>
            </div>
            <div className="contact-info-block">
              <span className="contact-info-label">Endereço</span>
              <span className="contact-info-value">
                {SITE.address.street}
                <br />
                {SITE.address.neighborhood}, {SITE.address.city}
                <br />
                CEP {SITE.address.cep}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
