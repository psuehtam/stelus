import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { WhatsAppSticky } from "@/components/WhatsAppSticky/WhatsAppSticky";
import { RevealObserver } from "@/components/RevealObserver/RevealObserver";
import { SITE, ASSETS } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.name,
    template: `%s - ${SITE.name}`,
  },
  description: SITE.description,
  icons: {
    icon: ASSETS.favicon,
    shortcut: ASSETS.favicon,
  },
  openGraph: {
    type: "website",
    siteName: SITE.shortName,
    locale: "pt_BR",
    title: SITE.name,
    description:
      "Bordados personalizados em Almirante Tamandaré/PR — uniformes, patches, logotipos e peças exclusivas com acabamento de qualidade.",
    images: [ASSETS.heroBanner],
    url: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} ${dmSans.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
      </head>
      <body>
        <div className="site-background" aria-hidden="true" />
        <div className="site-overlay" aria-hidden="true" />
        <div className="site-content">
          <RevealObserver />
          <Header />
          {children}
          <Footer />
          <WhatsAppSticky />
        </div>
      </body>
    </html>
  );
}
