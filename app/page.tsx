import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import SiteHeader from "@/components/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Services />
      </main>
      <Footer />
    </>
  );
}
