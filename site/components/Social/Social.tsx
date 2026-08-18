import { SITE } from "@/lib/site";
import "./Social.css";

export function Social() {
  return (
    <section className="social-strip">
      <div className="container">
        <div className="section-head social-section-head">
          <div className="section-head-label reveal">
            <span className="eyebrow eyebrow-line">Redes sociais</span>
          </div>
          <h2 className="section-head-title reveal delay-1">
            Acompanhe nossos <em>trabalhos.</em>
          </h2>
        </div>
        <div className="social-strip-grid">
          <div className="social-strip-card social-strip-card--instagram reveal">
            <i className="bi bi-instagram"></i>
            <h3>@stelusbordados</h3>
            <p>Acompanhe nosso Instagram e veja os trabalhos mais recentes saindo da máquina.</p>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              className="btn-social-instagram"
            >
              Ver no Instagram →
            </a>
          </div>
          <div className="social-strip-card social-strip-card--facebook reveal delay-1">
            <i className="bi bi-facebook"></i>
            <h3>Stelus no Facebook</h3>
            <p>Curta nossa página e fique por dentro das novidades e promoções da Stelus.</p>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener"
              className="btn-social-facebook"
            >
              Ver no Facebook →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
