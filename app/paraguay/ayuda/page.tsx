import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { ScrollToTop } from "@/components/scroll-to-top";
import { RefundForm } from "@/components/refund-form";

export default function AyudaPage() {
  const country = "paraguay";
  
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0f1419] flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: #0f1419; }` }} />
      <ParaguayHeader />
      
      <div className="flex-1 container mx-auto px-4 py-12 md:py-20 flex items-center justify-center">
        <RefundForm />
      </div>

      <ParaguayFooter />
      <ScrollToTop />
    </main>
  );
}
