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

  openGraph: {
    title: "boletos.la - Reserva de Pasajes de Bus",
    description: "Reserva tus pasajes de bus de forma rápida y segura. Viaja por todo el país con las mejores empresas de transporte",
    url: "https://boletos.la",
    siteName: "boletos.la",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "boletos.la - Reserva de Pasajes de Bus",
      },
    ],
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "boletos.la - Reserva de Pasajes de Bus",
    description: "Reserva tus pasajes de bus de forma rápida y segura. Viaja por todo el país con las mejores empresas de transporte",
    images: ["/images/hero.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import WebviewWarning from "@/components/webview-warning";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "boletos.la",
    "url": "https://boletos.la",
    "description": "Reserva tus pasajes de bus de forma rápida y segura.",
    "logo": "https://boletos.la/images/logo.png"
  };

  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <WebviewWarning />
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
