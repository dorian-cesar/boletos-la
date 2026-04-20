"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Ticket,
  Calendar,
  MapPin,
  User,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

export default function MisViajesPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(false);

    // Simulamos una búsqueda
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
      // Simulación: Si el número es 123, mostramos error, sino éxito (demo)
      if (ticketNumber === "123") {
        setError("No se encontró ningún boleto con el número ingresado.");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col">
      <Header />

      <main className="flex-1 relative flex flex-col justify-center items-center pt-32 pb-20 px-4">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 w-full max-w-2xl animate-fade-in min-h-screen">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Buscá tu <span className="text-primary">Boleto</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md mx-auto">
              Ingresá tu número de boleto para ver los detalles de tu reserva,
              descargar tu pasaje o gestionar cambios.
            </p>
          </div>

          <Card className="p-6 md:p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative">
            <form onSubmit={handleSearch} className="relative space-y-6">
              <div className="relative">
                <label
                  htmlFor="ticketNumber"
                  className="block text-sm font-medium text-white/70 mb-2 ml-1"
                >
                  Número de Boleto
                </label>
                <div className="relative">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 transition-colors" />
                  <Input
                    id="ticketNumber"
                    type="text"
                    placeholder="Ej: ABC-123456"
                    value={ticketNumber}
                    onChange={(e) =>
                      setTicketNumber(e.target.value.toUpperCase())
                    }
                    className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:ring-white/20 focus:border-white/30 text-lg uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !ticketNumber.trim()}
                className="w-full h-14 bg-secondary hover:bg-secondary/90 text-black font-bold text-lg rounded-xl shadow-lg shadow-secondary/20 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-6 w-6 mr-2" />
                    Buscá tu boleto
                  </>
                )}
              </Button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-center animate-shake">
                {error}
              </div>
            )}
          </Card>

          <div className="mt-8 flex justify-center">
            <Image
              src="/logos/logo-boletos-blanco.png"
              alt="Boletos.la"
              width={100}
              height={30}
              className="opacity-50 grayscale brightness-200 pt-5"
            />
          </div>

          {/* Results Area (Mock) */}
          {hasSearched && !error && (
            <div className="mt-8 space-y-6 animate-fade-in-up">
              <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30">
                <Card className="p-6 bg-[#1a2332] border-0 rounded-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                        <User className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-xl">
                          Juan Tester
                        </p>
                        <p className="text-white/40 text-sm">
                          Boleto Confirmado • {ticketNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        Ver PDF
                      </Button>
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Gestionar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-white/5">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <p className="text-white/70">15 Abr 2026 - 21:00 hs</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-secondary" />
                        <div>
                          <p className="text-white font-medium">Asunción</p>
                          <p className="text-white/40 text-xs">
                            Terminal de Ómnibus
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 mx-1" />
                        <div>
                          <p className="text-white font-medium">
                            Ciudad del Este
                          </p>
                          <p className="text-white/40 text-xs">Terminal CDE</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                          Empresa
                        </p>
                        <p className="text-white font-bold">
                          Nuestra Señora de la Asunción
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                          Asiento
                        </p>
                        <p className="text-primary font-bold text-xl">12</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
