import { SITE } from "@/lib/site";

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  foundingDate: "2019",
  description:
    "Bordados computadorizados em Almirante Tamandaré/PR — uniformes, patches, bonés, camisetas, enxovais e logotipos em máquinas Barudan.",
  url: SITE.url,
  telephone: `+${SITE.phoneE164}`,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.cityFull,
    addressRegion: SITE.address.region,
    postalCode: SITE.address.cep,
    addressCountry: SITE.address.country,
  },
  openingHours: "Mo-Fr 08:00-18:00",
  sameAs: [SITE.instagram, SITE.facebook],
};
