"use client";

import Image from "next/image";
import Link from "next/link";

export function PromoSection() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-[#0f1419] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-10 lg:p-12 shadow-sm bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-8 md:gap-12">
          
          {/* Header Centrado - Título y Subtítulo */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Título de Ejemplo
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium">
              Subtítulo de ejemplo promocional
            </p>
          </div>

          {/* Contenido Principal: Imagen a la izquierda y Enlaces/Bases a la derecha */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Columna Izquierda - Imagen */}
            <div className="w-full lg:w-1/2 relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] group">
              {/* Usamos una imagen de destino existente como ejemplo */}
              <Image
                src="/images/destinations/carrusel-paraguay.jpg" 
                alt="Imagen de promoción"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
            </div>

            {/* Columna Derecha - Link y Base de Promoción */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center text-center space-y-10 py-6">
              <div className="w-full px-4">
                <Link 
                  href="#"
                  className="text-base md:text-lg lg:text-xl text-primary dark:text-secondary font-semibold hover:underline transition-all break-all"
                >
                  https://linkdeejemplo2312414124124
                </Link>
              </div>

              <div className="pt-4">
                <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  BASE PROMOCION
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
