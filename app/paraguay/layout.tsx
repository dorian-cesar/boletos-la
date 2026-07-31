import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "boletos.la Paraguay - Reserva de Pasajes de Bus",
  description:
    "Reservá tus boletos de bus en Paraguay de forma rápida y segura. Las mejores empresas de transporte, los mejores precios.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ParaguayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
