"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

export function ParaguayFooter() {
  const pathname = usePathname();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const [, hash] = href.split("#");
      if (pathname === "/paraguay" || pathname === "/") {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `/paraguay#${hash}`);
        }
      }
    }
  };

  return (
    <footer
      id="contacto"
      className="bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] text-slate-900 dark:text-white relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {/* Newsletter Section */}
      <div className="border-b border-black/10 dark:border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Recibí <span className="text-primary">ofertas exclusivas</span>
              </h3>
              <p className="text-slate-900 dark:text-white/60">
                Suscríbete y obtén descuentos especiales en tus próximos viajes.
              </p>
            </div>
            <div className="flex w-full lg:w-auto gap-3">
              <Input
                type="email"
                name="newsletter-subscribe-email"
                autoComplete="newsletter-email"
                placeholder="Tu correo electrónico"
                className="bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/50 h-12 w-full lg:w-80"
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
            <Link href="/paraguay" className="inline-block mb-6">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la Logo"
                width={140}
                height={80}
                className="h-auto transition-transform duration-300 group-hover:scale-105 mb-1"
                loading="eager"
              />
            </Link>
            <p className="text-slate-900 dark:text-white/60 mb-6 leading-relaxed">
              Tu plataforma de confianza para reservar boletos de bus en todo
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
                    className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Inicio", href: "/paraguay" },
                { name: "Destinos", href: "/paraguay#destinos" },
                { name: "Servicios", href: "/paraguay#servicios" },
                { name: "Empresas", href: "/paraguay#empresas" },
                { name: "Ofertas", href: "/paraguay#ofertas" },
                { name: "Blog", href: "/paraguay/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-slate-900 dark:text-white/60 hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinos */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">
              Destinos Populares
            </h4>
            <ul className="space-y-4">
              {[
                "Azotey",
                "Ciudad del Este",
                "Caacupé",
                "Pedro Juan Caballero",
                "Coronel Oviedo",
                "Ypacaraí",
              ].map((city) => (
                <li key={city}>
                  <Link
                    href="/paraguay#destinos"
                    onClick={(e) => handleLinkClick(e, "/paraguay#destinos")}
                    className="text-slate-900 dark:text-white/60 hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <MapPin className="h-4 w-4 text-primary/50 group-hover:text-primary transition-colors" />
                    {city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-slate-900 dark:text-white/60">
                  Av. Aviadores del Chaco 3207
                  <br />
                  Edificio Trading Park
                  <br />
                  Asunción, Paraguay
                </span>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-primary" />
                <a
                  href="https://wa.me/595991224613?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20los%20servicios%20que%20ofrece%20www.boletos.la%20en%20Paraguay.%0A%0A%C2%BFPodr%C3%ADan%20asesorarme%3F%20Muchas%20gracias"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 dark:text-white/60 hover:text-primary transition-colors"
                >
                  +595 991 224613
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:contacto@boletos.la"
                  className="text-slate-900 dark:text-white/60 hover:text-primary transition-colors"
                >
                  contacto@boletos.la
                </a>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-8">
              <h5 className="text-sm font-medium mb-3 text-slate-900 dark:text-white/80">
                Medios de Pago
              </h5>
              <div className="flex items-center">
                <Image
                  src="/logos/logo-bancard-blanco.png"
                  alt="Bancard"
                  width={110}
                  height={30}
                  className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity object-contain brightness-0 dark:brightness-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-black/10 dark:border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Año + logo */}
            <div className="flex items-center gap-2 text-slate-900 dark:text-white/50 text-sm">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la"
                width={90}
                height={24}
                className="opacity-70 mb-1 brightness-0 dark:brightness-100 dark:invert-0"
              />
              {/* <span>{new Date().getFullYear()}</span> */}
              <span>|</span>
              <span>Todos los derechos reservados.</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/paraguay/bases-promocion"
                className="text-slate-900 dark:text-white/50 hover:text-primary transition-colors font-medium text-primary/80 dark:text-primary/70"
              >
                Bases y Condiciones Travel Sale
              </Link>
              <Link
                href="/paraguay/terminos-y-condiciones"
                className="text-slate-900 dark:text-white/50 hover:text-primary transition-colors"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="/paraguay/politica-de-privacidad"
                className="text-slate-900 dark:text-white/50 hover:text-primary transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/paraguay/ayuda"
                className="text-slate-900 dark:text-white/50 hover:text-primary transition-colors"
              >
                Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
