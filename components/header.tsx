"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Ticket, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500",
          isScrolled
            ? "bg-[#0a0d14]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3"
            : "bg-[#0a0d14] border-b border-white/5 py-5",
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group relative z-10">
              <Image
                src="/logos/logo-boletos.png"
                alt="Boletos.la Logo"
                width={150}
                height={85}
                style={{ width: "auto", height: "40px" }}
                className="transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="max-lg:hidden lg:flex items-center gap-1">
              {[
                { name: "Inicio", href: "/" },
                { name: "Destinos", href: "#destinos" },
                { name: "Servicios", href: "#servicios" },
                { name: "Empresas", href: "#empresas" },
                { name: "Contacto", href: "#contacto" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white/70 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-white/5"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="max-lg:hidden lg:flex items-center gap-4 relative z-10">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-5 font-medium transition-all duration-300"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Mis Viajes
              </Button>
              <Button className="bg-gradient-to-r from-[#ffaa00] to-[#ff7b00] hover:from-[#ffb733] hover:to-[#ff8c1a] text-black font-bold rounded-full px-7 shadow-lg shadow-[#ffaa00]/20 hover:shadow-[#ffaa00]/40 transition-all duration-300 transform hover:-translate-y-0.5">
                <Calendar className="w-4 h-4 mr-2" />
                Reservar Pasaje
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all relative z-10"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "lg:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out origin-top border-t border-white/10 backdrop-blur-xl bg-[#0a0d14]/95 shadow-2xl",
            isMobileMenuOpen ? "max-h-[500px] opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0",
          )}
        >
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {[
              { name: "Inicio", href: "/" },
              { name: "Destinos", href: "#destinos" },
              { name: "Servicios", href: "#servicios" },
              { name: "Empresas", href: "#empresas" },
              { name: "Contacto", href: "#contacto" },
            ].map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-[#00c7cc] text-lg font-medium py-3 border-b border-white/5 transition-colors"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="flex flex-col gap-3 pt-4 mt-2">
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl h-12 text-base"
              >
                <Ticket className="w-5 h-5 mr-2" />
                Mis Viajes
              </Button>
              <Button className="w-full bg-gradient-to-r from-[#ffaa00] to-[#ff7b00] text-black font-bold rounded-xl h-12 text-base shadow-lg shadow-[#ffaa00]/20">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Pasaje
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
