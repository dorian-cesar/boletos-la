'use client'

import { useEffect, useRef, useState } from 'react'
import { Shield, CreditCard, Clock, Headphones, MapPin, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Shield,
    title: 'Pago 100% Seguro',
    description: 'Transacciones protegidas con Webpay Plus y encriptación SSL.',
    color: 'primary',
  },
  {
    icon: CreditCard,
    title: 'Múltiples Medios de Pago',
    description: 'Paga con tarjeta de crédito, débito o transferencia bancaria.',
    color: 'secondary',
  },
  {
    icon: Clock,
    title: 'Reserva Instantánea',
    description: 'Confirma tu viaje en segundos y recibe tu boleto al instante.',
    color: 'primary',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Atención al cliente disponible todo el día, todos los días.',
    color: 'secondary',
  },
  {
    icon: MapPin,
    title: 'Cobertura Nacional',
    description: 'Más de 500 destinos en todo Chile para que viajes donde quieras.',
    color: 'primary',
  },
  {
    icon: Ticket,
    title: 'Boleto Digital',
    description: 'Recibe tu boleto en PDF por correo electrónico inmediatamente.',
    color: 'secondary',
  },
]

export function FeaturesSection() {
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
    <section ref={sectionRef} id="servicios" className="py-24 bg-gradient-to-br from-muted/50 via-background to-muted/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-20 right-10 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className={cn(
              "inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            Por qué elegirnos
          </span>
          <h2 
            className={cn(
              "text-3xl md:text-5xl font-bold text-foreground mb-4 transition-all duration-700 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            <span className="text-balance">Viaja con </span>
            <span className="text-primary">confianza</span>
          </h2>
          <p 
            className={cn(
              "text-lg text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}
          >
            Ofrecemos la mejor experiencia en reserva de pasajes de bus con todas las garantías que necesitas.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative bg-background rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div 
                className={cn(
                  "relative w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                  feature.color === 'primary' 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-secondary/10 text-secondary'
                )}
              >
                <feature.icon className="h-8 w-8" />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="relative text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Bottom Line */}
              <div 
                className={cn(
                  "absolute bottom-0 left-8 right-8 h-1 rounded-full transition-all duration-500 group-hover:left-0 group-hover:right-0",
                  feature.color === 'primary' ? 'bg-primary' : 'bg-secondary',
                  "opacity-0 group-hover:opacity-100"
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
