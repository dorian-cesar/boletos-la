"use client";

interface OmnichannelSectionProps {
  country?: string;
}

export function OmnichannelSection({ country }: OmnichannelSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const content: Record<string, { title: string; description: string }> = {
    brasil: {
      title: "Onde quer que você esteja, nós também estamos.",
      description: "Descubra nossos pontos de venda físicos e totens de autoatendimento. Uma alternativa rápida e prática para comprar suas passagens diretamente na rodoviária.",
    },
    colombia: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y terminales de autoservicio interactivo. Una alternativa rápida y fácil para comprar tus pasajes directamente en la terminal.",
    },
    chile: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y tótems de autoservicio rápido. Una alternativa rápida y eficiente para comprar tus pasajes directamente en el terminal.",
    },
    paraguay: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta presenciales y terminales de autoservicio digital. Una alternativa ágil para comprar tus pasajes directamente en la terminal.",
    },
    default: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y tótems de autoservicio rápido. Una alternativa rápida y eficiente para comprar tus pasajes directamente en el terminal.",
    },
  };

  const currentContent = content[normalizedCountry] || content.default;

  return (
    <section className="py-20 bg-gray-50 text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#4a4a4a] tracking-tight mb-6">
          {currentContent.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
          {currentContent.description}
        </p>
      </div>
    </section>
  );
}
