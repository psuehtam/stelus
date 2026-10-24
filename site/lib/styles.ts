export const container =
  "relative z-[2] mx-auto w-full max-w-[1400px] px-[clamp(20px,4vw,64px)] max-[900px]:px-[clamp(16px,5vw,28px)]";

export const section =
  "relative z-[2] bg-canvas py-[clamp(60px,10vh,100px)]";

export const eyebrow =
  "font-body text-[clamp(12px,0.75vw,13px)] font-semibold tracking-[0.18em] uppercase text-ink-mute";

export const eyebrowLine =
  `${eyebrow} inline-flex items-center gap-3 before:content-[''] before:h-px before:w-8 before:bg-brand/50`;

export const sectionHead =
  "mb-[clamp(60px,8vh,100px)] grid grid-cols-1 items-start gap-6 min-[901px]:grid-cols-[1fr_1.6fr] min-[901px]:gap-[clamp(40px,6vw,96px)]";

export const sectionHeadLabel = "min-[901px]:sticky min-[901px]:top-[100px]";

export const sectionHeadTitle =
  "mt-4 font-display text-[clamp(40px,5.4vw,72px)] font-bold leading-[1.05] tracking-[-0.02em] text-ink max-[900px]:text-[clamp(36px,9vw,48px)] [&_em]:not-italic [&_em]:font-extrabold [&_em]:text-brand";

const btnBase =
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-full border-none font-body text-[clamp(14px,0.95vw,16px)] font-medium no-underline transition-[transform,background-color,color,box-shadow] duration-300 ease-signature cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand [&_svg]:h-3.5 [&_svg]:w-3.5";

export const btn = `${btnBase} px-[26px] py-[15px]`;

export const btnPrimary = `${btn} bg-white text-ink hover:-translate-y-0.5 hover:bg-canvas`;

export const btnAccent = `${btn} bg-brand text-canvas hover:-translate-y-0.5 hover:bg-brand-dark`;

export const btnOutline =
  `${btn} bg-transparent text-canvas shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:bg-white hover:text-ink`;

export const btnWhatsapp =
  `${btn} bg-transparent text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:bg-white hover:text-ink [&_svg]:h-4 [&_svg]:w-4`;
