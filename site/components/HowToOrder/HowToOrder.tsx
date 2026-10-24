import { container, eyebrowLine, section } from "@/lib/styles";

const STEPS = [
  {
    num: "01",
    title: "Envie a arte ou referência",
    body: "Mande o logo, a imagem ou descreva o que quer. Aceitamos JPG, PNG, PDF e até uma foto de referência.",
    delay: "",
  },
  {
    num: "02",
    title: "Aprovação e orçamento",
    body: "Digitalizamos a arte e enviamos para aprovação antes de bordar. Sem surpresas no resultado, o que você aprovar é o que sai da máquina.",
    delay: "delay-1",
  },
  {
    num: "03",
    title: "Bordado e entrega",
    body: "Produzimos, conferimos cada peça e entregamos. Pode retirar no atendimento ou combinar a entrega diretamente.",
    delay: "delay-2",
  },
];

export function HowToOrder() {
  return (
    <section className={`${section} border-y border-line`}>
      <div className={container}>
        <div className="grid grid-cols-1 items-start gap-16 min-[901px]:grid-cols-[1fr_1.6fr] min-[901px]:gap-[clamp(48px,6vw,96px)]">
          <div className="reveal">
            <span className={eyebrowLine}>Como pedir</span>
            <h2 className="my-4 font-display text-[clamp(32px,4vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
              Três passos para o seu bordado.
            </h2>
            <p className="text-[clamp(15px,1.1vw,17px)] leading-[1.65] text-ink-soft">
              Não precisa saber nada de bordado, só ter a ideia. A gente cuida do resto.
            </p>
          </div>
          <div className="flex flex-col border-t border-line-strong">
            {STEPS.map((step, index) => (
              <div
                key={step.num}
                className={`reveal ${step.delay} grid grid-cols-[48px_1fr] items-start gap-6 py-8 max-[560px]:grid-cols-[36px_1fr] max-[560px]:gap-4 ${
                  index === STEPS.length - 1 ? "" : "border-b border-line"
                }`}
              >
                <span className="pt-1 font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] text-ink-mute">
                  {step.num}
                </span>
                <div>
                  <h3 className="mb-2 font-body text-[clamp(20px,1.7vw,24px)] font-semibold tracking-[-0.02em] text-ink">
                    {step.title}
                  </h3>
                  <p className="text-[clamp(15px,1.1vw,17px)] leading-[1.65] text-ink-soft">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
