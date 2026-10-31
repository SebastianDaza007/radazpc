import { Suspense } from "react";
import About from "@/components/About";
import Branches from "@/components/Branches";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Quote from "@/components/Quote";
import { QuoteProvider } from "@/components/QuoteProvider";
import Services from "@/components/Services";
import SiteHeader from "@/components/SiteHeader";
import Ticker from "@/components/Ticker";
import { getPrices } from "@/lib/prices";

// BeforeAfter (src/components/BeforeAfter.tsx) stays unmounted until there are real before/after photos.

async function Sections() {
  const catalog = await getPrices();
  return (
    <QuoteProvider catalog={catalog}>
      <Services catalog={catalog} />
      <Quote />
      <Branches />
      <About />
      <Faq catalog={catalog} />
      <Contact />
    </QuoteProvider>
  );
}

export default function Home() {
  return (
    <>
      <a href="#servicios" className="skip-link">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Ticker />
        <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
          <Sections />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
