import Image from "next/image";
import Link from "next/link";

interface Promocion {
  id: number;
  titulo?: string;
  subtitulo?: string;
  imagen?: string;
  link?: string;
  texto?: string;
  contexto_enriquecido?: string;
  activo: boolean;
}

async function getActivePromociones(): Promise<Promocion[]> {
  const backendUrl = process.env.BACKEND_CONVENIOS_URL || 'https://backend-convenios-py.dev-wit.com/api';
  const apiKey = process.env.CONVENIOS_API_KEY || '';

  try {
    const res = await fetch(`${backendUrl}/promociones?activo=true`, {
      headers: {
        'x-api-key': apiKey,
        // Si el backend también requiere Authorization temporalmente para GET publico, se puede añadir un token estático o configurar el endpoint
      },
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!res.ok) {
      console.error("Failed to fetch promociones", res.status);
      return [];
    }
    
    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching promociones:", error);
    return [];
  }
}

export async function PromoSection() {
  const promociones = await getActivePromociones();
  
  if (!promociones || promociones.length === 0) {
    return null; // Ocultar si no hay promociones activas
  }

  // Tomamos solo la primera según lo acordado
  const promo = promociones[0];

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 md:p-10 lg:p-12 shadow-md bg-white/80 dark:bg-[#0f1419]/70 backdrop-blur-md flex flex-col gap-8 md:gap-12">
          
          {/* Header Centrado - Título y Subtítulo */}
          {(promo.titulo || promo.subtitulo) && (
            <div className="text-center max-w-3xl mx-auto space-y-3">
              {promo.titulo && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {promo.titulo}
                </h2>
              )}
              {promo.subtitulo && (
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">
                  {promo.subtitulo}
                </p>
              )}
            </div>
          )}

          {/* Contenido Principal */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Columna Izquierda - Imagen */}
            {promo.imagen && (
              <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] group border border-slate-200/50 dark:border-slate-800/50">
                <Image
                  src={promo.imagen} 
                  alt={promo.titulo || "Imagen de promoción"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>
            )}

            {/* Columna Derecha - Link y Base de Promoción */}
            <div className={`w-full ${promo.imagen ? 'lg:w-1/2' : 'lg:w-full'} flex flex-col items-center justify-center text-center space-y-10 py-6`}>
              
              {promo.texto && (
                <div className="w-full px-4 text-slate-700 dark:text-slate-200 text-lg">
                  {promo.texto}
                </div>
              )}

              {promo.link && (
                <div className="w-full px-4">
                  <Link 
                    href={promo.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-base md:text-lg lg:text-xl text-primary dark:text-secondary font-semibold hover:underline transition-all break-all"
                  >
                    {promo.link}
                  </Link>
                </div>
              )}

              {promo.contexto_enriquecido && (
                <div className="pt-4 w-full text-left bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center mb-4">
                    BASE PROMOCION
                  </p>
                  <div 
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-a:text-primary dark:prose-a:text-secondary"
                    dangerouslySetInnerHTML={{ __html: promo.contexto_enriquecido }} 
                  />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
