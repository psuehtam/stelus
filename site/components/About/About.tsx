import { ASSETS } from "@/lib/site";
import { container, eyebrowLine } from "@/lib/styles";

export function About() {
  return (
    <section className="bg-canvas py-[clamp(100px,14vh,180px)] max-[900px]:py-[clamp(72px,10vh,120px)]" id="sobre">
      <div className={container}>
        <div className="grid grid-cols-1 items-start gap-8 min-[901px]:grid-cols-[0.9fr_1.1fr] min-[901px]:gap-[clamp(40px,6vw,88px)]">
          <div className="reveal sticky top-[120px] aspect-[4/5] overflow-hidden rounded-[32px_6px_32px_6px] bg-deep max-[900px]:static max-[900px]:max-h-[420px] max-[900px]:aspect-[16/10]">
            <img src={ASSETS.about} alt="Bordado Stelus em detalhe" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="reveal delay-1">
            <span className={eyebrowLine}>A empresa</span>
            <h2 className="mt-6 mb-12 font-display text-[clamp(36px,4.8vw,64px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink max-[900px]:mt-4 max-[900px]:mb-6 max-[900px]:text-[clamp(28px,8vw,40px)] [&_em]:not-italic [&_em]:font-extrabold [&_em]:text-brand">
              Desde 2019 traduzindo ideias <em>em bordado.</em>
            </h2>
            <div className="max-w-[56ch] text-[clamp(17px,1.4vw,20px)] leading-[1.65] text-ink-soft [&_p]:mb-4">
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
            <div className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-8">
              {[
                {
                  label: "Foco B2B",
                  title: "Empresas, escolas e times.",
                  body: "Uniforme corporativo, camiseta de time, patch de jaqueta — produção em escala com qualidade constante.",
                },
                {
                  label: "Com o quê",
                  title: "Tecnologia Barudan.",
                  body: "Maquinário de alta precisão com conferência manual antes do empacotamento em cada pedido.",
                },
                {
                  label: "O resultado",
                  title: "Bordado que se vê de perto.",
                  body: "Ponto firme, cor certa, acabamento limpo — qualidade que aparece no toque.",
                },
              ].map((pillar, index, list) => (
                <div
                  key={pillar.label}
                  className={`grid grid-cols-1 gap-2 py-3 max-[560px]:grid-cols-1 min-[561px]:grid-cols-[80px_1fr] min-[561px]:gap-6 ${
                    index === list.length - 1 ? "" : "border-b border-line"
                  }`}
                >
                  <span className="pt-1 font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-ink-mute">
                    {pillar.label}
                  </span>
                  <div>
                    <h4 className="mb-1.5 font-body text-[clamp(17px,1.4vw,20px)] font-semibold tracking-[-0.02em] text-ink">
                      {pillar.title}
                    </h4>
                    <p className="text-[clamp(15px,1.1vw,17px)] leading-[1.6] text-ink-soft">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
