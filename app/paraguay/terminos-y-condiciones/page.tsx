"use client";

import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { ScrollToTop } from "@/components/scroll-to-top";

export default function TerminosYCondicionesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      <ParaguayHeader />
      
      {/* Background decorations matching the app's style */}
      <div className="absolute top-[120px] inset-x-0 h-[500px] bg-gradient-to-b from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute top-[120px] left-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
      
      {/* Bottom decorations */}
      <div className="absolute bottom-0 inset-x-0 h-[500px] bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50" />

      <div className="flex-1 pt-32 pb-20 container mx-auto px-4 max-w-4xl relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white">
          Términos y Condiciones de Uso
        </h1>
        <p className="text-primary font-medium mb-12">
          Última actualización: 11 de agosto de 2026
        </p>

        <div className="space-y-10 text-neutral-300 leading-relaxed text-[17px]">
          <div className="space-y-4">
            <p>
              Bienvenido a www.boletos.la (en adelante, el "Sitio Web"). Estos
              Términos y Condiciones regulan el acceso y uso de nuestro sitio web,
              así como la compra de entradas, tickets o accesos para eventos (en
              adelante, los "Servicios") ofrecidos a través de nuestra plataforma.
            </p>
            <p>
              Te pedimos que leas detenidamente este documento antes de utilizar el
              Sitio Web o adquirir cualquier producto. Al utilizar nuestros
              servicios, aceptas cumplir y estar sujeto a estos Términos y
              Condiciones. Si no estás de acuerdo con ellos, debes abstenerte de
              utilizar el sitio.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Identificación y Aceptación
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Titular del Sitio:</strong>{" "}
                www.boletos.la (en adelante, "la Empresa").
              </li>
              <li>
                <strong className="text-white font-semibold">Aceptación:</strong> La
                utilización del Sitio Web atribuye la condición de usuario (el
                "Usuario") e implica la aceptación plena y sin reservas de todas
                y cada una de las disposiciones incluidas en estos Términos y
                Condiciones desde el mismo momento en que se accede al sitio.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Capacidad Legal
            </h2>
            <p>
              Para utilizar los servicios de www.boletos.la, el Usuario debe ser
              mayor de edad con plena capacidad legal para contratar. Los menores
              de edad sólo podrán utilizar el sitio bajo la supervisión y
              autorización expresa de sus padres o tutores legales, quienes serán
              responsables de todos los actos realizados a través de la
              plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. Registro de Usuario y Seguridad
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Creación de Cuenta:</strong>{" "}
                Algunas funciones o compras en el Sitio Web pueden requerir el
                registro del Usuario mediante la creación de una cuenta y la
                provisión de datos personales (nombre, correo electrónico,
                contraseña, etc.).
              </li>
              <li>
                <strong className="text-white font-semibold">Confidencialidad:</strong> El
                Usuario es responsable de mantener la confidencialidad de los
                datos de su cuenta y contraseña, así como de restringir el
                acceso a su dispositivo.
              </li>
              <li>
                <strong className="text-white font-semibold">Responsabilidad:</strong> El
                Usuario acepta asumir la responsabilidad de todas las actividades
                que se realicen bajo su cuenta o contraseña.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Proceso de Compra de Boletos
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Disponibilidad:</strong> Todas
                las transacciones realizadas a través de www.boletos.la están
                sujetas a la disponibilidad de boletos para el evento
                correspondiente y a la verificación y aceptación del pago.
              </li>
              <li>
                <strong className="text-white font-semibold">Precios y Cargos:</strong> Los
                precios de los boletos se indican claramente en el Sitio Web e
                incluyen los impuestos aplicables, a menos que se especifique lo
                contrario. Podrán aplicarse cargos por servicio o gestión
                adicionales, los cuales se detallarán antes de finalizar la
                compra.
              </li>
              <li>
                <strong className="text-white font-semibold">Confirmación de Compra:</strong>{" "}
                Una vez procesada exitosamente la transacción, el Usuario recibirá
                una confirmación de compra por correo electrónico o a través de la
                plataforma, la cual incluirá el comprobante o boleto digital
                (código QR, PDF, etc.).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Política de Reembolsos, Cambios y Cancelaciones
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Venta Final:</strong> Salvo
                disposición legal en contrario o cancelación expresa del evento
                por parte del organizador, todas las ventas de boletos son
                definitivas. No se admiten cambios, devoluciones ni reembolsos
                por errores del usuario al seleccionar la fecha, el evento o la
                cantidad de entradas.
              </li>
              <li>
                <strong className="text-white font-semibold">
                  Cancelación o Reprogramación de Eventos:
                </strong>{" "}
                Si un evento es cancelado definitivamente, www.boletos.la
                gestionará el reembolso del valor nominal del boleto según las
                directrices del organizador del evento. Los cargos por servicio
                no son reembolsables, salvo que la normativa aplicable disponga lo
                contrario. Si el evento es postergado o reprogramado, los
                boletos adquiridos por lo general serán válidos para la nueva
                fecha establecida.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              6. Uso del Sitio Web y Conducta Prohibida
            </h2>
            <p className="mb-4">
              El Usuario se compromete a utilizar el Sitio Web de manera lícita.
              Queda estrictamente prohibido:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Utilizar la plataforma para fines fraudulentos o ilícitos.</li>
              <li>
                Intentar vulnerar la seguridad del sitio, realizar ataques de
                denegación de servicio (DoS) o extraer información automatizada
                (scraping) sin autorización.
              </li>
              <li>
                Revender boletos adquiridos en la plataforma a precios superiores
                a los originales o mediante canales no autorizados con fines
                especulativos (reventa ilegal o "scalping").
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              7. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido disponible en www.boletos.la, incluyendo textos,
              gráficos, logotipos, iconos, imágenes, clips de audio, descargas
              digitales y compilaciones de datos, es propiedad exclusiva de la
              Empresa o de sus proveedores de contenido y está protegido por las
              leyes de propiedad intelectual internacionales y locales. Queda
              prohibida su reproducción total o parcial sin autorización previa y
              por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              8. Limitación de Responsabilidad
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white font-semibold">Intermediación:</strong>{" "}
                www.boletos.la actúa en muchos casos como plataforma intermediaria
                de comercialización de entradas organizadas por terceros. La
                Empresa no se hace responsable por la calidad, contenido,
                seguridad, desarrollo o cambios de última hora de los eventos,
                siendo el organizador del evento el único responsable frente a
                los asistentes.
              </li>
              <li>
                <strong className="text-white font-semibold">Fallos Técnicos:</strong> La
                Empresa no garantiza la disponibilidad continua e ininterrumpida
                del Sitio Web y queda exonerada de cualquier responsabilidad por
                daños y perjuicios de toda naturaleza derivados de fallos
                técnicos, interrupciones o virus informáticos ajenos a su
                control.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              9. Privacidad y Protección de Datos
            </h2>
            <p>
              El tratamiento de los datos personales proporcionados por el Usuario
              se regirá por nuestra Política de Privacidad, la cual forma parte
              integral de estos Términos y Condiciones. Al utilizar el Sitio Web,
              el Usuario consiente el tratamiento de dicha información y garantiza
              que todos los datos facilitados son veraces y actualizados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              10. Modificaciones de los Términos y Condiciones
            </h2>
            <p>
              La Empresa se reserva el derecho de modificar, actualizar o cambiar
              estos Términos y Condiciones en cualquier momento. Las
              modificaciones entrarán en vigencia a partir de su publicación en el
              Sitio Web. Es responsabilidad del Usuario revisar periódicamente este
              documento para estar al tanto de cualquier cambio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              11. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos y Condiciones se rigen e interpretan de acuerdo con
              las leyes aplicables en el país de operación de la plataforma. Para
              cualquier controversia derivada de la interpretación o ejecución de
              los presentes términos, las partes se someterán a la jurisdicción de
              los tribunales competentes de la ciudad donde opera la Empresa,
              renunciando expresamente a cualquier otro fuero que pudiera
              corresponderles.
            </p>
          </section>
        </div>
      </div>
      <ParaguayFooter />
      <ScrollToTop />
    </main>
  );
}
