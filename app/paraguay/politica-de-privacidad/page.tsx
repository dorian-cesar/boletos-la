"use client";

import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function PoliticaDePrivacidadPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-x-clip">
      <ParaguayHeader />
      
      {/* Background decorations matching the app's style */}
      <div className="absolute top-[120px] inset-x-0 h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute top-[120px] left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      {/* Bottom decorations */}
      <div className="absolute bottom-0 inset-x-0 h-[500px] bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="flex-1 pt-32 pb-20 container mx-auto px-4 max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
          Política de Privacidad
        </h1>
        <p className="text-primary font-medium mb-12">
          Última actualización: 11 de agosto de 2026
        </p>

        <div className="space-y-10 text-neutral-300 leading-relaxed text-[17px]">
          <div className="space-y-4">
            <p>
              En www.boletos.la (en adelante, "la Empresa"), valoramos la privacidad de nuestros usuarios y nos comprometemos a proteger la información personal que compartes con nosotros. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos tus datos personales cuando interactúas con nuestro sitio web y servicios.
            </p>
            <p>
              Al acceder a www.boletos.la, aceptas las prácticas descritas en esta política.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Información que Recopilamos
            </h2>
            <p className="mb-4">Podemos recopilar dos tipos de información a través de nuestra plataforma:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Información proporcionada por el Usuario:</strong>{" "}
                Datos que tú mismo nos entregas al registrarte o realizar una compra, tales como nombre completo, dirección de correo electrónico, número de teléfono, información de facturación y dirección de envío.
              </li>
              <li>
                <strong className="text-white font-semibold">Información recopilada automáticamente:</strong>{" "}
                Datos técnicos sobre tu dispositivo y tu interacción con el sitio web, incluyendo dirección IP, tipo de navegador, páginas visitadas, tiempos de acceso y cookies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Uso de la Información
            </h2>
            <p className="mb-4">Utilizamos la información recopilada con los siguientes fines:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Procesamiento de transacciones:</strong>{" "}
                Para gestionar la compra, emisión y entrega de tus boletos.
              </li>
              <li>
                <strong className="text-white font-semibold">Atención al cliente:</strong>{" "}
                Para responder a tus consultas, solicitudes de soporte o reclamos.
              </li>
              <li>
                <strong className="text-white font-semibold">Comunicación:</strong>{" "}
                Para enviarte confirmaciones de compra, notificaciones importantes sobre cambios en eventos o actualizaciones de nuestros servicios.
              </li>
              <li>
                <strong className="text-white font-semibold">Mejora del servicio:</strong>{" "}
                Para analizar el comportamiento del usuario y optimizar la funcionalidad, seguridad y experiencia en nuestro sitio web.
              </li>
              <li>
                <strong className="text-white font-semibold">Marketing (con consentimiento):</strong>{" "}
                Para enviarte información sobre eventos futuros o promociones, siempre que hayas aceptado recibir dichas comunicaciones.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Protección de Datos y Seguridad
            </h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y administrativas diseñadas para proteger tu información contra el acceso no autorizado, la alteración, divulgación o destrucción.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Utilizamos protocolos de cifrado estándar (como SSL/TLS) para proteger la transmisión de datos sensibles, especialmente durante el proceso de pago.
              </li>
              <li>
                No obstante, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro, por lo que no podemos garantizar una seguridad absoluta.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Compartición de Información con Terceros
            </h2>
            <p className="mb-4">
              La Empresa no vende, arrienda ni alquila tu información personal a terceros. Podemos compartir datos bajo las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Proveedores de servicios:</strong>{" "}
                Con terceros de confianza que nos ayudan a operar el sitio web (procesadores de pagos, servicios de alojamiento, análisis web) y que están obligados a mantener la confidencialidad de la información.
              </li>
              <li>
                <strong className="text-white font-semibold">Organizadores de eventos:</strong>{" "}
                Podemos compartir información necesaria con el organizador del evento para la validación y control de acceso de los boletos.
              </li>
              <li>
                <strong className="text-white font-semibold">Requerimientos legales:</strong>{" "}
                Si la ley, una orden judicial o una autoridad gubernamental competente exige la divulgación de información.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Cookies y Tecnologías de Seguimiento
            </h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia, personalizar el contenido y analizar el tráfico del sitio. Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una. Sin embargo, algunas partes de nuestro sitio podrían no funcionar correctamente si desactivas las cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Derechos del Usuario
            </h2>
            <p className="mb-4">Dependiendo de la jurisdicción, el Usuario tiene derecho a:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Acceder:</strong>{" "}
                Solicitar una copia de la información personal que tenemos sobre ti.
              </li>
              <li>
                <strong className="text-white font-semibold">Rectificar:</strong>{" "}
                Solicitar la corrección de datos inexactos o incompletos.
              </li>
              <li>
                <strong className="text-white font-semibold">Eliminar:</strong>{" "}
                Solicitar la eliminación de tus datos personales, siempre que no debamos conservarlos por obligaciones legales.
              </li>
              <li>
                <strong className="text-white font-semibold">Oponerse/Restringir:</strong>{" "}
                Solicitar que limitemos o detengamos el procesamiento de tus datos para fines específicos.
              </li>
            </ul>
            <p className="mt-4">
              Para ejercer estos derechos, por favor contáctanos a través de los canales de atención al cliente dispuestos en nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Enlaces a Sitios Externos
            </h2>
            <p>
              Nuestro sitio web puede contener enlaces a otros sitios web (como redes sociales o sitios de terceros). No somos responsables de las prácticas de privacidad ni del contenido de dichos sitios. Te recomendamos leer la política de privacidad de cada sitio que visites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Cambios en la Política de Privacidad
            </h2>
            <p>
              Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. Cualquier cambio será publicado en esta sección, y la fecha de "Última actualización" será modificada. Te sugerimos revisar este documento periódicamente para estar al tanto de cómo protegemos tu información.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              Contacto
            </h2>
            <p>
              Si tienes preguntas o inquietudes sobre esta Política de Privacidad, no dudes en contactarnos a través de los medios oficiales publicados en www.boletos.la.
            </p>
          </section>
        </div>
      </div>
      <ParaguayFooter />
      <ScrollToTop />
    </main>
  );
}
