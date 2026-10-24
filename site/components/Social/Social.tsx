import { SITE } from "@/lib/site";
import { container, eyebrowLine, sectionHead, sectionHeadLabel, sectionHeadTitle } from "@/lib/styles";

export function Social() {
  return (
    <section className="border-t border-line bg-canvas py-[clamp(60px,8vh,100px)]">
      <div className={container}>
        <div className={`${sectionHead} mb-12`}>
          <div className={`${sectionHeadLabel} reveal`}>
            <span className={eyebrowLine}>Redes sociais</span>
          </div>
          <h2 className={`${sectionHeadTitle} !mt-4 !text-[clamp(32px,4vw,48px)] reveal delay-1`}>
            Acompanhe nossos <em>trabalhos.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 min-[901px]:grid-cols-2">
          <div className="reveal relative flex flex-col gap-4 overflow-hidden rounded-lg border-[1.5px] border-line border-t-[3px] border-t-[#E1306C] bg-elevated p-[clamp(32px,4vw,48px)] transition-[transform,box-shadow] duration-[360ms] ease-signature hover:-translate-y-[5px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]">
            <i className="bi bi-instagram text-[2.4rem] leading-none text-[#E1306C]"></i>
            <h3 className="m-0 font-display text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.01em] text-ink">
              @stelusbordados
            </h3>
            <p className="m-0 flex-grow text-[clamp(15px,1.1vw,17px)] leading-[1.55] text-ink-soft">
              Acompanhe nosso Instagram e veja os trabalhos mais recentes saindo da máquina.
            </p>
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 self-start rounded-full border-[1.5px] border-[#E1306C] bg-transparent px-[22px] py-3 font-body text-[clamp(13px,0.9vw,15px)] font-bold text-[#E1306C] transition-[background-color,color] duration-200 hover:bg-[#E1306C] hover:text-white"
            >
              Ver no Instagram →
            </a>
          </div>
          <div className="reveal delay-1 relative flex flex-col gap-4 overflow-hidden rounded-lg border-[1.5px] border-line border-t-[3px] border-t-[#1877F2] bg-elevated p-[clamp(32px,4vw,48px)] transition-[transform,box-shadow] duration-[360ms] ease-signature hover:-translate-y-[5px] hover:shadow-[0_20px_48px_rgba(0,0,0,0.08)]">
            <i className="bi bi-facebook text-[2.4rem] leading-none text-[#1877F2]"></i>
            <h3 className="m-0 font-display text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.01em] text-ink">
              Stelus no Facebook
            </h3>
            <p className="m-0 flex-grow text-[clamp(15px,1.1vw,17px)] leading-[1.55] text-ink-soft">
              Curta nossa página e fique por dentro das novidades e promoções da Stelus.
            </p>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 self-start rounded-full border-[1.5px] border-[#1877F2] bg-transparent px-[22px] py-3 font-body text-[clamp(13px,0.9vw,15px)] font-bold text-[#1877F2] transition-[background-color,color] duration-200 hover:bg-[#1877F2] hover:text-white"
            >
              Ver no Facebook →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
