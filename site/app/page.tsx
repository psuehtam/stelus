import { Hero } from "@/components/Hero/Hero";
import { ServicesCarousel } from "@/components/ServicesCarousel/ServicesCarousel";
import { Process } from "@/components/Process/Process";
import { About } from "@/components/About/About";
import { Social } from "@/components/Social/Social";
import { Contact } from "@/components/Contact/Contact";
import { localBusinessJsonLd } from "@/lib/jsonld";

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <ServicesCarousel />
        <Process />
        <About />
        <Social />
        <Contact />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
    </>
  );
}
