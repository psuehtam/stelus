import { SITE, WHATSAPP_URL } from "@/lib/site";
import { eyebrowLine } from "@/lib/styles";

const ITEMS = [
  {
    icon: "bi-telephone-fill",
    title: "Telefone / WhatsApp",
    body: (
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener"
        className="border-b border-transparent text-ink transition-[border-color] duration-300 ease-signature hover:border-brand"
      >
        {SITE.phoneDisplay}
      </a>
    ),
  },
  {
    icon: "bi-envelope-fill",
    title: "E-mail",
    body: (
      <a
        href={`mailto:${SITE.email}`}
        className="border-b border-transparent text-ink transition-[border-color] duration-300 ease-signature hover:border-brand"
      >
        {SITE.email}
      </a>
    ),
  },
  {
    icon: "bi-clock-fill",
    title: "Horário de Atendimento",
    body: "Segunda a Sexta: 8:00 às 18:00",
  },
  {
    icon: "bi-geo-alt-fill",
    title: "Endereço",
    body: (
      <>
        {SITE.address.street}
        <br />
        {SITE.address.neighborhood}, Alm. Tamandaré-PR
        <br />
        CEP: {SITE.address.cep}
      </>
    ),
  },
];

export function ContactInfo() {
  return (
    <div className="reveal delay-1">
      <span className={eyebrowLine}>Canais</span>
      <h2 className="mt-4 mb-8 font-display text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.01em] text-ink">
        Nossos Contatos
      </h2>

      {ITEMS.map((item, index) => (
        <div
          key={item.title}
          className={`flex items-start gap-4 py-4 ${index === ITEMS.length - 1 ? "" : "border-b border-line"}`}
        >
          <i className={`bi ${item.icon} mt-0.5 text-[1.25rem] text-brand`}></i>
          <div>
            <strong className="mb-1 block font-body text-[10px] font-medium tracking-[0.16em] uppercase text-ink-mute">
              {item.title}
            </strong>
            {item.body}
          </div>
        </div>
      ))}

      <div className="mt-8 overflow-hidden rounded-lg border border-line">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3605.138767980889!2d-49.29419468499426!3d-25.36622898381781!2m3!1f0!2f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94dce7259f972061%3A0x6d04a60167c1348a!2sR.%20Campina%20Grande%20do%20Sul%2C%20894%20-%20Jardim%20Roma%2C%20Alm.%20Tamandar%C3%A9%20-%20PR%2C%2083504-040!5e0!3m2!1spt-BR!2sbr!4v1697654321000!5m2!1spt-BR!2sbr"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mapa da Stelus Bordados"
          className="block h-[240px] w-full border-0"
        />
      </div>
    </div>
  );
}
