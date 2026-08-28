import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { BeneficiosForm } from "@/components/paraguay/beneficios-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscríbete en Beneficios Exclusivos | Boletos.la",
  description: "Formulario de inscripción a convenios y beneficios de Boletos.la",
};

export default function BeneficiosPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1419]">
      <ParaguayHeader />
      
      <div className="flex-grow">
        {/* Hero Section para Beneficios */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#1a2332] dark:to-[#0f1419]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px]" />
          </div>
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
              Únete al <span className="text-primary">Club de Beneficios</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
              Inscríbete en nuestros convenios activos para acceder a descuentos exclusivos en tus próximos viajes.
            </p>
          </div>
        </section>

        {/* Formulario superpuesto sobre el Hero */}
        <section className="relative z-20 -mt-24 pb-24 px-4 md:px-6">
          <div className="container mx-auto">
            <BeneficiosForm />
          </div>
        </section>
      </div>

      <ParaguayFooter />
    </main>
  );
}
