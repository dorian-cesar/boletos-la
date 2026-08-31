import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleTagManager from "@/components/google-tag-manager";
import MetaPixel from "@/components/meta-pixel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | boletos.la",
    default: "boletos.la - Reserva de Pasajes de Bus",
  },
  description:
    "Reserva tus pasajes de bus de forma rápida y segura. Viaja por todo el país con las mejores empresas de transporte",

  metadataBase: new URL("https://boletos.la"),
  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          <GoogleTagManager />
          <MetaPixel />
          <div className="zoom-wrapper">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
