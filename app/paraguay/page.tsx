// app/page.tsx

import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayHeroSection } from "@/components/paraguay/hero-section";
import { FeaturesSection } from "@/components/paraguay/features-section";
import { DestinationsSection } from "@/components/paraguay/destinations-section";
import { CompaniesSection } from "@/components/paraguay/companies-section";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { PromoSection } from "@/components/paraguay/promo-section";
import { BookingResetter } from "@/components/paraguay/booking-resetter";

export default function ParaguayPage() {
  return (
    <main className="min-h-screen">
      <BookingResetter />
      <ParaguayHeader />
      <ParaguayHeroSection />
      <FeaturesSection />
      <DestinationsSection />
      <PromoSection />
      <ParaguayFooter />
    </main>
  );
}
