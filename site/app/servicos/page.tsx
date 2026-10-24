import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero/PageHero";
import { ServiceGallery } from "@/components/ServiceGallery/ServiceGallery";
import { HowToOrder } from "@/components/HowToOrder/HowToOrder";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";
import { btnAccent, container, eyebrowLine, section } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Serviços de Bordado",
  description:
    "Conheça todos os serviços de bordado da Stelus: uniformes, patches, bonés, camisetas, enxovais e logotipos. Veja como funciona o processo e solicite seu orçamento.",
  openGraph: {
    title: "Serviços de Bordado - Stelus Bordados",
    description:
      "Uniformes, patches, bonés, camisetas, enxovais e logotipos bordados em Almirante Tamandaré/PR. Saiba como pedir o seu.",
    url: "/servicos",
    images: [ASSETS.heroBanner],
  },
};

export default function ServicosPage() {
  return (
    <main>
      <PageHero
        eyebrow="Serviços que executamos"
        title={
          <>
            O bordado certo para <em>cada peça.</em>
          </>
        }
        description="Trabalhamos com empresas, escolas, times e pessoas que querem uma peça personalizada de verdade, sem abrir mão do acabamento."
      />
      <ServiceGallery />
      <HowToOrder />
      <section className={section}>
        <div className={container}>
          <div className="reveal relative mx-auto max-w-[800px] overflow-hidden rounded-lg border-[1.5px] border-line-strong bg-elevated px-8 py-[clamp(48px,6vw,72px)] text-center max-[560px]:px-5 max-[560px]:py-10">
            <span className={`${eyebrowLine} mb-6`}>Tem uma ideia diferente?</span>
            <h2 className="mb-4 font-display text-[clamp(32px,4vw,48px)] font-bold tracking-[-0.02em] text-ink">
              Adoramos desafios.
            </h2>
            <p className="mx-auto mb-8 max-w-[520px] text-[clamp(17px,1.4vw,20px)] leading-[1.65] text-ink-soft">
              Se o que você precisa não está na lista, entre em contato. Estamos prontos para
              encontrar a melhor solução para a sua peça.
            </p>
            <a href={WHATSAPP_URL} className={btnAccent} target="_blank" rel="noopener">
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
