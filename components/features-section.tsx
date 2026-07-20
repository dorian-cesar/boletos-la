import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface StepItem {
  iconPath: string;
  target: number;
  suffix: string;
  useSeparator?: boolean;
  label: string;
  textColor: string;
}

const steps: StepItem[] = [
  {
    iconPath: "/images/iconos-web/paises-icon.png",
    target: 12,
    suffix: "",
    label: "PAISES",
    textColor: "text-[#eb5b24]",
  },
  {
    iconPath: "/images/iconos-web/rutas-icon.png",
    target: 5000,
    suffix: "",
    useSeparator: true,
    label: "RUTAS",
    textColor: "text-[#e5a924]",
  },
  {
    iconPath: "/images/iconos-web/pasajeros-icon.png",
    target: 20000,
    suffix: "",
    useSeparator: true,
    label: "PASAJEROS",
    textColor: "text-[#00c7cc]",
  },
  {
    iconPath: "/images/iconos-web/destinos-icon.png",
    target: 3000,
    suffix: "",
    useSeparator: true,
    label: "DESTINOS",
    textColor: "text-[#007b80]",
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

interface FeaturesSectionProps {
  country?: string;
}

export function FeaturesSection({ country }: FeaturesSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "chile";

  const featuresText: Record<string, { title: string; description: string; labels: string[] }> = {
    brasil: {
      title: "Viaje de ônibus sem filas!",
      description: "Boletos.la é a plataforma web ideal para comprar suas passagens online de forma rápida em qualquer dispositivo.",
      labels: ["PAÍSES", "ROTAS", "PASSAGEIROS", "DESTINOS"],
    },
    colombia: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma web líder para comprar tus pasajes y tiquetes en línea desde cualquier dispositivo.",
      labels: ["PAÍSES", "RUTAS", "PASAJEROS", "DESTINOS"],
    },
    chile: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma digital para comprar tus pasajes en línea de manera segura desde cualquier dispositivo.",
      labels: ["PAÍSES", "RUTAS", "PASAJEROS", "DESTINOS"],
    },
    paraguay: {
      title: "¡Viaja en colectivo sin filas!",
      description: "Boletos.la es la plataforma web preferida para comprar tus pasajes y boletos en línea desde tu celular o computadora.",
      labels: ["PAÍSES", "RUTAS", "PASAJEROS", "DESTINOS"],
    },
    default: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma líder para comprar tus pasajes en línea de manera segura desde cualquier dispositivo.",
      labels: ["PAÍSES", "RUTAS", "PASAJEROS", "DESTINOS"],
    },
  };

  const currentText =
    featuresText[normalizedCountry] || featuresText.default;

  return (
    <section id="servicios" className="py-16 bg-white text-gray-850">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header content */}
        <div className="text-center max-w-6xl mx-auto mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#4a4a4a] tracking-tight">
            {currentText.title}
          </h2>
          <div className="text-gray-500 space-y-4 text-base md:text-lg lg:text-xl leading-relaxed font-normal">
            <p>
              {currentText.description}
            </p>
          </div>
        </div>

        {/* Circular badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mt-16">
          {steps.map((step, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center space-y-3"
              >
                {/* Icon Image */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <Image
                    src={step.iconPath}
                    alt={step.label}
                    fill
                    className="object-contain"
                    sizes="112px"
                  />
                </div>

                {/* Text and stats */}
                <div className="space-y-1">
                  <h4
                    className={`text-3xl md:text-4xl font-black ${step.textColor} mb-0.5`}
                  >
                    <CountUpNumber
                      target={step.target}
                      suffix={step.suffix}
                      useSeparator={step.useSeparator}
                    />
                  </h4>
                  <p className="text-xs md:text-sm font-bold tracking-wider text-gray-400 uppercase">
                    {currentText.labels[idx]}
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
