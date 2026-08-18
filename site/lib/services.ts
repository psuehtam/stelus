import { ASSETS } from "@/lib/site";

export interface ServicePhoto {
  src: string;
  alt: string;
}

export interface Service {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  fullTitle: string;
  desc: string;
  capa: string;
  capaAlt: string;
  photos: ServicePhoto[];
}

export const SERVICES: Service[] = [
  {
    id: "uniformes",
    num: "01",
    title: "Uniformes",
    subtitle: "Empresas e escolas",
    fullTitle: "Uniformes Profissionais e Escolares",
    desc: "Camisas, polos e jaquetas com o logo bordado, identidade visual que a equipe veste com orgulho. Atendemos desde um conjunto de peças até demandas maiores com o mesmo padrão de acabamento.",
    capa: "/assets/images/servicos/uniformes/uniforme-capa.webp",
    capaAlt: "Uniformes bordados",
    photos: [
      {
        src: "/assets/images/servicos/uniformes/uniforme-capa.webp",
        alt: "Uniformes profissionais bordados",
      },
    ],
  },
  {
    id: "patches",
    num: "02",
    title: "Patches",
    subtitle: "Jaquetas e acessórios",
    fullTitle: "Patches Bordados",
    desc: "Patches avulsos para aplicar onde quiser — jaquetas, mochilas, bonés. Formatos personalizados, bordados por inteiro, com ou sem termocolante ou merrow na borda.",
    capa: "/assets/images/servicos/patches/patch-capa.webp",
    capaAlt: "Patch bordado personalizado",
    photos: [
      {
        src: "/assets/images/servicos/patches/patch-capa.webp",
        alt: "Patch bordado personalizado",
      },
      {
        src: "/assets/images/servicos/patches/patch-detalhe.webp",
        alt: "Detalhe de patch bordado",
      },
    ],
  },
  {
    id: "bones",
    num: "03",
    title: "Bonés",
    subtitle: "Estruturado ou snapback",
    fullTitle: "Bonés e Acessórios",
    desc: "Bordado em frente, lateral ou aba — bonés, toucas e acessórios com o detalhe certo para marcas, eventos corporativos, times ou uso pessoal.",
    capa: "/assets/images/servicos/bones/bone-capa.png",
    capaAlt: "Bonés bordados",
    photos: [
      {
        src: "/assets/images/servicos/bones/bone-capa.png",
        alt: "Boné com bordado personalizado",
      },
    ],
  },
  {
    id: "camisetas",
    num: "04",
    title: "Camisetas",
    subtitle: "Peças avulsas ou em quantidade",
    fullTitle: "Camisetas e Roupas",
    desc: "Polos, jaquetas, camisetas — bordado no peito, manga ou costas. Peças avulsas ou em quantidade, sempre com o mesmo rigor de acabamento.",
    capa: "/assets/images/servicos/camisetas/camiseta-capa.png",
    capaAlt: "Camiseta com bordado",
    photos: [
      {
        src: "/assets/images/servicos/camisetas/camiseta-capa.png",
        alt: "Camiseta com bordado personalizado",
      },
    ],
  },
  {
    id: "enxovais",
    num: "05",
    title: "Enxovais",
    subtitle: "Presentes e hotelaria",
    fullTitle: "Enxovais e Peças Decorativas",
    desc: "Toalhas, roupões, almofadas e kits personalizados — ideais para presentes, hotelaria, spas ou uso próprio. O bordado transforma qualquer peça em algo com significado.",
    capa: "/assets/images/servicos/enxovais/toalha-capa.png",
    capaAlt: "Toalha com bordado personalizado",
    photos: [
      {
        src: "/assets/images/servicos/enxovais/toalha-capa.png",
        alt: "Toalha de banho com bordado personalizado",
      },
    ],
  },
  {
    id: "logotipos",
    num: "06",
    title: "Logotipos",
    subtitle: "Marcas e identidade visual",
    fullTitle: "Logotipos e Marcas",
    desc: "Seu logo digitalizado e bordado com fidelidade de cor e detalhe, aplicável em qualquer material — do pequeno bordado no bolso à aplicação completa nas costas de uma jaqueta.",
    capa: "/assets/images/servicos/logotipos/logotipo-capa.png",
    capaAlt: "Logotipo de empresa bordado",
    photos: [
      {
        src: "/assets/images/servicos/logotipos/logotipo-capa.png",
        alt: "Logotipo de empresa bordado em uniforme",
      },
    ],
  },
];

export const HERO_SLIDES = [
  ASSETS.heroBanner,
  "/assets/images/servicos/uniformes/uniforme-capa.webp",
  "/assets/images/servicos/patches/patch-capa.webp",
  "/assets/images/servicos/patches/patch-detalhe.webp",
  "/assets/images/servicos/logotipos/logotipo-capa.png",
] as const;

const HOME_SERVICE_IDS = ["uniformes", "enxovais", "camisetas"] as const;

export const HOME_SERVICES: Service[] = HOME_SERVICE_IDS.map((id) => {
  const service = SERVICES.find((item) => item.id === id);
  if (!service) {
    throw new Error(`Serviço da home não encontrado: ${id}`);
  }
  return service;
});
