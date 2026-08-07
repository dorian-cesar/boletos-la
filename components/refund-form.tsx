"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const LOCK_TIME_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function RefundForm() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const [ticketData, setTicketData] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const savedAttempts = parseInt(localStorage.getItem("refund_attempts") || "0");
    const savedLockedUntil = parseInt(localStorage.getItem("refund_locked_until") || "0");
    
    const now = Date.now();
    
    if (savedLockedUntil && savedLockedUntil > now) {
      setLockedUntil(savedLockedUntil);
      setAttempts(savedAttempts);
    } else if (savedLockedUntil && savedLockedUntil <= now) {
      localStorage.removeItem("refund_attempts");
      localStorage.removeItem("refund_locked_until");
      setAttempts(0);
      setLockedUntil(null);
    } else {
      setAttempts(savedAttempts);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setTicketData(null);

    const now = Date.now();
    if (lockedUntil && lockedUntil > now) {
      const minutesLeft = Math.ceil((lockedUntil - now) / 60000);
      setError(`Has superado el límite de intentos. Por favor, intenta de nuevo en ${minutesLeft} minutos.`);
      return;
    }

    if (!ticketNumber.trim()) {
      setError("Por favor ingresa un número de ticket.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Endpoint real del backend para buscar el ticket
      // const response = await fetch(`EL_ENDPOINT_QUE_ME_DARAN?ticket=${ticketNumber}`);
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulando latencia

      if (ticketNumber === "12345") {
        const mockData = {
          firstName: "Juan",
          lastName: "Pérez",
          documentType: "Cédula de Identidad",
          documentNumber: "1234567",
          route: "Asunción - Ciudad del Este",
          date: "15 Octubre 2026",
          email: "juan.perez@example.com",
          phone: "+595 981 123456"
        };
        setTicketData(mockData);
        setEmail(mockData.email);
        setPhone(mockData.phone);
        
        setAttempts(0);
        localStorage.removeItem("refund_attempts");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        localStorage.setItem("refund_attempts", newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockTime = now + LOCK_TIME_MS;
          setLockedUntil(lockTime);
          localStorage.setItem("refund_locked_until", lockTime.toString());
          setError(`Has superado el límite de intentos (5). Por favor, intenta de nuevo en 10 minutos.`);
        } else {
          setError(`No se encontró el ticket. Intento ${newAttempts} de ${MAX_ATTEMPTS}. Verifique el número e intente de nuevo.`);
        }
      }
    } catch (err) {
      setError("Ocurrió un error al consultar el ticket. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Por favor, especifica el motivo de la devolución.");
      return;
    }
    
    // TODO: Endpoint real para procesar la devolución
    console.log("Enviando devolución:", { ticketNumber, email, phone, reason });
    setSuccess(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">Solicitar Devolución</h2>
      <p className="text-gray-400 mb-8">
        Ingresa tu número de ticket para buscar los detalles de tu viaje y procesar la solicitud de devolución.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Label htmlFor="ticketNumber" className="text-gray-300">Número de Ticket</Label>
          <Input
            id="ticketNumber"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="Ej: 12345"
            disabled={loading || (lockedUntil !== null && lockedUntil > Date.now())}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
          />
        </div>
        <div className="flex items-end">
          <Button 
            type="submit" 
            disabled={loading || (lockedUntil !== null && lockedUntil > Date.now())}
            className="h-12 px-8 bg-[#00c7cc] hover:bg-[#00a8ad] text-black font-bold rounded-full transition-all"
          >
            {loading ? "Buscando..." : "Buscar Ticket"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 mb-8 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          Tu solicitud de devolución ha sido enviada exitosamente. Nos pondremos en contacto contigo a la brevedad.
        </div>
      )}

      {ticketData && !success && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
              Detalles del Boleto
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Nombres</Label>
                <Input value={ticketData.firstName} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Apellidos</Label>
                <Input value={ticketData.lastName} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Tipo Documento</Label>
                <Input value={ticketData.documentType} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">No. Documento</Label>
                <Input value={ticketData.documentNumber} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Ruta</Label>
                <Input value={ticketData.route} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Fecha de Viaje</Label>
                <Input value={ticketData.date} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitRefund} className="space-y-6">
            <p className="text-xs text-[#00c7cc] font-medium bg-[#00c7cc]/10 p-3 rounded-lg border border-[#00c7cc]/20">
              💡 Puedes modificar el correo o teléfono de contacto si deseas recibir las notificaciones de la devolución en un medio distinto al del registro.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-gray-300">Correo Electrónico de Contacto</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white h-12 focus:border-[#00c7cc]"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-300">Teléfono de Contacto</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 bg-white/5 border-white/10 text-white h-12 focus:border-[#00c7cc]"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason" className="text-gray-300">Motivo de la Devolución</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Por favor explica el motivo por el cual solicitas la devolución del boleto..."
                className="mt-1 bg-white/5 border-white/10 text-white h-32 focus:border-[#00c7cc] resize-none overflow-y-auto"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 text-lg bg-[#00c7cc] hover:bg-[#00a8ad] text-black font-bold rounded-full transition-all"
            >
              Solicitar Devolución
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
