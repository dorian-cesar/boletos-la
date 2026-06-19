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

  const featuresText = {
    brasil: {
      titleBoletos: "Como funciona o Boletos.la",
      step1Bold: "Busque seu destino:",
      step1Text:
        " Digite qualquer cidade, endereço ou ponto de interesse na América Latina.",
      step2Bold: "Compare:",
      step2Text:
        " Analisamos instantaneamente ônibus e hotéis para mostrar a combinação mais rápida e barata.",
      step3Bold: "Reserve:",
      step3Text:
        " Conectamos você com as operadoras oficiais para que você possa comprar suas passagens com segurança e rapidez.",
      labels: ["PAISES", "ROTAS", "PASSAGEIROS", "DESTINOS"],
    },
    default: {
      titleBoletos: "Cómo funciona boletos.la",
      step1Bold: "Busca tu destino:",
      step1Text:
        " Ingresa cualquier ciudad, dirección o punto de interés en Latinoamérica.",
      step2Bold: "Compara:",
      step2Text:
        " Analizamos al instante buses y hoteles para mostrarte la combinación más rápida y la más económica.",
      step3Bold: "Reserva:",
      step3Text:
        " Te conectamos con los operadores oficiales para que compres tus boletos de forma segura y rápido.",
      labels: ["PAISES", "RUTAS", "PASAJEROS", "DESTINOS"],
    },
  };

  const currentText =
    normalizedCountry === "brasil" ? featuresText.brasil : featuresText.default;

  return (
    <section id="servicios" className="py-16 bg-white text-gray-850">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header content */}
        <div className="text-center max-w-6xl mx-auto mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#4a4a4a] tracking-tight">
            {currentText.titleBoletos}
          </h2>
          <div className="text-gray-500 space-y-4 text-base md:text-lg lg:text-xl leading-relaxed font-normal">
            <p>
              <strong>{currentText.step1Bold}</strong>
              {currentText.step1Text}
            </p>
            <p>
              <strong>{currentText.step2Bold}</strong>
              {currentText.step2Text}
            </p>
            <p>
              <strong>{currentText.step3Bold}</strong>
              {currentText.step3Text}
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
