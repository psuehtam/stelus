import { SITE, WHATSAPP_URL } from "@/lib/site";
import "./ContactInfo.css";

export function ContactInfo() {
  return (
    <div className="contact-info-wrapper reveal delay-1">
      <span className="eyebrow eyebrow-line">Canais</span>
      <h2>Nossos Contatos</h2>

      <div className="contact-item">
        <i className="bi bi-telephone-fill"></i>
        <div>
          <strong>Telefone / WhatsApp</strong>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener">
            {SITE.phoneDisplay}
          </a>
        </div>
      </div>
      <div className="contact-item">
        <i className="bi bi-envelope-fill"></i>
        <div>
          <strong>E-mail</strong>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
      <div className="contact-item">
        <i className="bi bi-clock-fill"></i>
        <div>
          <strong>Horário de Atendimento</strong>
          Segunda a Sexta: 8:00 às 18:00
        </div>
      </div>
      <div className="contact-item">
        <i className="bi bi-geo-alt-fill"></i>
        <div>
          <strong>Endereço</strong>
          {SITE.address.street}
          <br />
          {SITE.address.neighborhood}, Alm. Tamandaré-PR
          <br />
          CEP: {SITE.address.cep}
        </div>
      </div>

      <div className="map-container">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3605.138767980889!2d-49.29419468499426!3d-25.36622898381781!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce7259f972061%3A0x6d04a60167c1348a!2sR.%20Campina%20Grande%20do%20Sul%2C%20894%20-%20Jardim%20Roma%2C%20Alm.%20Tamandar%C3%A9%20-%20PR%2C%2083504-040!5e0!3m2!1spt-BR!2sbr!4v1697654321000!5m2!1spt-BR!2sbr"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa da Stelus Bordados"
        />
      </div>
    </div>
  );
}
