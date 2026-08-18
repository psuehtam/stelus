import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero/PageHero";
import { ServiceGallery } from "@/components/ServiceGallery/ServiceGallery";
import { HowToOrder } from "@/components/HowToOrder/HowToOrder";
import { ASSETS, WHATSAPP_URL } from "@/lib/site";
import "./servicos.css";

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
      <section className="section">
        <div className="container">
          <div className="contact-cta reveal">
            <span className="eyebrow eyebrow-line">Tem uma ideia diferente?</span>
            <h2>Adoramos desafios.</h2>
            <p>
              Se o que você precisa não está na lista, entre em contato. Estamos prontos para
              encontrar a melhor solução para a sua peça.
            </p>
            <a href={WHATSAPP_URL} className="btn btn-accent" target="_blank" rel="noopener">
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
