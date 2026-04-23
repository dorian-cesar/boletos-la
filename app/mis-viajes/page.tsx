"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Ticket,
  MapPin,
  Calendar,
  Clock,
  User,
  Download,
  Bus,
  ArrowRight,
  Info,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import QRCode from "qrcode";

interface TicketData {
  id: number;
  ticket_number: string;
  connection_id: string;
  first_name: string;
  last_name: string;
  document_number: string;
  document_type_code: string;
  document_type_name: string;
  email: string;
  phone: string;
  occupation: string;
  birth_date: string;
  gender: string;
  nationality: string;
  country: string;
  seat_number: string;
  seat_type: string;
  seat_status: string;
  quality_code: string;
  trip_id: string;
  origin_id: string;
  destination_id: string;
  origin_title: string;
  destination_title: string;
  departure_date: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  bus_type: string;
  company: string;
  seat_price: number;
  total_booking_price: number;
  payment_status: string;
  payment_amount: string;
  payment_paid: boolean;
  payment_token: string;
  payment_hash: string;
  created_at: string;
}

export default function MisViajesPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setTicketData(null);

    try {
      const response = await fetch("/api/tickets/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber: ticketNumber.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "No se encontró ningún boleto con el número ingresado.",
        );
      }

      const data = result.data;
      setTicketData(data);

      // Generar QR
      const qrUrl = await QRCode.toDataURL(data.ticket_number);
      setQrCodeUrl(qrUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!ticketData) return;
    setIsDownloading(true);

    try {
      // Formatear fecha para el generador
      const formattedDate = format(
        parse(ticketData.departure_date, "yyyy-MM-dd", new Date()),
        "d 'de' MMMM, yyyy",
        { locale: es },
      );

      const payload = {
        templateName: "ticket-boleto",
        logo: "logo-santaniana-blanco.png",
        reservaCodigo: ticketData.ticket_number,
        numeroFactura: ticketData.payment_hash.substring(0, 15).toUpperCase(),
        fechaVenta: format(new Date(ticketData.created_at), "dd/MM/yyyy HH:mm"),
        origen: ticketData.origin_title,
        destino: ticketData.destination_title,
        fechaViaje: formattedDate,
        horaSalida: ticketData.departure_time.substring(0, 5),
        horaLlegada: ticketData.arrival_time.substring(0, 5),
        duracion: ticketData.duration,
        asiento: ticketData.seat_number,
        servicio: ticketData.bus_type,
        pasajeroNombre: `${ticketData.first_name} ${ticketData.last_name}`,
        documento: ticketData.document_number,
        email: ticketData.email,
        fechaNacimiento: ticketData.birth_date,
        total: `Gs. ${ticketData.seat_price.toLocaleString("es-PY")}`,
        cdc: ticketData.payment_hash.substring(0, 44),
        qrBase64: qrCodeUrl.replace(/^data:image\/[a-z]+;base64,/, ""),
      };

      const response = await fetch("/api/tickets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      const link = document.createElement("a");
      link.href = result.pdf.base64;
      link.download = result.pdf.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error("Error descargando PDF:", err);
      alert("No se pudo generar el PDF. Por favor intenta más tarde.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col text-white">
      <Header />

      <main
        className={`min-h-screen flex-1 relative flex flex-col items-center pb-20 px-4 transition-all duration-500 ${ticketData ? "pt-12 md:pt-14" : "pt-32"}`}
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
              Mi <span className="text-primary">Boleto</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md mx-auto">
              Consultá tu viaje y descargá tu boleto electrónico de forma rápida
              y segura.
            </p>
          </div>

          {!ticketData ? (
            <Card className="p-6 md:p-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden relative max-w-2xl mx-auto">
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
                      placeholder="Ej: 70030020000049"
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
                      Buscar mi boleto
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-center animate-shake flex items-center justify-center gap-2">
                  <Info className="h-5 w-5" />
                  {error}
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-8 animate-slide-up">
              {/* Contenedor del Boleto Premium */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                <div className="relative bg-[#1a1f26] rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row min-h-[400px]">
                  {/* Lado Izquierdo - Detalles Principales */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                      <div className="space-y-1">
                        <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">
                          Boleto Electrónico
                        </p>
                        <h2 className="text-2xl font-bold">
                          {ticketData.company}
                        </h2>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                          N° Ticket
                        </p>
                        <p className="font-mono font-bold text-lg text-secondary">
                          {ticketData.ticket_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 mb-5">
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                          Origen
                        </p>
                        <h3 className="text-3xl font-bold mb-1">
                          {ticketData.origin_title}
                        </h3>
                      </div>

                      <div className="flex flex-col items-center px-4">
                        <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      </div>

                      <div className="flex-1 text-center md:text-right">
                        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                          Destino
                        </p>
                        <h3 className="text-3xl font-bold mb-1">
                          {ticketData.destination_title}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-auto">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Fecha
                        </p>
                        <p className="font-bold">
                          {format(
                            parse(
                              ticketData.departure_date,
                              "yyyy-MM-dd",
                              new Date(),
                            ),
                            "dd MMM, yyyy",
                            { locale: es },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Salida
                        </p>
                        <p className="font-bold">
                          {ticketData.departure_time.substring(0, 5)} hs
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                          <User className="h-3 w-3" /> Asiento
                        </p>
                        <p className="font-bold text-primary">
                          {ticketData.seat_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Estado
                        </p>
                        <p className="font-bold text-green-400 capitalize">
                          {ticketData.payment_status}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Línea Divisoria Decorativa (Vertical en Desktop, Horizontal en Mobile) */}
                  <div className="relative flex flex-row md:flex-col items-center justify-center">
                    <div className="hidden md:block absolute -top-4 w-8 h-8 bg-[#0f1419] rounded-full border border-white/10"></div>
                    <div className="hidden md:block h-full border-l-2 border-dashed border-white/10 mx-4"></div>
                    <div className="hidden md:block absolute -bottom-4 w-8 h-8 bg-[#0f1419] rounded-full border border-white/10"></div>

                    <div className="md:hidden absolute -left-4 w-8 h-8 bg-[#0f1419] rounded-full border border-white/10"></div>
                    <div className="md:hidden w-full border-t-2 border-dashed border-white/10 my-4"></div>
                    <div className="md:hidden absolute -right-4 w-8 h-8 bg-[#0f1419] rounded-full border border-white/10"></div>
                  </div>

                  {/* Lado Derecho - QR y Acciones */}
                  <div className="w-full md:w-[300px] bg-white/[0.02] p-8 md:p-10 flex flex-col items-center justify-center text-center">
                    <div className="bg-white p-3 rounded-2xl mb-6 shadow-xl shadow-black/50">
                      {qrCodeUrl ? (
                        <Image
                          src={qrCodeUrl}
                          alt="Ticket QR"
                          width={140}
                          height={140}
                          className="rounded-lg"
                        />
                      ) : (
                        <div className="w-[140px] h-[140px] bg-gray-200 animate-pulse rounded-lg" />
                      )}
                    </div>

                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">
                      Escaneá al abordar
                    </p>

                    <div className="w-full space-y-3">
                      <Button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 flex items-center justify-center gap-2"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        Descargar PDF
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setTicketData(null);
                          setTicketNumber("");
                        }}
                        className="w-full border-white/10 bg-transparent hover:bg-white/5 text-white/60 hover:text-white rounded-xl h-12"
                      >
                        Nueva Búsqueda
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Pasajero */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Información del
                    Pasajero
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Nombre completo</span>
                      <span className="font-bold text-white/90">
                        {ticketData.first_name} {ticketData.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">
                        {ticketData.document_type_name}
                      </span>
                      <span className="font-bold text-white/90">
                        {ticketData.document_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Nacionalidad</span>
                      <span className="font-bold text-white/90">
                        {ticketData.nationality}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                  <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-secondary" /> Detalles del
                    Pago
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Monto pagado</span>
                      <span className="font-bold text-secondary">
                        Gs. {ticketData.seat_price.toLocaleString("es-PY")}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-white/60">Método</span>
                      <span className="font-bold capitalize text-white/90">
                        {ticketData.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Fecha de compra</span>
                      <span className="font-bold text-white/90">
                        {format(
                          new Date(ticketData.created_at),
                          "dd/MM/yyyy HH:mm",
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Botones de acción adicionales */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <div className="flex items-center gap-3 text-white/40 text-sm">
                  <Smartphone className="h-5 w-5" />
                  Podés presentar este boleto desde tu celular
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-center pb-10">
            <Image
              src="/logos/logo-boletos-blanco.png"
              alt="Boletos.la"
              width={120}
              height={40}
              className="opacity-20 grayscale brightness-200"
            />
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
