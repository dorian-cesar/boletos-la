"use client";

import Image from "next/image";

export function PartnersSection() {
  const logos = Array.from({ length: 10 }, (_, i) => 
    `/logos/comercios/LOGOS-COMERCIOS-${(i + 1).toString().padStart(2, '0')}.png`
  );

  return (
    <section className="bg-white py-10 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h3 className="text-center text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">
          NUESTROS ALIADOS COMERCIALES
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {logos.map((logo, idx) => (
            <div key={idx} className="relative w-24 h-12 md:w-32 md:h-16 opacity-70 hover:opacity-100 transition-opacity duration-300">
              <Image
                src={logo}
                alt={`Socio comercial ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100px, 150px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
