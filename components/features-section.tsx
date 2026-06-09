import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Globe, LucideIcon } from "lucide-react";

interface StepItem {
  iconPath?: string;
  icon?: LucideIcon;
  target?: number;
  suffix?: string;
  staticValue?: string;
  useSeparator?: boolean;
  label: string;
  sublabel: string;
  colorClass: string;
}

const steps: StepItem[] = [
  {
    iconPath: "/images/iconos-web/icono-web-1.png",
    target: 40,
    suffix: " +",
    label: "EMPRESAS",
    sublabel: "Más opciones de ruta",
    colorClass: "bg-[#eb5b24]",
  },
  {
    iconPath: "/images/iconos-web/icono-web-3.png",
    target: 200,
    suffix: "",
    label: "DESTINOS",
    sublabel: "Amplia cobertura",
    colorClass: "bg-[#00c7cc]",
  },
  {
    iconPath: "/images/iconos-web/icono-web-2.png",
    target: 500000,
    suffix: "",
    useSeparator: true,
    label: "VIAJEROS",
    sublabel: "Satisfechos",
    colorClass: "bg-[#e5a924]",
  },
  {
    icon: Globe,
    target: 12,
    suffix: "",
    label: "PAÍSES",
    sublabel: "Cobertura regional",
    colorClass: "bg-[#7c3aed]",
  },
  {
    iconPath: "/images/iconos-web/icono-web-4.png",
    staticValue: "24/7",
    label: "SOPORTE",
    sublabel: "En tiempo real",
    colorClass: "bg-[#007b80]",
  },
];

function CountUpNumber({
  target,
  suffix,
  duration,
  useSeparator = false,
}: {
  target: number;
  suffix: string;
  duration?: number;
  useSeparator?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Dynamic duration: larger numbers animate slightly longer (between 800ms and 2400ms)
  const animDuration =
    duration || Math.max(800, Math.min(2400, Math.log10(target) * 420));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isIntersecting) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / animDuration, 1);

      // Ease out cubic: fast at start, decelerating at end
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(easedProgress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isIntersecting, target, animDuration]);

  const formatNumber = (num: number) => {
    if (useSeparator) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    return num.toString();
  };

  return (
    <span ref={ref}>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export function FeaturesSection() {
  return (
    <section id="servicios" className="py-16 bg-white text-gray-800">
      <div className="container mx-auto px-4 max-w-[1440px]">
        {/* Header content */}
        <div className="text-center max-w-5xl mx-auto mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#3a3a3a] tracking-tight">
            Cómo funciona boletos.la
          </h2>
          <div className="text-gray-600 space-y-4 text-base md:text-lg lg:text-xl leading-relaxed font-normal">
            <p>
              <strong>Busca tu destino:</strong> Ingresa cualquier ciudad,
              dirección o point de interés en Latinoamérica.
            </p>
            <p>
              <strong>Compara:</strong> Analizamos al instante buses y hoteles
              para mostrarte la combinación más rápida y la más económica.
            </p>
            <p>
              <strong>Reserva:</strong> Te conectamos con los operadores
              oficiales para que compres tus boletos de forma segura y rápido.
            </p>
          </div>
        </div>

        {/* Circular badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 max-w-7xl mx-auto mt-12 justify-center">
          {steps.map((step, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center space-y-4"
              >
                {/* Icon Image or Lucide Icon */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {step.icon ? (
                    <div className="w-20 h-20 rounded-full bg-[#00c7cc]/10 flex items-center justify-center text-[#00c7cc]">
                      <step.icon className="w-11 h-11 stroke-[1.5]" />
                    </div>
                  ) : (
                    <Image
                      src={step.iconPath!}
                      alt={step.label}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  )}
                </div>

                {/* Text and stats */}
                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-800 mb-1">
                    {step.staticValue ? (
                      step.staticValue
                    ) : (
                      <CountUpNumber
                        target={step.target!}
                        suffix={step.suffix!}
                        useSeparator={step.useSeparator}
                      />
                    )}
                  </h4>
                  <p className="text-sm md:text-base font-bold tracking-wider text-gray-400 uppercase">
                    {step.label}
                  </p>
                  <p className="text-sm text-gray-500 font-semibold">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
