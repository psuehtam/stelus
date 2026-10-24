import { container } from "@/lib/styles";

const STEPS = [
  {
    num: "01 · Arte",
    icon: "bi-vector-pen",
    title: "Sua ideia vira programa.",
    body: "Envie o logo, o desenho ou a referência. Digitalizamos, ajustamos o preenchimento e preparamos o arquivo — cada ponto no lugar certo antes de bordar.",
    delay: "",
  },
  {
    num: "02 · Bordado",
    icon: "bi-cpu",
    title: "Ponto a ponto, com precisão.",
    body: "Máquinas Barudan, referência mundial. Acabamento limpo, firme e duradouro — o mesmo padrão de uniformes corporativos, times e escolas.",
    delay: "delay-1",
  },
  {
    num: "03 · Entrega",
    icon: "bi-check2-circle",
    title: "Conferido antes de sair.",
    body: "Nada sai daqui sem conferência. Prazo cumprido, atendimento direto e a peça do jeito que você imaginou, ou melhor.",
    delay: "delay-2",
  },
];

export function Process() {
  return (
    <section className="relative overflow-hidden py-[clamp(100px,14vh,160px)] text-canvas max-[900px]:py-[clamp(72px,10vh,120px)]" id="processo">
      <div className={container}>
        <div className="grid grid-cols-1 items-start gap-16 min-[901px]:grid-cols-[1fr_1.6fr] min-[901px]:gap-[clamp(48px,8vw,120px)]">
          <div className="min-[901px]:sticky min-[901px]:top-[120px]">
            <div className="reveal mb-8 inline-flex items-center gap-3 font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] uppercase text-mist before:h-px before:w-8 before:bg-mist/90 before:content-['']">
              Como trabalhamos
            </div>
            <h2 className="reveal delay-1 mb-8 max-w-[12ch] font-display text-[clamp(40px,5.4vw,72px)] font-bold leading-none tracking-[-0.02em] max-[900px]:max-w-none max-[900px]:text-[clamp(32px,9vw,48px)] [&_em]:not-italic [&_em]:font-extrabold [&_em]:text-linen">
              Do arquivo ao <em>último ponto.</em>
            </h2>
            <p className="reveal delay-2 max-w-[38ch] text-[clamp(17px,1.4vw,20px)] leading-[1.6] text-mist">
              Você envia a ideia. A gente digitaliza, borda em máquinas Barudan e confere cada
              peça antes de entregar. Sem pressa, sem descuido.
            </p>
          </div>
          <div className="flex flex-col gap-[clamp(40px,6vh,64px)] border-t border-white/[0.12] pt-[clamp(40px,5vh,56px)]">
            {STEPS.map((step, index) => (
              <div
                key={step.num}
                className={`reveal ${step.delay} flex flex-col gap-4 pb-[clamp(32px,4vh,48px)] ${
                  index === STEPS.length - 1 ? "border-b-0 pb-0" : "border-b border-white/[0.08]"
                }`}
              >
                <div className="font-body text-[clamp(11px,0.7vw,12px)] font-medium tracking-[0.18em] text-mist">
                  {step.num}
                </div>
                <i className={`bi ${step.icon} text-2xl text-linen opacity-70`}></i>
                <h3 className="font-display text-[clamp(24px,2.6vw,32px)] font-bold leading-[1.15] tracking-[-0.01em] text-canvas">
                  {step.title}
                </h3>
                <p className="text-[clamp(15px,1.1vw,17px)] leading-[1.65] text-mist">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
