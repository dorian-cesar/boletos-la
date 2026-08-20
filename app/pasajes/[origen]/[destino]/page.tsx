import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ParaguayHeader } from '@/components/paraguay/header';
import { ParaguayFooter } from '@/components/paraguay/footer';
import RouteViewContentTracker from '@/components/route-view-content-tracker';
import { formatCityName, getPasajesRoutes } from '@/lib/pasajes-urls';
import { ArrowRight, Bus, Calendar, Clock, MapPin, ShieldCheck, Ticket } from 'lucide-react';

interface PageProps {
  params: Promise<{
    origen: string;
    destino: string;
  }>;
}

export async function generateStaticParams() {
  const routes = getPasajesRoutes();
  return routes.map((r) => ({
    origen: r.origenSlug,
    destino: r.destinoSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { origen, destino } = await params;
  const origenName = formatCityName(origen);
  const destinoName = formatCityName(destino);

  const title = `Pasajes de Bus de ${origenName} a ${destinoName} | Boletos.la`;
  const description = `Compra tu pasaje en autobús de ${origenName} a ${destinoName} al mejor precio. Compara horarios, precios y empresas en Boletos.la.`;
  const canonicalUrl = `https://boletos.la/pasajes/${origen}/${destino}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Boletos.la',
      locale: 'es_PY',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PasajesRoutePage({ params }: PageProps) {
  const { origen, destino } = await params;
  const origenName = formatCityName(origen);
  const destinoName = formatCityName(destino);

  const allRoutes = getPasajesRoutes();

  // Validar si la ruta existe en la lista oficial
  const currentRoute = allRoutes.find(
    (r) => r.origenSlug === origen && r.destinoSlug === destino
  );

  // Si no está en url.txt pero es una url genérica, la formateamos
  const origenTitle = currentRoute ? currentRoute.origenName : origenName;
  const destinoTitle = currentRoute ? currentRoute.destinoName : destinoName;

  // Rutas relacionadas desde el mismo origen
  const relatedFromOrigen = allRoutes
    .filter((r) => r.origenSlug === origen && r.destinoSlug !== destino)
    .slice(0, 6);

  // Rutas relacionadas hacia el mismo destino
  const relatedToDestino = allRoutes
    .filter((r) => r.destinoSlug === destino && r.origenSlug !== origen)
    .slice(0, 6);

  // Esquema JSON-LD para Google Rich Snippets (BusTrip / Product)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BusTrip',
    'name': `Viaje en bus de ${origenTitle} a ${destinoTitle}`,
    'departureBusStop': {
      '@type': 'BusStop',
      'name': `Terminal de Omnibus de ${origenTitle}`
    },
    'arrivalBusStop': {
      '@type': 'BusStop',
      'name': `Terminal de Omnibus de ${destinoTitle}`
    },
    'provider': {
      '@type': 'Organization',
      'name': 'Boletos.la',
      'url': 'https://boletos.la'
    },
    'offers': {
      '@type': 'AggregateOffer',
      'priceCurrency': 'PYG',
      'availability': 'https://schema.org/InStock',
      'url': `https://boletos.la/pasajes/${origen}/${destino}`
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      <RouteViewContentTracker
        contentName={`${origenTitle} - ${destinoTitle}`}
        contentCategory="paraguay"
        contentIds={[`${origen}-${destino}`]}
      />
      {/* Google Schema structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <ParaguayHeader />

        {/* Hero Section para la Ruta */}
        <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-slate-900 dark:text-white overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6" aria-label="Breadcrumb">
              <Link href="/paraguay" className="hover:underline hover:text-slate-900 dark:text-white transition">Inicio</Link>
              <span>/</span>
              <span className="text-blue-300">Pasajes</span>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-medium">{origenTitle} a {destinoTitle}</span>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-4">
                <Bus className="w-4 h-4 text-amber-400" /> Ruta Directa de Colectivos
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 dark:text-white">
                Pasajes de Bus de <span className="text-amber-400">{origenTitle}</span> a <span className="text-amber-400">{destinoTitle}</span>
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
                Encuentra y compara las mejores empresas de transporte, horarios flexibles y pasajes al mejor precio en Paraguay.
              </p>

              {/* Botón CTA a la búsqueda */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/paraguay?origin=${encodeURIComponent(origenTitle)}&destination=${encodeURIComponent(destinoTitle)}`}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Ticket className="w-6 h-6" />
                  Buscar Pasajes Disponibles
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tarjetas de Información del Viaje */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-1">Frecuencia Diaria</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Salidas diarias en diferentes horarios de la mañana, tarde y noche.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-1">Compra 100% Segura</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Emisión digital inmediata de boletos válidos para abordar directamente.</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-900 dark:text-white mb-1">Terminales Principales</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Salida desde {origenTitle} con llegada a la Terminal de {destinoTitle}.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Informativa para SEO */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900 dark:text-slate-900 dark:text-white">
              Información sobre el trayecto {origenTitle} a {destinoTitle}
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                Viajar en ómnibus de <strong>{origenTitle}</strong> a <strong>{destinoTitle}</strong> es una de las opciones más cómodas y accesibles. En Boletos.la puedes verificar disponibilidades en tiempo real, comparar precios entre distintas empresas y seleccionar tu asiento preferido de forma rápida.
              </p>
              <p>
                Recomendamos presentarse en la terminal de ómnibus al menos 30 minutos antes de la hora estipulada de partida con tu documento de identidad y tu boleto digital descargado en tu teléfono móvil.
              </p>
            </div>
          </div>
        </section>

        {/* Enlazado Interno SEO (Internal Links) */}
        {(relatedFromOrigen.length > 0 || relatedToDestino.length > 0) && (
          <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-slate-900 dark:text-slate-900 dark:text-white text-center">
                Otras rutas populares en Paraguay
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {relatedFromOrigen.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Más salidas desde {origenTitle}
                    </h3>
                    <ul className="space-y-3">
                      {relatedFromOrigen.map((r) => (
                        <li key={r.url}>
                          <Link
                            href={`/pasajes/${r.origenSlug}/${r.destinoSlug}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <span>Pasajes de {r.origenName} a {r.destinoName}</span>
                            <ArrowRight className="w-4 h-4 opacity-70" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {relatedToDestino.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <Bus className="w-5 h-5 text-amber-500" />
                      Otros pasajes con destino a {destinoTitle}
                    </h3>
                    <ul className="space-y-3">
                      {relatedToDestino.map((r) => (
                        <li key={r.url}>
                          <Link
                            href={`/pasajes/${r.origenSlug}/${r.destinoSlug}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          >
                            <span>Pasajes de {r.origenName} a {r.destinoName}</span>
                            <ArrowRight className="w-4 h-4 opacity-70" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      <ParaguayFooter />
    </main>
  );
}
