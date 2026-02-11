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
      className="bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-background/10 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Recibe <span className="text-primary">ofertas exclusivas</span>
              </h3>
              <p className="text-background/60">
                Suscríbete y obtén descuentos especiales en tus próximos viajes.
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-3">
              <Input
                type="email"
                name="newsletter-subscribe-email"
                autoComplete="newsletter-email"
                placeholder="Tu correo electrónico"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50 h-12 w-full lg:w-80"
              />
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-6">
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
                className="transition-transform duration-300 hover:scale-105"
                loading="eager"
              />
            </Link>
            <p className="text-background/60 mb-6 leading-relaxed">
              Tu plataforma de confianza para reservar pasajes de bus en todo
              Paraguay. Viaja seguro, viaja con nosotros.
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
                    className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-background">
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
                    className="text-background/60 hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
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
            <h4 className="text-lg font-bold mb-6 text-background">
              Destinos Populares
            </h4>
            <ul className="space-y-4">
              {[
                "Asunción",
                "Ciudad del Este",
                "Encarnación",
                "Pedro Juan Caballero",
                "Coronel Oviedo",
                "Salto del Guairá",
              ].map((city) => (
                <li key={city}>
                  <a
                    href="#"
                    className="text-background/60 hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <MapPin className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
                    {city}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-background">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-background/60">
                  Av. Mariscal López 1234
                  <br />
                  Asunción, Paraguay
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <a
                  href="https://wa.me/595991224613?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20los%20servicios%20que%20ofrece%20www.boletos.la%20en%20Paraguay.%0A%0A%C2%BFPodr%C3%ADan%20asesorarme%3F%20Muchas%20gracias"
                  className="text-background/60 hover:text-primary transition-colors"
                >
                  +595 991 224613
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:contacto@boletos.la"
                  className="text-background/60 hover:text-primary transition-colors"
                >
                  contacto@boletos.la
                </a>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-8">
              <h5 className="text-sm font-medium mb-3 text-background/80">
                Medios de Pago
              </h5>
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-background/10 rounded text-xs font-medium">
                  Pagopar
                </div>
                <div className="px-3 py-2 bg-background/10 rounded text-xs font-medium">
                  Visa
                </div>
                <div className="px-3 py-2 bg-background/10 rounded text-xs font-medium">
                  Mastercard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Año + logo */}
            <div className="flex items-center gap-2 text-background/50 text-sm">
              <Image
                src="/logos/logo-boletos-blanco.png"
                alt="Boletos.la"
                width={90}
                height={24}
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
                className="text-background/50 hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </a>
              <a
                href="#"
                className="text-background/50 hover:text-primary transition-colors"
              >
                Política de Privacidad
              </a>
              <a
                href="#"
                className="text-background/50 hover:text-primary transition-colors"
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
