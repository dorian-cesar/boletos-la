"use client";

import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function BasesPromocionPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col relative overflow-x-clip">
      <ParaguayHeader />
      
      {/* Background decorations matching the app's style */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      {/* Bottom decorations */}
      <div className="absolute bottom-0 inset-x-0 h-[500px] bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="flex-1 pt-32 pb-20 container mx-auto px-4 max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
          BASES Y CONDICIONES LEGALES DE LA PROMOCIÓN
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-200">
          “TRAVEL SALE - SORTEO TABLET DOOGEE T10W”
        </h2>

        <div className="space-y-10 text-slate-700 dark:text-neutral-300 leading-relaxed text-[17px] mt-10">
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              1. ORGANIZADOR
            </h3>
            <p>
              La presente promoción comercial (en adelante, la "Promoción") es organizada por Boletos.la (en adelante, el "Organizador"), válida para todo el territorio de la República del Paraguay.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              2. VIGENCIA Y TERRITORIO
            </h3>
            <p>
              La Promoción tendrá vigencia desde las 00:00 horas del 24 de agosto de 2026 hasta las 23:59 horas del 31 de agosto de 2026 inclusive, dentro del territorio paraguayo.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              3. REQUISITOS PARA PARTICIPAR
            </h3>
            <p>
              Podrán participar de la Promoción todas las personas físicas, mayores de 18 años, domiciliadas en la República del Paraguay, que realicen la compra de uno (1) o más pasajes de ómnibus a través del sitio web oficial <a href="http://boletos.la/" className="text-primary hover:underline">boletos.la</a> durante la vigencia de la Promoción. Cada pasaje/boleto comprado generará una (1) opción automática para participar en el sorteo. No hay límite de compras por usuario.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              4. PREMIO
            </h3>
            <p className="mb-2">El premio del presente sorteo consiste únicamente en:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Un (1) dispositivo electrónico: Tablet marca Doogee, modelo T10W (Pantalla de 10,1”, almacenamiento interno de 128 GB, 4 GB RAM, conectividad 4G LTE).</li>
            </ul>
            <p>
              El premio es personal e intransferible únicamente bajo previa autorización por escrito del Organizador, y en ningún caso podrá ser canjeado por su valor en dinero efectivo, otros bienes o servicios.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              5. MECÁNICA DEL SORTEO Y ANUNCIO DEL GANADOR
            </h3>
            <p className="mb-4">
              El sorteo se realizará de forma aleatoria mediante una plataforma digital de selección al azar el día 1 de septiembre de 2026 a las 15:00 horas (hora de Paraguay).
            </p>
            <p>
              El nombre del ganador será anunciado públicamente en esa misma fecha y hora a través de la cuenta oficial de Instagram del Organizador (<a href="http://boletos.la.py/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@boletos.la.py</a>). Se seleccionará asimismo un (1) ganador suplente para el caso de que el titular no cumpla con los requisitos o no reclame el premio.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              6. NOTIFICACIÓN Y RETIRO DEL PREMIO
            </h3>
            <p className="mb-4">
              El Organizador contactará al ganador vía correo electrónico y/o número de teléfono registrado al momento de la compra. El ganador tendrá un plazo máximo de 7 (siete) días corridos desde la notificación para responder y coordinar la entrega. Pasado dicho plazo sin respuesta, el ganador perderá automáticamente el derecho al premio y se procederá a adjudicarlo al ganador suplente.
            </p>
            <p>
              Para la entrega del premio, el ganador deberá presentar su Documento de Identidad (C.I.) vigente en Paraguay. En caso de requerir envío al interior del país, los costos de flete o transporte correrán por cuenta del Organizador (o del ganador, según prefieran definir).
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              7. AUTORIZACIÓN DE USO DE IMAGEN
            </h3>
            <p>
              El ganador autoriza de manera expresa al Organizador a difundir su nombre, apellido, imagen y/o voz en las redes sociales y medios digitales de <a href="http://boletos.la/" className="text-primary hover:underline">boletos.la</a> con fines publicitarios y de transparencia del sorteo, sin que esto otorgue derecho a compensación o remuneración alguna.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              8. EXONERACIÓN DE RESPONSABILIDAD DE META PLATFORMS
            </h3>
            <p>
              Esta Promoción no está patrocinada, avalada, administrada ni asociada de modo alguno a Meta Platforms, Inc. (Facebook/Instagram). Los participantes exoneran totalmente a Meta de cualquier responsabilidad derivada de esta actividad comercial.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              9. MODIFICACIONES Y CASO FORTUITO
            </h3>
            <p>
              El Organizador se reserva el derecho de modificar las presentes Bases y Condiciones, cancelar o suspender la Promoción por razones de fuerza mayor o caso fortuito no imputables al mismo, informando oportunamente a través de sus canales digitales oficiales.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              10. JURISDICCIÓN Y LEY APLICABLE
            </h3>
            <p>
              Para cualquier controversia que pudiera derivarse de la realización de la Promoción, las partes se someten a la legislación vigente de la República del Paraguay y a la jurisdicción de los Tribunales Ordinarios de la Ciudad de Asunción.
            </p>
          </section>
        </div>
      </div>

      <ParaguayFooter />
      <ScrollToTop />
    </main>
  );
}
