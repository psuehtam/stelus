import { ASSETS } from "@/lib/site";
import "./About.css";

export function About() {
  return (
    <section className="about" id="sobre">
      <div className="container">
        <div className="about-grid">
          <div className="about-visual reveal">
            <img src={ASSETS.about} alt="Bordado Stelus em detalhe" loading="lazy" />
          </div>
          <div className="about-text reveal delay-1">
            <span className="eyebrow eyebrow-line">A empresa</span>
            <h2>
              Desde 2019 traduzindo ideias <em>em bordado.</em>
            </h2>
            <div className="about-body">
              <p>
                A Stelus nasceu em 2019 em Almirante Tamandaré com foco em empresas que
                precisam de bordado de qualidade: escolas, uniformes corporativos, uniformes
                esportivos e brindes. Atendemos do pedido pequeno à produção em escala com o
                mesmo padrão de acabamento.
              </p>
              <p>
                Cada arquivo passa por digitalização profissional antes da produção —
                garantindo que a logo chegue na peça exatamente como foi desenhada, ponto por
                ponto.
              </p>
            </div>
            <div className="about-pillars">
              <div className="pillar">
                <span className="pillar-label">Foco B2B</span>
                <div className="pillar-content">
                  <h4>Empresas, escolas e times.</h4>
                  <p>
                    Uniforme corporativo, camiseta de time, patch de jaqueta — produção em
                    escala com qualidade constante.
                  </p>
                </div>
              </div>
              <div className="pillar">
                <span className="pillar-label">Com o quê</span>
                <div className="pillar-content">
                  <h4>Tecnologia Barudan.</h4>
                  <p>
                    Maquinário de alta precisão com conferência manual antes do empacotamento
                    em cada pedido.
                  </p>
                </div>
              </div>
              <div className="pillar">
                <span className="pillar-label">O resultado</span>
                <div className="pillar-content">
                  <h4>Bordado que se vê de perto.</h4>
                  <p>
                    Ponto firme, cor certa, acabamento limpo — qualidade que aparece no toque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
