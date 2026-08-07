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
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const [ticketData, setTicketData] = useState<any>(null);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const [requestType, setRequestType] = useState<"anulacion" | "reembolso">("anulacion");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [holderDocument, setHolderDocument] = useState("");

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
      setError(`Superaste el límite de intentos. Por favor, intentá de nuevo en ${minutesLeft} minutos.`);
      return;
    }

    if (!ticketNumber.trim()) {
      setError("Por favor ingresá tu número de pasaje o boleto.");
      return;
    }

    setLoading(true);
    setIsSearching(true);

    try {
      const response = await fetch(`/api/ticket/search?number=${ticketNumber}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setTicketData(result.data);
        setEmail(result.data.email || "");
        setPhone(result.data.phone || "");

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
          setError(`Superaste el límite de intentos (5). Por favor, intentá de nuevo en 10 minutos.`);
        } else {
          setError(`No se encontró el pasaje. Intento ${newAttempts} de ${MAX_ATTEMPTS}. Verificá el número e intentá de nuevo.`);
        }
      }
    } catch (err) {
      console.error("Error searching ticket:", err);
      setError("Ocurrió un error al consultar el pasaje. Intentá de nuevo más tarde.");
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Por favor, especificá el motivo de tu solicitud.");
      return;
    }

    // TODO: Endpoint real para procesar la devolución
    console.log("Enviando devolución:", {
      ticketNumber,
      email,
      phone,
      reason,
      requestType,
      ...(requestType === "reembolso" && { bankName, accountType, accountNumber, accountHolder, holderDocument })
    });
    setSuccess(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-8 bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-2">Anulación o Reembolso</h2>
      <p className="text-gray-400 mb-8">
        Ingresá tu número de pasaje o boleto para buscar los detalles de tu viaje y procesar la solicitud de anulación o reembolso.
      </p>

      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Label htmlFor="ticketNumber" className="text-gray-300">Nro. de Pasaje / Boleto</Label>
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
            {isSearching ? "Buscando..." : "Buscar Pasaje"}
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
          Tu solicitud ha sido enviada exitosamente. Nos pondremos en contacto contigo a la brevedad.
        </div>
      )}

      {ticketData && !success && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-6">
            <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">
              Detalles del Pasaje / Boleto
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
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Nro. de Cédula / Doc.</Label>
                <Input value={ticketData.documentNumber} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Ruta</Label>
                <div 
                  className="mt-1 h-10 bg-white/5 border border-white/10 rounded-md px-3 flex items-center overflow-hidden relative text-white opacity-70 text-sm font-medium cursor-default"
                  title={ticketData.route}
                >
                  <div className="w-full overflow-hidden whitespace-nowrap">
                    <span className="inline-block animate-route-marquee">
                      {ticketData.route}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Fecha de Viaje</Label>
                <Input value={ticketData.date} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Asiento</Label>
                <Input value={ticketData.seatNumber || "N/A"} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
              <div>
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Monto</Label>
                <Input value={`Gs. ${ticketData.amount || "0"}`} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitRefund} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-gray-300 font-semibold text-lg">Tipo de Solicitud</Label>
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="anulacion"
                    checked={requestType === "anulacion"}
                    onChange={() => setRequestType("anulacion")}
                    className="h-4 w-4 text-[#00c7cc] bg-transparent border-white/30 focus:ring-[#00c7cc] focus:ring-offset-0 focus:ring-1"
                  />
                  <span className="text-white">Anulación / Cancelación</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="reembolso"
                    checked={requestType === "reembolso"}
                    onChange={() => setRequestType("reembolso")}
                    className="h-4 w-4 text-[#00c7cc] bg-transparent border-white/30 focus:ring-[#00c7cc] focus:ring-offset-0 focus:ring-1"
                  />
                  <span className="text-white">Reembolso (Transferencia)</span>
                </label>
              </div>
            </div>

            {requestType === "reembolso" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="text-gray-300 font-semibold">Datos Bancarios para el Reembolso</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <Label htmlFor="bankName" className="text-gray-400 text-sm">Banco / Entidad</Label>
                    <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} required={requestType === "reembolso"} placeholder="Ej. Banco Itaú" className="mt-1 bg-black/20 border-white/10 text-white focus:border-[#00c7cc]" />
                  </div>
                  <div>
                    <Label htmlFor="accountType" className="text-gray-400 text-sm">Tipo de Cuenta</Label>
                    <select id="accountType" value={accountType} onChange={(e) => setAccountType(e.target.value)} required={requestType === "reembolso"} className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-md h-10 px-3 focus:border-[#00c7cc] focus:ring-1 focus:ring-[#00c7cc] outline-none">
                      <option value="" className="bg-[#1a1a1a]">Seleccionar tipo...</option>
                      <option value="Ahorro" className="bg-[#1a1a1a]">Caja de Ahorro</option>
                      <option value="Corriente" className="bg-[#1a1a1a]">Cuenta Corriente</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-gray-400 text-sm">Nro. de Cuenta</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required={requestType === "reembolso"} className="mt-1 bg-black/20 border-white/10 text-white focus:border-[#00c7cc]" />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder" className="text-gray-400 text-sm">Nombre del Titular</Label>
                    <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required={requestType === "reembolso"} className="mt-1 bg-black/20 border-white/10 text-white focus:border-[#00c7cc]" />
                  </div>
                  <div>
                    <Label htmlFor="holderDocument" className="text-gray-400 text-sm">Cédula / RUC del Titular</Label>
                    <Input id="holderDocument" value={holderDocument} onChange={(e) => setHolderDocument(e.target.value)} required={requestType === "reembolso"} placeholder="C.I. / RUC" className="mt-1 bg-black/20 border-white/10 text-white focus:border-[#00c7cc]" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-gray-300 font-semibold">Datos de Contacto</h4>
              <p className="text-xs text-[#00c7cc] font-medium bg-[#00c7cc]/10 p-3 rounded-lg border border-[#00c7cc]/20">
                💡 Puedes modificar el correo o teléfono de contacto si deseas recibir las notificaciones de tu solicitud en un medio distinto al del registro.
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
                  <Label htmlFor="phone" className="text-gray-300">Nro. de Celular / Teléfono</Label>
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
            </div>

            <div>
              <Label htmlFor="reason" className="text-gray-300">Motivo de la Solicitud</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Por favor explicá el motivo de tu solicitud..."
                className="mt-1 bg-white/5 border-white/10 text-white h-32 focus:border-[#00c7cc] resize-none overflow-y-auto"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg bg-[#00c7cc] hover:bg-[#00a8ad] text-black font-bold rounded-full transition-all"
            >
              Enviar Solicitud
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
