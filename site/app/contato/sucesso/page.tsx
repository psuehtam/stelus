import type { Metadata } from "next";
import Link from "next/link";
import "./sucesso.css";

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
    <main className="page-success-main">
      <div className="feedback-container container">
        <div className="feedback-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <h1>Mensagem enviada!</h1>
        <p>Obrigado por entrar em contato. Recebemos sua mensagem e retornaremos em breve.</p>
        <div className="feedback-actions">
          <Link href="/" className="btn btn-accent">
            Voltar ao início
          </Link>
          <Link href="/servicos" className="btn btn-outline">
            Ver serviços
          </Link>
        </div>
      </div>
    </main>
  );
}
