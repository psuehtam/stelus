export const SITE = {
  name: "Stelus Bordados Computadorizados",
  shortName: "Stelus Bordados",
  url: process.env.SITE_URL ?? "https://stelusbordados.com.br",
  description:
    "Stelus Bordados Computadorizados em Almirante Tamandaré/PR. Uniformes, patches, bonés, camisetas e enxovais bordados com máquinas Barudan. Solicite seu orçamento.",
  phoneDisplay: "(41) 99108-9105",
  phoneE164: "5541991089105",
  email: "estelusbordados@gmail.com",
  hours: "Segunda a Sexta, 8h às 18h",
  hoursShort: "Seg a Sex, 8h às 18h",
  instagram: "https://www.instagram.com/stelusbordados/",
  facebook: "https://www.facebook.com/estelusbordados/",
  address: {
    street: "R. Campina Grande do Sul, 894",
    neighborhood: "Jardim Roma",
    city: "Alm. Tamandaré/PR",
    cityFull: "Almirante Tamandaré",
    region: "PR",
    cep: "83504-040",
    country: "BR",
  },
} as const;

const WHATSAPP_DEFAULT_TEXT = "Olá! Gostaria de um orçamento.";

export function getWhatsAppUrl(text: string = WHATSAPP_DEFAULT_TEXT): string {
  return `https://api.whatsapp.com/send?phone=${SITE.phoneE164}&text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_URL = getWhatsAppUrl();

export const ASSETS = {
  favicon: "/assets/icons/favicon.png",
  whatsappIcon: "/assets/icons/whatsapp.png",
  logoMarinho: "/assets/logos/stelus-marinho.png",
  logoBranca: "/assets/logos/stelus-branca.png",
  logoWordmark: "/assets/logos/stelus-wordmark.png",
  heroBanner: "/assets/images/banner/hero-banner.webp",
  about: "/assets/images/sobre/sobre-detalhe.webp",
} as const;

export interface NavLink {
  href: string;
  homeHref: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/servicos", homeHref: "/#servicos", label: "Serviços" },
  { href: "/#processo", homeHref: "/#processo", label: "Processo" },
  { href: "/#sobre", homeHref: "/#sobre", label: "Sobre" },
  { href: "/#contato", homeHref: "/#contato", label: "Contato" },
];
