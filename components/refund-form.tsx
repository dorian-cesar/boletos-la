"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCK_TIME_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function RefundForm() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gdsResultData, setGdsResultData] = useState<any>(null);

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

  const [gdsStatus, setGdsStatus] = useState<"idle" | "loading" | "success" | "not-found" | "error">("idle");

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

  const saveIntegrationLog = async (
    ticket: string,
    operacion: string,
    estado: "EXITO" | "ERROR",
    respuestaIntegracion?: any,
    mensajeError?: string
  ) => {
    try {
      const payload = {
        ticket_number: ticket,
        operacion,
        estado,
        pais: "PY",
        ...(respuestaIntegracion && { respuesta_integracion: respuestaIntegracion }),
        ...(mensajeError && { mensaje_error: mensajeError })
      };

      await fetch("https://backend-boletos-publicidad.dev-wit.com/api/logs-operaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Error saving integration log:", err);
    }
  };

  const checkGdsPassenger = async (docType: string, docNumber: string) => {
    setGdsStatus("loading");
    try {
      const isLocal = ['cedula', 'ci', 'c.i.', 'paraguay', 'dni', 'c'].some(val => docType.toLowerCase().includes(val));
      let mappedType = isLocal ? 'CI' : 'PASSPORT';
      
      let response = await fetch('/api/gds/passenger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docType: mappedType, docNumber })
      });
      let result = await response.json();
      
      // Si no encuentra con el primer tipo, intenta con el alternativo
      if (response.ok && result.success && !result.data?.passenger) {
        const fallbackType = mappedType === 'CI' ? 'PASSPORT' : 'CI';
        response = await fetch('/api/gds/passenger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ docType: fallbackType, docNumber })
        });
        result = await response.json();
      }
      
      setGdsResultData(result);
      let estadoLog: "EXITO" | "ERROR" = "EXITO";
      let mensajeErrorLog = "";
      
      if (response.ok) {
        if (result.success && result.data?.passenger) {
          setGdsStatus("success");
        } else {
          setGdsStatus("not-found");
          estadoLog = "ERROR";
          mensajeErrorLog = "El pasajero no existe o no se encontraron coincidencias.";
        }
      } else {
        setGdsStatus("error");
        estadoLog = "ERROR";
        mensajeErrorLog = "Error al comunicarse con el GDS.";
      }

      await saveIntegrationLog(ticketNumber, "CONSULTA", estadoLog, result, mensajeErrorLog);
    } catch (e) {
      console.error("Error checking GDS passenger:", e);
      setGdsStatus("error");
      await saveIntegrationLog(ticketNumber, "CONSULTA", "ERROR", null, "Excepción al consultar GDS.");
    }
  };

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
        
        // Verificación silenciosa en GDS
        if (result.data.documentNumber) {
          checkGdsPassenger(result.data.documentType || "CI", result.data.documentNumber);
        }
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

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Por favor, especificá el motivo de tu solicitud.");
      return;
    }

    if (!ticketData) {
      setError("No hay información del boleto para procesar.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const [origen, destino] = (ticketData.route || "").split(" - ");
      
      const payload = {
        ticket_number: ticketNumber,
        monto: parseFloat(ticketData.amount || "0"),
        datos_pasajero: {
          nombre: `${ticketData.firstName || ""} ${ticketData.lastName || ""}`.trim(),
          documento: ticketData.documentNumber || "",
          email: email
        },
        datos_boleto: {
          origen: origen || "",
          destino: destino || ""
        },
        datos_bancarios: requestType === "reembolso" ? {
          banco: bankName,
          tipo_cuenta: accountType,
          numero_cuenta: accountNumber,
          tipo_documento_beneficiario: "CI",
          documento_beneficiario: holderDocument,
          nombre_beneficiario: accountHolder
        } : null,
        motivo: reason,
        tipo_solicitud: requestType
      };

      const response = await fetch("https://backend-boletos-publicidad.dev-wit.com/api/devoluciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      setSuccess(true);
      await saveIntegrationLog(ticketNumber, "SOLICITUD_DEVOLUCION", "EXITO", gdsResultData);
    } catch (err) {
      console.error("Error submitting refund:", err);
      setError("Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.");
      await saveIntegrationLog(ticketNumber, "SOLICITUD_DEVOLUCION", "ERROR", gdsResultData, "Ocurrió un error al procesar la solicitud de devolución.");
    } finally {
      setIsSubmitting(false);
    }
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
            placeholder="Ej: 123456789012345"
            disabled={loading || (lockedUntil !== null && lockedUntil > Date.now())}
            className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-12"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={loading || (lockedUntil !== null && lockedUntil > Date.now())}
            className="h-12 px-8 bg-[#00c7cc] hover:bg-[#00a8ad] text-black font-bold rounded-full transition-all flex items-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5 stroke-[2.5]" />
                <span>Buscar Pasaje</span>
              </>
            )}
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
                <Label className="text-gray-400 text-xs uppercase tracking-wider">Monto Pagado</Label>
                <Input value={ticketData.amount ? `Gs. ${Number(ticketData.amount).toLocaleString('es-PY')}` : 'Gs. 0'} readOnly className="mt-1 bg-white/5 border-white/10 text-white opacity-70" />
              </div>
            </div>

            {gdsStatus === "loading" && (
              <div className="flex items-center space-x-3 text-gray-400 text-sm mt-4 p-4 bg-black/20 rounded-lg">
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-gray-400 animate-spin" />
                <span>Verificando pasajero en GDS...</span>
              </div>
            )}
            {gdsStatus === "success" && (
              <div className="flex items-center space-x-3 text-green-400 text-sm mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Pasajero verificado correctamente en el sistema GDS del operador.</span>
              </div>
            )}
            {gdsStatus === "not-found" && (
              <div className="flex items-center space-x-3 text-orange-400 text-sm mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>El pasajero no fue hallado en los registros del GDS. Esto podría demorar la gestión.</span>
              </div>
            )}
            {gdsStatus === "error" && (
              <div className="flex items-center space-x-3 text-gray-400 text-sm mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>No se pudo verificar el estado en el GDS en este momento.</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmitRefund} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-gray-300 font-semibold text-lg">Tipo de Solicitud</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setRequestType("anulacion")}
                  className={`relative flex items-center p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                    requestType === "anulacion"
                      ? "bg-[#00c7cc]/10 border-[#00c7cc] shadow-[0_0_15px_rgba(0,199,204,0.15)]"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${requestType === "anulacion" ? "border-[#00c7cc]" : "border-gray-500"}`}>
                      {requestType === "anulacion" && <div className="w-2.5 h-2.5 rounded-full bg-[#00c7cc]" />}
                    </div>
                    <span className={`font-semibold ${requestType === "anulacion" ? "text-white" : "text-gray-300"}`}>Anulación / Cancelación</span>
                  </div>
                </div>

                <div
                  onClick={() => setRequestType("reembolso")}
                  className={`relative flex items-center p-4 rounded-xl cursor-pointer border transition-all duration-300 ${
                    requestType === "reembolso"
                      ? "bg-[#00c7cc]/10 border-[#00c7cc] shadow-[0_0_15px_rgba(0,199,204,0.15)]"
                      : "bg-white/5 border-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${requestType === "reembolso" ? "border-[#00c7cc]" : "border-gray-500"}`}>
                      {requestType === "reembolso" && <div className="w-2.5 h-2.5 rounded-full bg-[#00c7cc]" />}
                    </div>
                    <span className={`font-semibold ${requestType === "reembolso" ? "text-white" : "text-gray-300"}`}>Reembolso (Transferencia)</span>
                  </div>
                </div>
              </div>
            </div>

            {requestType === "reembolso" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <h4 className="text-gray-300 font-semibold">Datos Bancarios para el Reembolso</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <Label htmlFor="bankName" className="text-gray-400 text-sm">Banco / Entidad</Label>
                    <Select value={bankName} onValueChange={setBankName} required={requestType === "reembolso"}>
                      <SelectTrigger id="bankName" className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-md h-10 px-3 focus:border-[#00c7cc] focus:ring-1 focus:ring-[#00c7cc] outline-none">
                        <SelectValue placeholder="Seleccionar banco..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] text-white border-white/10 max-h-60">
                        <SelectItem value="Banco Itaú Paraguay">Banco Itaú Paraguay</SelectItem>
                        <SelectItem value="Banco Continental">Banco Continental</SelectItem>
                        <SelectItem value="Sudameris Bank">Sudameris Bank</SelectItem>
                        <SelectItem value="ueno bank">ueno bank</SelectItem>
                        <SelectItem value="Banco GNB Paraguay">Banco GNB Paraguay</SelectItem>
                        <SelectItem value="Banco Basa">Banco Basa</SelectItem>
                        <SelectItem value="Banco Familiar">Banco Familiar</SelectItem>
                        <SelectItem value="Banco Nacional de Fomento (BNF)">Banco Nacional de Fomento (BNF)</SelectItem>
                        <SelectItem value="Banco Atlas">Banco Atlas</SelectItem>
                        <SelectItem value="Banco Río">Banco Río</SelectItem>
                        <SelectItem value="Interfisa Banco">Interfisa Banco</SelectItem>
                        <SelectItem value="Solar Banco">Solar Banco</SelectItem>
                        <SelectItem value="Financiera Finexpar / Zeta Banco">Financiera Finexpar / Zeta Banco</SelectItem>
                        <SelectItem value="Tigo Money / Billeteras">Tigo Money / Billeteras</SelectItem>
                        <SelectItem value="Otro">Otro / Otra Entidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accountType" className="text-gray-400 text-sm">Tipo de Cuenta</Label>
                    <Select value={accountType} onValueChange={setAccountType} required={requestType === "reembolso"}>
                      <SelectTrigger id="accountType" className="mt-1 w-full bg-black/20 border border-white/10 text-white rounded-md h-10 px-3 focus:border-[#00c7cc] focus:ring-1 focus:ring-[#00c7cc] outline-none">
                        <SelectValue placeholder="Seleccionar tipo..." />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] text-white border-white/10">
                        <SelectItem value="Ahorro">Caja de Ahorro</SelectItem>
                        <SelectItem value="Corriente">Cuenta Corriente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accountNumber" className="text-gray-400 text-sm">Nro. de Cuenta</Label>
                    <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required={requestType === "reembolso"} placeholder="Ej: 123456789" className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00c7cc]" />
                  </div>
                  <div>
                    <Label htmlFor="accountHolder" className="text-gray-400 text-sm">Nombre del Titular</Label>
                    <Input id="accountHolder" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required={requestType === "reembolso"} placeholder="Ej: Juan Pérez" className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00c7cc]" />
                  </div>
                  <div>
                    <Label htmlFor="holderDocument" className="text-gray-400 text-sm">Cédula / RUC del Titular</Label>
                    <Input id="holderDocument" value={holderDocument} onChange={(e) => setHolderDocument(e.target.value)} required={requestType === "reembolso"} placeholder="Ej: 1234567-8" className="mt-1 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus:border-[#00c7cc]" />
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
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#00c7cc] hover:bg-[#00a8ad] text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(0,199,204,0.3)] hover:shadow-[0_0_30px_rgba(0,199,204,0.5)] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    "Enviar Solicitud"
                  )}
                </Button>
          </form>
        </div>
      )}
    </div>
  );
}
