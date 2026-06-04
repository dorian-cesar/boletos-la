"use client";

import Link from "next/link";
import {
  Facebook,
  Linkedin,
  Instagram,
  MapPin,
  MessageCircle,
  Mail,
  ArrowRight,
} from "lucide-react";
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

export function Footer() {
  return (
    <footer
      id="contacto"
      className="bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-white relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#00c7cc]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#ffaa00]/10 rounded-full blur-[100px]" />
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Recibe <span className="text-[#00c7cc]">ofertas exclusivas</span>
              </h3>
              <p className="text-white/60">
                Suscríbete y obtén descuentos especiales en tus próximos viajes.
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-3">
              <Input
                type="email"
                name="newsletter-subscribe-email"
                autoComplete="newsletter-email"
                placeholder="Tu correo electrónico"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 w-full lg:w-80"
              />
              <Button className="bg-[#ffaa00] hover:bg-[#ffaa00]/90 text-[#ffaa00]-foreground h-12 px-6">
                Suscribirse
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la Logo"
                width={140}
                height={80}
                style={{ width: "140px", height: "auto" }}
                className="transition-transform duration-300 hover:scale-105"
                loading="eager"
              />
            </Link>
            <p className="text-white/60 mb-6 leading-relaxed">
              Tu plataforma de confianza para reservar pasajes de bus en toda
              Latinoamérica. Viaja seguro, viaja con nosotros.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00c7cc] hover:text-[#00c7cc]-foreground transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-4">
              {[
                "Inicio",
                "Destinos",
                "Servicios",
                "Empresas",
                "Ofertas",
                "Blog",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#00c7cc] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinos */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">
              Destinos Populares
            </h4>
            <ul className="space-y-4">
              {[
                "Paraguay",
                "Colombia",
                "Brasil",
                "Argentina",
              ].map((city) => (
                <li key={city}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-[#00c7cc] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <MapPin className="h-4 w-4 text-[#00c7cc]/50 group-hover:text-[#00c7cc] transition-colors" />
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#00c7cc] mt-0.5" />
                <span className="text-white/60">
                  Boletos.la Headquarters
                  <br />
                  América Latina
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="h-5 w-5 fill-current text-[#00c7cc]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.885-6.965C16.588 1.93 14.12 1.9 12.01 1.9c-5.44 0-9.866 4.418-9.87 9.852 0 1.92.5 3.79 1.447 5.391L2.59 21.408l4.057-1.254zm11.387-5.464c-.3-.149-1.786-.881-2.067-.983-.281-.103-.486-.154-.69.154-.205.309-.796.983-.977 1.187-.18.205-.36.23-.66.081-3.003-1.503-4.388-2.62-5.632-4.757-.26-.445.26-.413.743-1.378.1-.19.05-.36-.025-.51-.075-.15-.69-1.666-.945-2.28-.249-.599-.5-.518-.69-.528-.18-.01-.387-.01-.594-.01-.207 0-.543.078-.828.39-.285.31-1.088 1.065-1.088 2.599 0 1.533 1.115 3.016 1.271 3.221.155.205 2.193 3.35 5.31 4.697.74.32 1.32.51 1.77.653.74.237 1.42.203 1.955.123.597-.09 1.787-.73 2.036-1.436.25-.705.25-1.31.175-1.437-.075-.127-.275-.203-.575-.353z" />
                </svg>
                <a
                  href="https://api.whatsapp.com/send/?phone=56973094079&text=Hola%2C+tengo+consultas+sobre+Boletos.la+&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-[#00c7cc] transition-colors"
                >
                  +56 9 7309 4079
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#00c7cc]" />
                <a
                  href="mailto:contacto@boletos.la"
                  className="text-white/60 hover:text-[#00c7cc] transition-colors"
                >
                  contacto@boletos.la
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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              {/* Maestro */}
              <div className="h-7 flex items-center">
                <svg viewBox="0 0 44 28" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#eb001b" />
                  <circle cx="30" cy="14" r="14" fill="#00a6ff" />
                  <path d="M22 2.52c3.2 2.7 5.2 6.8 5.2 11.48s-2 8.78-5.2 11.48c-3.2-2.7-5.2-6.8-5.2-11.48s2-8.78 5.2-11.48z" fill="#002d72" />
                </svg>
              </div>
              {/* Mastercard */}
              <div className="h-7 flex items-center">
                <svg viewBox="0 0 44 28" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#eb001b" />
                  <circle cx="30" cy="14" r="14" fill="#f79e1b" />
                  <path d="M22 2.52c3.2 2.7 5.2 6.8 5.2 11.48s-2 8.78-5.2 11.48c-3.2-2.7-5.2-6.8-5.2-11.48s2-8.78 5.2-11.48z" fill="#ff5f00" />
                </svg>
              </div>
              {/* VISA */}
              <div className="h-6 flex items-center">
                <svg fill="white" viewBox="0 0 24 24" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
                </svg>
              </div>
              {/* American Express */}
              <div className="h-7 flex items-center">
                <svg viewBox="0 0 24 24" className="h-7 w-auto" xmlns="http://www.w3.org/2000/svg">
                  <rect width="24" height="24" rx="3" fill="white" />
                  <path d="M16.015 14.378c0-.32-.135-.496-.344-.622-.21-.12-.464-.135-.81-.135h-1.543v2.82h.675v-1.027h.72c.24 0 .39.024.478.125.12.13.104.38.104.55v.35h.66v-.555c-.002-.25-.017-.376-.108-.516-.06-.08-.18-.18-.33-.234l.02-.008c.18-.072.48-.297.48-.747zm-.87.407l-.028-.002c-.09.053-.195.058-.33.058h-.81v-.63h.824c.12 0 .24 0 .33.05.098.048.156.147.15.255 0 .12-.045.215-.134.27zM20.297 15.837H19v.6h1.304c.676 0 1.05-.278 1.05-.884 0-.28-.066-.448-.187-.582-.153-.133-.392-.193-.73-.207l-.376-.015c-.104 0-.18 0-.255-.03-.09-.03-.15-.105-.15-.21 0-.09.017-.166.09-.21.083-.046.177-.066.272-.06h1.23v-.602h-1.35c-.704 0-.958.437-.958.84 0 .9.776.855 1.407.87.104 0 .18.015.225.06.046.03.082.106.082.18 0 .077-.035.15-.08.18-.06.053-.15.07-.277.07zM0 0v10.096L.81 8.22h1.75l.225.464V8.22h2.043l.45 1.02.437-1.013h6.502c.295 0 .56.057.756.236v-.23h1.787v.23c.307-.17.686-.23 1.12-.23h2.606l.24.466v-.466h1.918l.254.465v-.466h1.858v3.948H20.87l-.36-.6v.585h-2.353l-.256-.63h-.583l-.27.614h-1.213c-.48 0-.84-.104-1.08-.24v.24h-2.89v-.884c0-.12-.03-.12-.105-.135h-.105v1.036H6.067v-.48l-.21.48H4.69l-.202-.48v.465H2.235l-.256-.624H1.4l-.256.624H0V24h23.786v-7.108c-.27.135-.613.18-.973.18H21.09v-.255c-.21.165-.57.255-.914.255H14.71v-.9c0-.12-.018-.12-.12-.12h-.075v1.022h-1.8v-1.066c-.298.136-.643.15-.928.136h-.214v.915h-2.18l-.54-.617-.57.6H4.742v-3.93h3.61l.518.602.554-.6h2.412c.28 0 .74.03.942.225v-.24h2.177c.202 0 .644.045.903.225v-.24h3.265v.24c.163-.164.508-.24.803-.24h1.89v.24c.194-.15.464-.24.84-.24h1.176V0H0zM21.156 14.955c.004.005.006.012.01.016.01.01.024.01.032.02l-.042-.035zM23.828 13.082h.065v.555h-.065zM23.865 15.03v-.005c-.03-.025-.046-.048-.075-.07-.15-.153-.39-.215-.764-.225l-.36-.012c-.12 0-.194-.007-.27-.03-.09-.03-.15-.105-.15-.21 0-.09.03-.16.09-.204.076-.045.15-.05.27-.05h1.223v-.588h-1.283c-.69 0-.96.437-.96.84 0 .9.78.855 1.41.87.104 0 .18.015.224.06.046.03.076.106.076.18 0 .07-.034.138-.09.18-.045.056-.136.07-.27.07h-1.288v.605h1.287c.42 0 .734-.118.9-.36h.03c.09-.134.135-.3.135-.523 0-.24-.045-.39-.135-.526zM18.597 14.208v-.583h-2.235V16.458h2.235v-.585h-1.57v-.57h1.533v-.584h-1.532v-.51M13.51 8.787h.685V11.6h-.684zM13.126 9.543l-.007.006c0-.314-.13-.5-.34-.624-.217-.125-.47-.135-.81-.135H10.43v2.82h.674v-1.034h.72c.24 0 .39.03.487.12.122.136.107.378.107.548v.354h.677v-.553c0-.25-.016-.375-.11-.516-.09-.107-.202-.19-.33-.237.172-.07.472-.3.472-.75zm-.855.396h-.015c-.09.054-.195.056-.33.056H11.1v-.623h.825c.12 0 .24.004.33.05.09.04.15.128.15.25s-.047.22-.134.266zM15.92 9.373h.632v-.6h-.644c-.464 0-.804.105-1.02.33-.286.3-.362.69-.362 1.11 0 .512.123.833.36 1.074.232.238.645.31.97.31h.78l.255-.627h1.39l.262.627h1.36v-2.11l1.272 2.11h.95l.002.002V8.786h-.684v1.963l-1.18-1.96h-1.02V11.4L18.11 8.744h-1.004l-.943 2.22h-.3c-.177 0-.362-.03-.468-.134-.125-.15-.186-.36-.186-.662 0-.285.08-.51.194-.63.133-.135.272-.165.516-.165zm1.668-.108l.464 1.118v.002h-.93l.466-1.12zM2.38 10.97l.254.628H4V9.393l.972 2.205h.584l.973-2.202.015 2.202h.69v-2.81H6.118l-.807 1.904-.876-1.905H3.343v2.663L2.205 8.787h-.997L.01 11.597h.72l.26-.626h1.39zm-.688-1.705l.46 1.118-.003.002h-.915l.457-1.12zM11.856 13.62H9.714l-.85.923-.825-.922H5.346v2.82H8l.855-.932.824.93h1.302v-.94h.838c.6 0 1.17-.164 1.17-.945l-.006-.003c0-.78-.598-.93-1.128-.93zM7.67 15.853l-.014-.002H6.02v-.557h1.47v-.574H6.02v-.51H7.7l.733.82-.764.824zm2.642.33l-1.03-1.147 1.03-1.108v2.253zm1.553-1.258h-.885v-.717h.885c.24 0 .42.098.42.344 0 .243-.15.372-.42.372zM9.967 9.373v-.586H7.73V11.6h2.237v-.58H8.4v-.564h1.527V9.88H8.4v-.507" fill="#0173C2" />
                </svg>
              </div>
            </div>

            {/* Right: Security & Trust Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-8">
              {/* Google Safe Browsing */}
              <div className="flex items-center gap-2 select-none">
                <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2C24.5 4.5 30 7.5 30 11.5C30 20.5 24.5 28.5 18 33C11.5 28.5 6 20.5 6 11.5C6 7.5 11.5 4.5 18 2Z" fill="#34A853" />
                  <circle cx="18" cy="17" r="6.5" fill="white" />
                  <circle cx="18" cy="15.5" r="3" fill="#34A853" />
                  <path d="M15.5 15.5H20.5L19.5 21.5H16.5L15.5 15.5Z" fill="#34A853" />
                  <circle cx="18" cy="15.5" r="1.5" fill="white" />
                  <path d="M18 17V20.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center text-[17px] font-bold tracking-tight">
                    <span className="text-[#4285F4]">G</span>
                    <span className="text-[#EA4335]">o</span>
                    <span className="text-[#FBBC05]">o</span>
                    <span className="text-[#4285F4]">g</span>
                    <span className="text-[#34A853]">l</span>
                    <span className="text-[#EA4335]">e</span>
                  </div>
                  <span className="text-[10px] font-medium text-white/60 whitespace-nowrap">Safe browsing</span>
                </div>
              </div>

              {/* SSL 100% Secure Purchase */}
              <div className="flex items-center gap-2 select-none">
                <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2C24.5 4.5 30 7.5 30 11.5C30 20.5 24.5 28.5 18 33C11.5 28.5 6 20.5 6 11.5C6 7.5 11.5 4.5 18 2Z" fill="#10B981" />
                  <g transform="translate(0, 1)">
                    <text x="18" y="14" fill="white" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">SSL</text>
                    <rect x="13.5" y="17" width="9" height="6.5" rx="1.2" fill="white" />
                    <path d="M15.5 17V15.5C15.5 14.1 16.6 13 18 13C19.4 13 20.5 14.1 20.5 15.5V17" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                  </g>
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="text-[17px] font-bold text-white tracking-tight">100%</span>
                  <span className="text-[10px] font-medium text-white/60 whitespace-nowrap">Secure purchase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Año + logo */}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <Image
                src="/logos/logo-boletos-blanco.png"
                alt="Boletos.la"
                width={90}
                height={24}
                style={{ width: "90px", height: "auto" }}
                className="opacity-70 mb-1"
              />
              {/* <span>{new Date().getFullYear()}</span> */}
              <span>|</span>
              <span>Todos los derechos reservados.</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#"
                className="text-white/50 hover:text-[#00c7cc] transition-colors"
              >
                Términos y Condiciones
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-[#00c7cc] transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-white/50 hover:text-[#00c7cc] transition-colors"
              >
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
