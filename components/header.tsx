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
      <div className="max-lg:hidden bg-black text-white py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a
              href="https://api.whatsapp.com/send/?phone=56973094079&text=Hola%2C+tengo+consultas+sobre+Boletos.la+&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-[#00c7cc] transition-colors"
            >
              <svg className="h-4 w-4 fill-current text-[#00c7cc]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.852.002-2.63-1.023-5.101-2.885-6.965C16.588 1.93 14.12 1.9 12.01 1.9c-5.44 0-9.866 4.418-9.87 9.852 0 1.92.5 3.79 1.447 5.391L2.59 21.408l4.057-1.254zm11.387-5.464c-.3-.149-1.786-.881-2.067-.983-.281-.103-.486-.154-.69.154-.205.309-.796.983-.977 1.187-.18.205-.36.23-.66.081-3.003-1.503-4.388-2.62-5.632-4.757-.26-.445.26-.413.743-1.378.1-.19.05-.36-.025-.51-.075-.15-.69-1.666-.945-2.28-.249-.599-.5-.518-.69-.528-.18-.01-.387-.01-.594-.01-.207 0-.543.078-.828.39-.285.31-1.088 1.065-1.088 2.599 0 1.533 1.115 3.016 1.271 3.221.155.205 2.193 3.35 5.31 4.697.74.32 1.32.51 1.77.653.74.237 1.42.203 1.955.123.597-.09 1.787-.73 2.036-1.436.25-.705.25-1.31.175-1.437-.075-.127-.275-.203-.575-.353z" />
              </svg>
              +56 9 7309 4079
            </a>
            <a
              href="mailto:contacto@boletos.la"
              className="flex items-center gap-2 hover:text-[#00c7cc] transition-colors"
            >
              <Mail className="h-4 w-4 text-[#00c7cc]" />
              contacto@boletos.la
            </a>
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
                style={{ width: "140px", height: "auto" }}
                className="transition-transform duration-300 group-hover:scale-105 mb-1"
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="max-lg:hidden lg:flex items-center gap-8">
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
            <div className="max-lg:hidden lg:flex items-center gap-4">
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
