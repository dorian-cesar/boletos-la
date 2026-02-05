import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { DestinationsSection } from "@/components/destinations-section";
import { CompaniesSection } from "@/components/companies-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <DestinationsSection />
      <CompaniesSection />
      <Footer />
    </main>
  );
}
