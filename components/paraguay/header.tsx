"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Mail, MapPin, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function ParaguayHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isHome = pathname === "/paraguay";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.includes("#")) {
      const [, hash] = href.split("#");
      if (pathname === "/paraguay" || pathname === "/") {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `/paraguay#${hash}`);
        }
      }
    }
  };

  return (
    <>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-500 bg-background",
          isScrolled ? "shadow-lg" : "",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/paraguay" className="flex items-center gap-2 group">
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
                href="/paraguay"
                className="text-foreground hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Inicio
              </Link>
              <Link
                href="/paraguay#servicios"
                onClick={(e) => handleLinkClick(e, "/paraguay#servicios")}
                className="text-foreground hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Servicios
              </Link>
              <Link
                href="/paraguay#destinos"
                onClick={(e) => handleLinkClick(e, "/paraguay#destinos")}
                className="text-foreground hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
              >
                Destinos
              </Link>

                <Link
                href="/paraguay#contacto"
                onClick={(e) => handleLinkClick(e, "/paraguay#contacto")}
                  className="text-foreground hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Contacto
                </Link>
                <Link
                  href="/paraguay/ayuda"
                  className="text-foreground hover:text-[#00c7cc] transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#00c7cc] after:transition-all after:duration-300 hover:after:w-full"
                >
                  Ayuda
                </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <ThemeToggle />
              <Button
                onClick={() => (window.location.href = "/paraguay/mi-boleto")}
                className="bg-[#ffaa00] hover:bg-[#ffaa00]/90 text-black transition-all duration-300 transform hover:scale-105 border-0"
              >
                <Search className="h-4 w-4" />
                Buscá tu Boleto
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-[#00c7cc] transition-colors"
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
            "lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-background",
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              href="/paraguay"
              className="text-foreground hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Inicio
            </Link>
            <Link
              href="/paraguay#servicios"
              onClick={(e) => handleLinkClick(e, "/paraguay#servicios")}
              className="text-foreground hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Servicios
            </Link>
            <Link
              href="/paraguay#destinos"
              onClick={(e) => handleLinkClick(e, "/paraguay#destinos")}
              className="text-foreground hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Destinos
            </Link>

            <Link
              href="/paraguay#contacto"
              onClick={(e) => handleLinkClick(e, "/paraguay#contacto")}
              className="text-foreground hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Contacto
            </Link>
            <Link
              href="/paraguay/ayuda"
              className="text-foreground hover:text-[#00c7cc] transition-colors font-medium py-2"
            >
              Ayuda
            </Link>
            
            <div className="flex flex-col gap-2 pt-4 border-t border-black/10 dark:border-white/20">
              <div className="flex justify-end mb-2">
                <ThemeToggle />
              </div>
              <Button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.location.href = "/paraguay/mi-boleto";
                }}
                className="w-full bg-[#ffaa00] text-black border-0 hover:bg-[#ffaa00]/90"
              >
                <Search className="h-4 w-4" />
                Buscá tu Boleto
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
