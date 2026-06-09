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
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm py-3"
            : "bg-white/95 border-b border-gray-50 py-4",
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
                  className="text-gray-600 hover:text-[#00c7cc] px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-gray-50"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Empty space in place of actions to keep spacing consistent with image */}
            <div className="max-lg:hidden lg:block w-[150px]" />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-full transition-all relative z-10"
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
            "lg:hidden absolute top-full left-0 w-full overflow-hidden transition-all duration-500 ease-in-out origin-top border-t border-gray-100 backdrop-blur-md bg-white/95 shadow-lg",
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
                className="text-gray-700 hover:text-[#00c7cc] text-lg font-medium py-3 border-b border-gray-50 transition-colors"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
