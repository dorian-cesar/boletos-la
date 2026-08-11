"use client";

import Link from "next/link";
import { Facebook, Linkedin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/boletos.latam",
    label: "Facebook",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/boletos.la.py",
    label: "Instagram",
  },
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/in/boletoslatam",
    label: "LinkedIn",
  },
];

interface FooterProps {
  country?: string;
}

export function Footer({ country }: FooterProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const baseSloganES = (
    <>
      Tu ruta completa por América Latina,
      <br />
      todo en un mismo lugar.
      <br />
      <br />
      En boletos.la conectamos ciudades y destinos combinando viajes en autobús y alojamiento.
    </>
  );

  const basePatagoniaES = (
    <>
      Desde la Patagonia hasta el Caribe,
      <br />
      nosotros trazamos la ruta.
      <br />
      Tú eliges el camino.
    </>
  );

  const footerTranslations: Record<string, any> = {
    brasil: {
      slogan: (
        <>
          Sua rota completa pela América Latina,
          <br />
          tudo em um só lugar.
          <br />
          <br />
          Na boletos.la, conectamos cidades e destinos combinando ônibus e hospedagem.
        </>
      ),
      compareTitle: "Compare opções: ",
      compareDesc: "Veja horários e preços de viagens em tempo real de centenas de operadoras.",
      routesTitle: "Roteiros porta a porta: ",
      routesDesc: "Criamos seu itinerário exato do início ao fim.",
      reserveTitle: "Reserva fácil: ",
      reserveDesc: "Links diretos para bilheterias oficiais para uma viagem sem complicações.",
      patagonia: (
        <>
          Da Patagônia ao Caribe,
          <br />
          nós traçamos a rota.
          <br />
          Você escolhe o caminho.
        </>
      ),
      col1Title: "DESCUBRA",
      col1Links: ["Hotéis", "Rodoviárias", "Guias de viagem", "Blog"],
      col2Title: "BOLETOS.LA",
      col2Links: ["Sobre nós", "Imprensa", "Trabalhe conosco", "Ajuda", "Contato"],
      gateways: ["Google Pay", "Apple Pay", "Pix"],
    },
    colombia: {
      slogan: baseSloganES,
      compareTitle: "Compara opciones: ",
      compareDesc: "consulta horarios y precios en tiempo real de cientos de operadores.",
      routesTitle: "Itinerarios puerta a puerta: ",
      routesDesc: "diseñamos tu ruta exacta de principio a fin.",
      reserveTitle: "Reserva sencilla: ",
      reserveDesc: "enlaces directos a puntos de venta oficiales para un viaje sin complicaciones.",
      patagonia: basePatagoniaES,
      col1Title: "DESCUBRE",
      col1Links: ["Hoteles", "Terminales", "Guías de viaje", "Blog"],
      col2Title: "BOLETOS.LA",
      col2Links: ["Sobre nosotros", "Prensa", "Trabaja con nosotros", "Ayuda", "Contacto"],
      gateways: ["Google Pay", "Apple Pay", "PSE", "Nequi", "Daviplata"],
    },
    chile: {
      slogan: baseSloganES,
      compareTitle: "Compara opciones: ",
      compareDesc: "consulta horarios y precios en tiempo real de cientos de operadores.",
      routesTitle: "Itinerarios puerta a puerta: ",
      routesDesc: "diseñamos tu ruta exacta de principio a fin.",
      reserveTitle: "Reserva sencilla: ",
      reserveDesc: "enlaces directos a puntos de venta oficiales para un viaje sin complicaciones.",
      patagonia: basePatagoniaES,
      col1Title: "DESCUBRE",
      col1Links: ["Hoteles", "Terminales", "Guías de viaje", "Blog"],
      col2Title: "BOLETOS.LA",
      col2Links: ["Sobre nosotros", "Prensa", "Trabaja con nosotros", "Ayuda", "Contacto"],
      gateways: ["Google Pay", "Apple Pay", "Webpay", "Transbank"],
    },
    paraguay: {
      slogan: baseSloganES,
      compareTitle: "Compara opciones: ",
      compareDesc: "consulta horarios y precios en tiempo real de cientos de operadores.",
      routesTitle: "Itinerarios puerta a puerta: ",
      routesDesc: "diseñamos tu ruta exacta de principio a fin.",
      reserveTitle: "Reserva sencilla: ",
      reserveDesc: "enlaces directos a puntos de venta oficiales para un viaje sin complicaciones.",
      patagonia: basePatagoniaES,
      col1Title: "DESCUBRE",
      col1Links: ["Hoteles", "Terminales", "Guías de viaje", "Blog"],
      col2Title: "BOLETOS.LA",
      col2Links: ["Sobre nosotros", "Prensa", "Trabaja con nosotros", "Ayuda", "Contacto"],
      gateways: ["Google Pay", "Apple Pay", "Bancard", "Pago Móvil"],
      showSelectors: true,
    },
    default: {
      slogan: baseSloganES,
      compareTitle: "Compara opciones: ",
      compareDesc: "consulta horarios y precios en tiempo real de cientos de operadores.",
      routesTitle: "Itinerarios puerta a puerta: ",
      routesDesc: "diseñamos tu ruta exacta de principio a fin.",
      reserveTitle: "Reserva sencilla: ",
      reserveDesc: "enlaces directos a puntos de venta oficiales para un viaje sin complicaciones.",
      patagonia: basePatagoniaES,
      col1Title: "DESCUBRE",
      col1Links: ["Hoteles", "Terminales", "Guías de viaje", "Blog"],
      col2Title: "BOLETOS.LA",
      col2Links: ["Sobre nosotros", "Prensa", "Trabaja con nosotros", "Ayuda", "Contacto"],
      gateways: ["Google Pay", "Apple Pay", "Visa", "Mastercard"],
    }
  };

  const currentFooter = footerTranslations[normalizedCountry] || footerTranslations.default;

  return (
    <footer
      id="contacto"
      className="bg-[#1a1a1a] text-white pt-16 relative overflow-hidden border-t border-neutral-800"
    >
      <div className="container mx-auto px-4 max-w-[1440px] relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-6">
            <Link href={country && country.toLowerCase() !== "latam" ? `/${country.toLowerCase()}` : "/"} className="inline-block">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la Logo"
                width={150}
                height={80}
                className="transition-transform duration-300 hover:scale-105 brightness-0 invert"
                loading="eager"
              />
            </Link>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              {currentFooter.col1Title}
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              {currentFooter.col1Links.map((link: string, idx: number) => (
                <li key={idx}>
                  <a href="#" className="hover:text-white transition-colors no-underline">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links Column */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-300">
              {currentFooter.col2Title}
            </h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              {currentFooter.col2Links.map((link: string, idx: number) => (
                <li key={idx}>
                  <Link href="#" className="hover:text-white transition-colors no-underline">
                    {link}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/terminos-y-condiciones" className="hover:text-white transition-colors no-underline">
                  Términos y condiciones
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust & Payment Badges Bar */}
      <div className="py-6 border-t border-white/10 relative z-10 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left: Payment Logos */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {currentFooter.gateways.map((gateway: string, idx: number) => {
                const gatewayMap: Record<string, string> = {
                  "Google Pay": "/images/payment-methods/google-pay.png",
                  "Apple Pay": "/images/payment-methods/apple-pay.png",
                  "PSE": "/images/payment-methods/pse.png",
                  "Nequi": "/images/payment-methods/nequi.png",
                  "Daviplata": "/images/payment-methods/daviplata.png",
                  "Pix": "/images/payment-methods/pix.png",
                  "Webpay": "/images/payment-methods/webpay.png",
                  "Transbank": "/images/payment-methods/transbank.png",
                  "Bancard": "/images/payment-methods/bancard.png",
                  "Pago Móvil": "/images/payment-methods/pago-movil.jpg"
                };

                const logoSrc = gatewayMap[gateway];

                if (logoSrc) {
                  return (
                    <div key={idx} className="h-8 bg-white rounded flex items-center justify-center px-2">
                      <div className="relative h-5 w-14">
                        <Image src={logoSrc} alt={gateway} fill className="object-contain" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="h-8 px-3 border border-white/20 rounded flex items-center bg-white/5 text-xs font-semibold whitespace-nowrap text-white">
                    {gateway}
                  </div>
                );
              })}
            </div>

            {/* Right: Security & Trust Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-8">
              {/* Google Safe Browsing */}
              <div className="flex items-center gap-2 select-none">
                <svg
                  className="w-[37.8px] h-[37.8px]"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 2C24.5 4.5 30 7.5 30 11.5C30 20.5 24.5 28.5 18 33C11.5 28.5 6 20.5 6 11.5C6 7.5 11.5 4.5 18 2Z"
                    fill="#34A853"
                  />
                  <circle cx="18" cy="17" r="6.5" fill="white" />
                  <circle cx="18" cy="15.5" r="3" fill="#34A853" />
                  <path
                    d="M15.5 15.5H20.5L19.5 21.5H16.5L15.5 15.5Z"
                    fill="#34A853"
                  />
                  <circle cx="18" cy="15.5" r="1.5" fill="white" />
                  <path
                    d="M18 17V20.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center text-[19.85px] font-bold tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </div>
                  <span className="text-[12.5px] font-medium text-white/60 whitespace-nowrap">
                    Safe browsing
                  </span>
                </div>
              </div>

              {/* SSL 100% Secure Purchase */}
              <div className="flex items-center gap-2 select-none">
                <svg
                  className="w-[37.8px] h-[37.8px]"
                  viewBox="0 0 36 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 2C24.5 4.5 30 7.5 30 11.5C30 20.5 24.5 28.5 18 33C11.5 28.5 6 20.5 6 11.5C6 7.5 11.5 4.5 18 2Z"
                    fill="#10B981"
                  />
                  <g transform="translate(0, 1)">
                    <text
                      x="18"
                      y="14"
                      fill="white"
                      fontSize="6"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      SSL
                    </text>
                    <rect
                      x="13.5"
                      y="17"
                      width="9"
                      height="6.5"
                      rx="1.2"
                      fill="white"
                    />
                    <path
                      d="M15.5 17V15.5C15.5 14.1 16.6 13 18 13C19.4 13 20.5 14.1 20.5 15.5V17"
                      stroke="white"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="text-[19.85px] font-bold text-white tracking-tight">
                    100%
                  </span>
                  <span className="text-[12.5px] font-medium text-white/60 whitespace-nowrap">
                    Secure purchase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 max-w-[1440px] py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Año + logo */}
            <div className="flex items-center gap-4 text-white/50 text-sm">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la"
                width={90}
                height={24}
                className="object-contain"
              />
              <span className="hidden md:inline">|</span>
              <span>Todos los derechos reservados.</span>
            </div>
            {currentFooter.showSelectors && (
              <div className="flex items-center gap-4 text-white/60 text-sm">
                <button className="hover:text-white transition-colors">Convertidor de Monedas</button>
                <span>|</span>
                <button className="hover:text-white transition-colors flex items-center gap-2">
                  País: Paraguay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
