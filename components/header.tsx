"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-black text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a
              href="https://wa.me/595991224613?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre%20los%20servicios%20que%20ofrece%20www.boletos.la%20en%20Paraguay.%0A%0A%C2%BFPodr%C3%ADan%20asesorarme%3F%20Muchas%20gracias"
              className="flex items-center gap-2 hover:text-[#00c7cc] transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-[#00c7cc]" />
              +595 21 123 4567
            </a>
            <a
              href="mailto:contacto@boletos.la"
              className="flex items-center gap-2 hover:text-[#00c7cc] transition-colors"
            >
              <Mail className="h-4 w-4 text-[#00c7cc]" />
              contacto@boletos.la
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#00c7cc]" />
              Asunción, Paraguay
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-[#00c7cc] transition-colors">
              Ayuda
            </Link>
            <Link href="#" className="hover:text-[#00c7cc] transition-colors">
              Mis Reservas
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 bg-black",
          isScrolled ? "shadow-lg" : "",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la Logo"
                width={140}
                height={80}
                className="h-auto transition-transform duration-300 group-hover:scale-105 mb-1"
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className="text-white hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Inicio
              </Link>
              <Link
                href="#destinos"
                className="text-white hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Destinos
              </Link>
              <Link
                href="#servicios"
                className="text-white hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Servicios
              </Link>
              <Link
                href="#empresas"
                className="text-white hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Empresas
              </Link>
              <Link
                href="#contacto"
                className="text-white hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Contacto
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                className="border-[#00c7cc] text-[#00c7cc] hover:bg-[#00c7cc] hover:text-white transition-all duration-300 bg-transparent"
              >
                Mis Viajes
              </Button>
              <Button className="bg-[#ffaa00] hover:bg-[#ffaa00]/90 text-black transition-all duration-300 transform hover:scale-105">
                Reservar Pasaje
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[#00c7cc] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-black",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className="text-white hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Inicio
            </Link>
            <Link
              href="#destinos"
              className="text-white hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Destinos
            </Link>
            <Link
              href="#servicios"
              className="text-white hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Servicios
            </Link>
            <Link
              href="#empresas"
              className="text-white hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Empresas
            </Link>
            <Link
              href="#contacto"
              className="text-white hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Contacto
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                className="w-full border-[#00c7cc] text-[#00c7cc] bg-transparent"
              >
                Mis Viajes
              </Button>
              <Button className="w-full bg-[#ffaa00] text-black">
                Reservar Pasaje
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
