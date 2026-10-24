import type { Metadata } from "next";
import Link from "next/link";
import { btnAccent, btnOutline, container } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Mensagem Enviada!",
  description: "Mensagem enviada com sucesso para a Stelus Bordados. Retornaremos em breve.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SucessoContatoPage() {
  return (
    <main className="bg-canvas">
      <div
        className={`${container} flex min-h-screen flex-col items-center justify-center py-[clamp(20px,4vw,64px)] text-center`}
      >
        <div className="mb-6 text-[4rem] text-brand">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1 className="mb-4 font-display text-[clamp(32px,4vw,48px)] font-bold tracking-[-0.02em] text-ink">
          Mensagem enviada!
        </h1>
        <p className="mb-8 max-w-[480px] text-[clamp(17px,1.4vw,20px)] leading-[1.65] text-ink-soft">
          Obrigado por entrar em contato. Recebemos sua mensagem e retornaremos em breve.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className={btnAccent}>
            Voltar ao início
          </Link>
          <Link
            href="/servicos"
            className={`${btnOutline} !text-ink shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]`}
          >
            Ver serviços
          </Link>
        </div>
      </div>
    </main>
  );
}
