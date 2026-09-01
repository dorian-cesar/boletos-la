import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { BeneficiosForm } from "@/components/paraguay/beneficios-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Inscríbete en Beneficios Exclusivos | Boletos.la",
  description: "Formulario de inscripción a convenios y beneficios de Boletos.la",
};

export const dynamic = 'force-dynamic'; // Desactiva el caché para reflejar cambios del mantenedor en tiempo real

export default async function BeneficiosPage() {
  let hasActiveConvenios = false;
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_CONVENIOS_URL || "https://backend-convenios-py.dev-wit.com/api";
    const apiKey = process.env.NEXT_PUBLIC_CONVENIOS_API_KEY || "";
    
    // Si no está expuesta en el servidor la variable NEXT_PUBLIC, intentamos usar una interna
    const resolvedApiKey = apiKey || process.env.CONVENIOS_API_KEY || "";
    
    const res = await fetch(`${backendUrl}/convenios?beneficio=true`, {
      headers: { "x-api-key": resolvedApiKey },
      cache: 'no-store'
    });
    
    if (res.ok) {
      const data = await res.json();
      const rows = data?.rows || data || [];
      const activeConvenios = rows.filter((c: any) => {
        if (!c.inscripcion) return false;
        if (c.endpoint !== "/api/integraciones/beneficiarios/validar" && c.beneficio_endpoint_validacion !== "/api/integraciones/beneficiarios/validar") {
          return false;
        }
        const now = new Date();
        const start = c.fecha_inicio_inscripcion ? new Date(c.fecha_inicio_inscripcion) : null;
        const end = c.fecha_fin_inscripcion ? new Date(c.fecha_fin_inscripcion) : null;
        
        if (start && now < start) return false;
        if (end && now > end) return false;
        return true;
      });
      hasActiveConvenios = activeConvenios.length > 0;
    }
  } catch (error) {
    console.error("Error validando convenios en servidor:", error);
  }

  // Si no hay convenios activos con inscripción, redireccionamos a la home
  if (!hasActiveConvenios) {
    redirect("/paraguay");
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1419] overflow-x-hidden">
      <ParaguayHeader />
      
      <div className="flex-grow relative bg-gradient-to-b from-slate-100 to-slate-50 dark:from-[#1a2332] dark:to-[#0f1419]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[5%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
        </div>

        {/* Hero Section para Beneficios */}
        <section className="relative pt-20 pb-32">
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
