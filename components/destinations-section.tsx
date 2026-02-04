'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, MapPin, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const destinations = [
  {
    id: 1,
    name: 'Santiago',
    region: 'Metropolitana',
    image: '/images/santiago.jpg',
    price: 8500,
    duration: '0h base',
    rating: 4.9,
    popular: true,
  },
  {
    id: 2,
    name: 'Valparaíso',
    region: 'Valparaíso',
    image: '/images/valparaiso.jpg',
    price: 5200,
    duration: '1h 30min',
    rating: 4.8,
    popular: true,
  },
  {
    id: 3,
    name: 'Viña del Mar',
    region: 'Valparaíso',
    image: '/images/vina-del-mar.jpg',
    price: 5500,
    duration: '1h 45min',
    rating: 4.9,
    popular: true,
  },
  {
    id: 4,
    name: 'Concepción',
    region: 'Biobío',
    image: '/images/concepcion.jpg',
    price: 15000,
    duration: '5h 30min',
    rating: 4.7,
    popular: false,
  },
  {
    id: 5,
    name: 'La Serena',
    region: 'Coquimbo',
    image: '/images/la-serena.jpg',
    price: 12000,
    duration: '6h',
    rating: 4.8,
    popular: false,
  },
  {
    id: 6,
    name: 'Puerto Montt',
    region: 'Los Lagos',
    image: '/images/puerto-montt.jpg',
    price: 25000,
    duration: '12h',
    rating: 4.6,
    popular: false,
  },
]

export function DestinationsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="destinos" className="py-24 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span 
              className={cn(
                "inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4 transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              Destinos Populares
            </span>
            <h2 
              className={cn(
                "text-3xl md:text-5xl font-bold text-foreground mb-4 transition-all duration-700 delay-100",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              <span className="text-balance">Explora </span>
              <span className="text-secondary">Chile</span>
            </h2>
            <p 
              className={cn(
                "text-lg text-muted-foreground max-w-xl transition-all duration-700 delay-200",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              Descubre los destinos más visitados y planifica tu próximo viaje.
            </p>
          </div>
          <Button 
            variant="outline" 
            className={cn(
              "mt-6 md:mt-0 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all duration-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
            style={{ transitionDelay: '300ms' }}
          >
            Ver todos los destinos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className={cn(
                "group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                index < 3 ? 'lg:h-96' : 'h-80'
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Image with enhanced effects */}
              <div className="absolute inset-0">
                <img
                  src={destination.image || "/placeholder.svg"}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                {/* Multi-layer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a2332] via-[#1a2332]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              {/* Popular Badge */}
              {destination.popular && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold rounded-full">
                  Popular
                </div>
              )}

              {/* Rating */}
              <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm rounded-full">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                <span className="text-sm font-medium">{destination.rating}</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-background/70 text-sm mb-2">
                      <MapPin className="h-4 w-4" />
                      {destination.region}
                    </div>
                    <h3 className="text-2xl font-bold text-background mb-2 group-hover:text-primary transition-colors duration-300">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-4 text-background/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {destination.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-background/70">Desde</p>
                    <p className="text-2xl font-bold text-secondary">
                      ${destination.price.toLocaleString('es-CL')}
                    </p>
                  </div>
                </div>

                {/* Hover Button */}
                <div className="mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Ver Servicios
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
