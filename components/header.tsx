'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-foreground text-background py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary" />
              +56 2 2345 6789
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-secondary" />
              contacto@boletos.la
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" />
              Santiago, Chile
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Ayuda</Link>
            <Link href="#" className="hover:text-primary transition-colors">Mis Reservas</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-500',
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-lg' 
            : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl font-bold tracking-tight">
                <span className="text-primary transition-all duration-300 group-hover:text-primary/80">bol</span>
                <span className="text-secondary transition-all duration-300 group-hover:text-secondary/80">e</span>
                <span className="text-primary transition-all duration-300 group-hover:text-primary/80">tos</span>
                <span className="text-secondary transition-all duration-300 group-hover:text-secondary/80">.la</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                href="/" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Inicio
              </Link>
              <Link 
                href="#destinos" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Destinos
              </Link>
              <Link 
                href="#servicios" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Servicios
              </Link>
              <Link 
                href="#empresas" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Empresas
              </Link>
              <Link 
                href="#contacto" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              >
                Contacto
              </Link>
            </nav>

            {/* CTA Button */}
            <div className="hidden lg:flex items-center gap-4">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 bg-transparent"
              >
                Mis Viajes
              </Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 transform hover:scale-105"
              >
                Reservar Ahora
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-500 ease-in-out bg-background',
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-medium py-2">
              Inicio
            </Link>
            <Link href="#destinos" className="text-foreground hover:text-primary transition-colors font-medium py-2">
              Destinos
            </Link>
            <Link href="#servicios" className="text-foreground hover:text-primary transition-colors font-medium py-2">
              Servicios
            </Link>
            <Link href="#empresas" className="text-foreground hover:text-primary transition-colors font-medium py-2">
              Empresas
            </Link>
            <Link href="#contacto" className="text-foreground hover:text-primary transition-colors font-medium py-2">
              Contacto
            </Link>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button variant="outline" className="w-full border-primary text-primary bg-transparent">
                Mis Viajes
              </Button>
              <Button className="w-full bg-secondary text-secondary-foreground">
                Reservar Ahora
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  )
}
