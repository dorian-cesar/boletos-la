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

            {/* Payment Methods */}
            <div className="mt-8">
              <h5 className="text-sm font-medium mb-3 text-white/80">
                Medios de Pago
              </h5>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-white/10 rounded text-xs font-medium">
                  Pagopar
                </div>
                <div className="px-3 py-2 bg-white/10 rounded text-xs font-medium">
                  Visa
                </div>
                <div className="px-3 py-2 bg-white/10 rounded text-xs font-medium">
                  Mastercard
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
