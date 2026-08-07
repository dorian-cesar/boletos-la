import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { RefundForm } from "@/components/refund-form";

export default function AyudaPage() {
  const country = "paraguay";
  
  return (
    <main className="min-h-screen bg-[#0f1419] flex flex-col">
      <Header country={country} />
      
      <div className="flex-1 container mx-auto px-4 py-12 md:py-20 flex items-center justify-center">
        <RefundForm />
      </div>

      <Footer country={country} />
      <ScrollToTop />
    </main>
  );
}
