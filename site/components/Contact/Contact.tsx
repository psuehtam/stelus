import { SITE, WHATSAPP_URL } from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { container } from "@/lib/styles";

export function Contact() {
  return (
    <section className="py-[clamp(80px,12vh,140px)] text-canvas max-[900px]:py-[clamp(64px,10vh,100px)]" id="contato">
      <div className={container}>
        <div className="grid grid-cols-1 items-end gap-12 min-[901px]:grid-cols-[1.4fr_1fr] min-[901px]:gap-[clamp(40px,6vw,96px)]">
          <div>
            <div className="reveal mb-6 inline-flex items-center gap-3 font-body text-[11px] font-medium tracking-[0.18em] uppercase text-[rgba(250,250,247,0.5)] before:h-px before:w-8 before:bg-linen/70 before:content-['']">
              Falar com a Stelus
            </div>
            <h2 className="reveal delay-1 mb-12 font-display text-[clamp(52px,7vw,96px)] font-bold leading-none tracking-[-0.02em] text-canvas max-[900px]:mb-6 max-[900px]:text-[clamp(36px,10vw,56px)] [&_em]:not-italic [&_em]:font-extrabold [&_em]:text-linen">
              Vamos bordar <em>a sua ideia?</em>
            </h2>
            <div className="reveal delay-2 flex flex-wrap gap-4">
              <a
                href={WHATSAPP_URL}
                className="inline-flex items-center gap-3.5 rounded-full bg-canvas px-8 py-5 text-[clamp(15px,1.1vw,17px)] font-medium text-ink transition-[transform,background-color,color] duration-300 ease-signature hover:-translate-y-[3px] hover:bg-linen hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white/60 max-[900px]:w-full max-[900px]:justify-center [&_svg]:h-[18px] [&_svg]:w-[18px]"
                target="_blank"
                rel="noopener"
              >
                <WhatsAppIcon />
                Falar no WhatsApp
              </a>
            </div>
          </div>
          <div className="reveal delay-3 flex flex-col">
            {[
              {
                label: "WhatsApp",
                value: (
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener"
                    className="border-b border-transparent transition-[border-color] duration-300 ease-signature hover:border-[rgba(250,250,247,0.5)]"
                  >
                    {SITE.phoneDisplay}
                  </a>
                ),
              },
              {
                label: "E-mail",
                value: (
                  <a
                    href={`mailto:${SITE.email}`}
                    className="border-b border-transparent transition-[border-color] duration-300 ease-signature hover:border-[rgba(250,250,247,0.5)]"
                  >
                    {SITE.email}
                  </a>
                ),
              },
              { label: "Horário", value: SITE.hours },
              {
                label: "Endereço",
                value: (
                  <>
                    {SITE.address.street}
                    <br />
                    {SITE.address.neighborhood}, {SITE.address.city}
                    <br />
                    CEP {SITE.address.cep}
                  </>
                ),
              },
            ].map((block, index, list) => (
              <div
                key={block.label}
                className={`flex flex-col gap-1.5 py-6 ${index === list.length - 1 ? "" : "border-b border-white/[0.12]"}`}
              >
                <span className="font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-[rgba(250,250,247,0.55)]">
                  {block.label}
                </span>
                <span className="font-body text-[clamp(17px,1.4vw,20px)] font-medium leading-[1.4] text-canvas">
                  {block.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
