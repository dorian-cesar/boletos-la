import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "@/components/google-tag-manager";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "boletos.la - Reserva de Pasajes de Bus",
  description:
    "Reserva tus pasajes de bus de forma rápida y segura. Viaja por todo el país con las mejores empresas de transporte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        <GoogleTagManager />
        {children}
      </body>
    </html>
  );
}
