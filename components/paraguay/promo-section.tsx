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
    return null;
  }

  // Tomamos solo la primera según lo acordado
  const promo = promociones[0];

  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 py-12 md:py-16">
        <div className="w-full shadow-lg rounded-3xl bg-white/80 dark:bg-[#0f1419]/70 backdrop-blur-md flex flex-col gap-8 md:gap-12 overflow-hidden border border-slate-200 dark:border-white/10">
          
          {/* Header Centrado - Título y Subtítulo */}
          {(promo.titulo || promo.subtitulo) && (
            <div className="text-center max-w-3xl mx-auto space-y-3 pt-12 px-4">
              {promo.titulo && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
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
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
            {/* Columna Izquierda - Imagen (60%) */}
            {promo.imagen && (
              <div className="w-full lg:w-3/5 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] group border border-slate-200/50 dark:border-slate-800/50">
                <img
                  src={promo.imagen} 
                  alt={promo.titulo || "Imagen de promoción"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
              </div>
            )}

            {/* Columna Derecha - Links (40%) */}
            <div className={`w-full ${promo.imagen ? 'lg:w-2/5' : 'lg:w-full'} flex flex-col items-center justify-center text-center space-y-12`}>
              
              {(promo.link || promo.texto) && (
                <div className="w-full px-2 text-center">
                  <a 
                    href={promo.link || "/paraguay/bases-promocion"}
                    target={(promo.link || "").startsWith("http") && !(promo.link || "").includes("boletos.la") ? "_blank" : "_self"}
                    rel={(promo.link || "").startsWith("http") && !(promo.link || "").includes("boletos.la") ? "noopener noreferrer" : undefined}
                    className="text-base md:text-lg text-primary dark:text-secondary font-medium hover:underline"
                  >
                    {promo.texto || "Ver bases y condiciones"}
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
