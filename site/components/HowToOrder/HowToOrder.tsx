import "./HowToOrder.css";

export function HowToOrder() {
  return (
    <section className="section how-to-order">
      <div className="container">
        <div className="how-grid">
          <div className="how-intro reveal">
            <span className="eyebrow eyebrow-line">Como pedir</span>
            <h2>Três passos para o seu bordado.</h2>
            <p>Não precisa saber nada de bordado, só ter a ideia. A gente cuida do resto.</p>
          </div>
          <div className="how-steps">
            <div className="how-step reveal">
              <span className="how-step-num">01</span>
              <div>
                <h3>Envie a arte ou referência</h3>
                <p>
                  Mande o logo, a imagem ou descreva o que quer. Aceitamos JPG, PNG, PDF e até
                  uma foto de referência.
                </p>
              </div>
            </div>
            <div className="how-step reveal delay-1">
              <span className="how-step-num">02</span>
              <div>
                <h3>Aprovação e orçamento</h3>
                <p>
                  Digitalizamos a arte e enviamos para aprovação antes de bordar. Sem surpresas
                  no resultado, o que você aprovar é o que sai da máquina.
                </p>
              </div>
            </div>
            <div className="how-step reveal delay-2">
              <span className="how-step-num">03</span>
              <div>
                <h3>Bordado e entrega</h3>
                <p>
                  Produzimos, conferimos cada peça e entregamos. Pode retirar no atendimento ou
                  combinar a entrega diretamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
