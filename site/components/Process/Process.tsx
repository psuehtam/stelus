import "./Process.css";

export function Process() {
  return (
    <section className="process" id="processo">
      <div className="container">
        <div className="process-layout">
          <div className="process-intro">
            <div className="process-eyebrow reveal">Como trabalhamos</div>
            <h2 className="process-title reveal delay-1">
              Do arquivo ao <em>último ponto.</em>
            </h2>
            <p className="process-lead reveal delay-2">
              Você envia a ideia. A gente digitaliza, borda em máquinas Barudan e confere cada
              peça antes de entregar. Sem pressa, sem descuido.
            </p>
          </div>
          <div className="process-steps">
            <div className="process-step reveal">
              <div className="process-num">01 · Arte</div>
              <i className="bi bi-vector-pen"></i>
              <h3 className="process-step-title">Sua ideia vira programa.</h3>
              <p className="process-step-body">
                Envie o logo, o desenho ou a referência. Digitalizamos, ajustamos o
                preenchimento e preparamos o arquivo — cada ponto no lugar certo antes de
                bordar.
              </p>
            </div>
            <div className="process-step reveal delay-1">
              <div className="process-num">02 · Bordado</div>
              <i className="bi bi-cpu"></i>
              <h3 className="process-step-title">Ponto a ponto, com precisão.</h3>
              <p className="process-step-body">
                Máquinas Barudan, referência mundial. Acabamento limpo, firme e duradouro — o
                mesmo padrão de uniformes corporativos, times e escolas.
              </p>
            </div>
            <div className="process-step reveal delay-2">
              <div className="process-num">03 · Entrega</div>
              <i className="bi bi-check2-circle"></i>
              <h3 className="process-step-title">Conferido antes de sair.</h3>
              <p className="process-step-body">
                Nada sai daqui sem conferência. Prazo cumprido, atendimento direto e a peça do
                jeito que você imaginou, ou melhor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
