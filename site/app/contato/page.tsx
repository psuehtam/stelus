import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero/PageHero";
import { ContactForm } from "@/components/ContactForm/ContactForm";
import { ContactInfo } from "@/components/ContactInfo/ContactInfo";
import { container, section } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Entre em contato com a Stelus Bordados. Envie uma mensagem, fale no WhatsApp ou visite-nos em Almirante Tamandaré/PR. Seg–Sex: 8h às 18h.",
  openGraph: {
    title: "Contato - Stelus Bordados",
    description:
      "Entre em contato para solicitar um orçamento. WhatsApp, e-mail ou formulário — respondemos rapidamente.",
    url: "/contato",
  },
};

export default function ContatoPage() {
  return (
    <main>
      <PageHero
        eyebrow="Falar com a Stelus"
        title={
          <>
            Entre em <em>Contato</em>
          </>
        }
        description="Tem alguma dúvida ou gostaria de solicitar um orçamento? Preencha o formulário abaixo ou utilize um dos nossos canais de atendimento."
      />
      <section className={`${section} pt-0`}>
        <div className={container}>
          <div className="grid grid-cols-1 items-start gap-16 min-[901px]:grid-cols-2 min-[901px]:gap-[clamp(40px,6vw,80px)]">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </section>
    </main>
  );
}
