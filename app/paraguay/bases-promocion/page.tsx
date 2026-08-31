// app/paraguay/bases-promocion/page.tsx
import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Promocion {
  id: number;
  titulo?: string;
  contexto_enriquecido?: string;
}

async function getActivePromociones(): Promise<Promocion[]> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_CONVENIOS_URL || process.env.BACKEND_CONVENIOS_URL || 'https://backend-convenios-py.dev-wit.com/api';
  const apiKey = process.env.NEXT_PUBLIC_CONVENIOS_API_KEY || process.env.CONVENIOS_API_KEY || '';

  try {
    const res = await fetch(`${backendUrl}/promociones?activo=true`, {
      headers: {
        'x-api-key': apiKey,
      },
      cache: 'no-store',
    });
    
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    return data || [];
  } catch (error) {
    return [];
  }
}

export default async function BasesPromocionPage() {
  const promociones = await getActivePromociones();
  const promo = promociones && promociones.length > 0 ? promociones[0] : null;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1419]">
      <ParaguayHeader />
      
      <div className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-4xl mx-auto bg-white dark:bg-[#1a2332] rounded-3xl shadow-md border border-slate-200 dark:border-slate-800 p-6 md:p-10 lg:p-12">
          
          <div className="mb-8">
            <Link 
              href="/paraguay" 
              className="inline-flex items-center text-primary dark:text-secondary hover:underline font-medium mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Bases y Condiciones
            </h1>
            {promo?.titulo && (
              <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300">
                {promo.titulo}
              </h2>
            )}
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-700 mb-8" />

          {promo && promo.contexto_enriquecido ? (
            <div 
              className="prose prose-slate md:prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary dark:prose-a:text-secondary hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: promo.contexto_enriquecido }} 
            />
          ) : (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <p className="text-lg">No hay bases y condiciones activas en este momento.</p>
            </div>
          )}

        </div>
      </div>

      <ParaguayFooter />
    </main>
  );
}
