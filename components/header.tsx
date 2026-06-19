"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  country?: string;
}

export function Header({ country }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

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
            ? "bg-[#1a1a1a]/95 backdrop-blur-md shadow-sm py-3"
            : "bg-[#1a1a1a] py-4",
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href={country && country.toLowerCase() !== "latam" ? `/${country.toLowerCase()}` : "/"}
              className="flex items-center gap-2 group relative z-10"
            >
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
            {/* <nav className="max-lg:hidden lg:flex items-center gap-1">
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
                  className="text-neutral-300 hover:text-[#00c7cc] px-4 py-2 rounded-full text-lg lg:text-xl font-bold transition-all duration-300 hover:bg-neutral-800/50 no-underline"
                >
                  {item.name}
                </Link>
              ))}
            </nav> */}

            {/* Empty space in place of actions to keep spacing consistent with image */}
            <div className="max-lg:hidden lg:block w-[150px]" />
          </div>
        </div>
      </header>
    </>
  );
}
