"use client";

import {
  AlertCircle,
  Check,
  FileText,
  Mail,
  Phone,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBookingStore, Passenger, Seat } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PassengerFormProps {
  /** Índice visual (1-based) que se muestra al usuario */
  passengerNumber: number;
  /** Índice del pasajero de IDA en passengerDetails[] */
  outboundIndex: number;
  /** Índice del pasajero de VUELTA en passengerDetails[] (-1 si no aplica) */
  returnIndex: number;
  /** Número de asiento de ida */
  seatNumber: string;
  /** Número de asiento de vuelta (si aplica) */
  returnSeatNumber?: string;
  /** Delay de animación en ms */
  animationDelay?: number;
}

// ── Validaciones ────────────────────────────────────────────────────────────

function validateDocument(doc: string): boolean {
  const clean = doc.replace(/[.-]/g, "").toUpperCase();
  if (clean.length < 6 || clean.length > 12) return false;
  if (clean.includes("-")) {
    const [ruc, dv] = clean.split("-");
    if (!/^\d+$/.test(ruc) || ruc.length < 6 || ruc.length > 9) return false;
    if (!/^[\dK]$/.test(dv)) return false;
    return true;
  }
  return /^\d{6,9}$/.test(clean);
}

function formatDocument(doc: string): string {
  const clean = doc.replace(/[^0-9kK-]/g, "");
  if (clean.includes("-")) {
    const parts = clean.split("-");
    if (parts.length === 2) {
      const [ruc, dv] = parts;
      return `${ruc.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
    }
  }
  if (clean.length > 6) {
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    if (body.length > 0) {
      return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
    }
  }
  return clean;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, "");
  return clean.length >= 9 && clean.length <= 12;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

// ── Componente ───────────────────────────────────────────────────────────────

export function PassengerForm({
  passengerNumber,
  outboundIndex,
  returnIndex,
  seatNumber,
  returnSeatNumber,
  animationDelay = 0,
}: PassengerFormProps) {
  const { passengerDetails, updatePassenger } = useBookingStore();
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [showDocHelp, setShowDocHelp] = useState(false);

  const passenger = passengerDetails[outboundIndex];

  // Si aún no se inicializó el store, no renderizar
  if (!passenger) return null;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const getError = (field: string, value: string) => {
    if (!touchedFields[field] && value === "") return null;
    switch (field) {
      case "firstName":
      case "lastName":
        return !validateName(value) ? "Mínimo 2 caracteres" : null;
      case "documentNumber":
        return !validateDocument(value) ? "Documento inválido" : null;
      case "email":
        return !validateEmail(value) ? "Email inválido" : null;
      case "phone":
        return !validatePhone(value) ? "Teléfono inválido (9-12 dígitos)" : null;
      default:
        return null;
    }
  };

  /** Actualiza el índice de IDA y, si existe, el de VUELTA simultáneamente */
  const handleUpdate = (field: keyof Passenger, value: string) => {
    updatePassenger(outboundIndex, { [field]: value });
    if (returnIndex !== -1) {
      updatePassenger(returnIndex, { [field]: value });
    }
  };

  const handleBlur = (field: string) => {
    markTouched(field);
  };

  // ── Validez global del formulario ─────────────────────────────────────────

  const firstNameError = getError("firstName", passenger.firstName);
  const lastNameError = getError("lastName", passenger.lastName);
  const documentError = getError("documentNumber", passenger.documentNumber);
  const emailError = getError("email", passenger.email);
  const phoneError = getError("phone", passenger.phone);

  const isComplete =
    !firstNameError &&
    !lastNameError &&
    !documentError &&
    !emailError &&
    !phoneError &&
    validateName(passenger.firstName) &&
    validateName(passenger.lastName) &&
    validateDocument(passenger.documentNumber) &&
    validateEmail(passenger.email) &&
    validatePhone(passenger.phone);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card
      className="p-4 sm:p-5 animate-fade-in relative overflow-hidden bg-background/5 backdrop-blur-sm border-background/20 w-full"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-background text-sm">
            Pasajero {passengerNumber}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-background/60 mt-0.5">
            <span className="flex items-center gap-1">
              <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-medium">
                Ida
              </span>
              Asiento {seatNumber}
            </span>
            {returnSeatNumber && (
              <span className="flex items-center gap-1">
                <span className="bg-secondary/20 text-secondary text-[10px] px-1.5 py-0.5 rounded uppercase font-medium">
                  Vuelta
                </span>
                Asiento {returnSeatNumber}
              </span>
            )}
          </div>
        </div>
        {isComplete && (
          <Badge
            variant="secondary"
            className="ml-auto bg-green-500/10 text-green-500 border-green-500/30 shrink-0 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Completo
          </Badge>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Nombre */}
        <FieldWrapper
          id={`firstName-${passengerNumber}`}
          label="Nombre"
          error={firstNameError}
          hasValue={!!passenger.firstName}
        >
          <Input
            id={`firstName-${passengerNumber}`}
            placeholder="Ingresa el nombre"
            value={passenger.firstName}
            onChange={(e) => handleUpdate("firstName", e.target.value)}
            onBlur={() => handleBlur("firstName")}
            className={cn(
              "h-11 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
              firstNameError && "border-destructive",
              !firstNameError && passenger.firstName && "border-green-500"
            )}
            data-error={!!firstNameError}
          />
          <FieldIcon hasError={!!firstNameError} hasValue={!!passenger.firstName} />
        </FieldWrapper>

        {/* Apellido */}
        <FieldWrapper
          id={`lastName-${passengerNumber}`}
          label="Apellido"
          error={lastNameError}
          hasValue={!!passenger.lastName}
        >
          <Input
            id={`lastName-${passengerNumber}`}
            placeholder="Ingresa el apellido"
            value={passenger.lastName}
            onChange={(e) => handleUpdate("lastName", e.target.value)}
            onBlur={() => handleBlur("lastName")}
            className={cn(
              "h-11 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
              lastNameError && "border-destructive",
              !lastNameError && passenger.lastName && "border-green-500"
            )}
            data-error={!!lastNameError}
          />
          <FieldIcon hasError={!!lastNameError} hasValue={!!passenger.lastName} />
        </FieldWrapper>

        {/* Cédula / RUC */}
        <FieldWrapper
          id={`document-${passengerNumber}`}
          label="Cédula / RUC"
          error={documentError}
          hasValue={!!passenger.documentNumber}
          labelExtra={
            passengerNumber === 1 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[10px] text-background/60 hover:text-background hover:bg-background/20 shrink-0"
                      onClick={() => setShowDocHelp((v) => !v)}
                    >
                      <AlertCircle className="h-3 w-3 mr-0.5" />
                      Formato
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/95 backdrop-blur-sm border-background/20 text-xs">
                    <p>Cédula: 4.123.456</p>
                    <p>RUC: 80.012.345-0</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null
          }
        >
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 shrink-0" />
          <Input
            id={`document-${passengerNumber}`}
            placeholder="4.123.456 o 80.012.345-0"
            value={passenger.documentNumber}
            onChange={(e) =>
              handleUpdate("documentNumber", formatDocument(e.target.value))
            }
            onBlur={() => handleBlur("documentNumber")}
            className={cn(
              "h-11 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
              documentError && "border-destructive",
              !documentError && passenger.documentNumber && "border-green-500"
            )}
            data-error={!!documentError}
          />
          <FieldIcon
            hasError={!!documentError}
            hasValue={!!passenger.documentNumber}
          />
        </FieldWrapper>

        {/* Teléfono */}
        <FieldWrapper
          id={`phone-${passengerNumber}`}
          label="Teléfono"
          error={phoneError}
          hasValue={!!passenger.phone}
          hint={
            !phoneError && passenger.phone
              ? "Formato: 0981 123 456"
              : undefined
          }
        >
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 shrink-0" />
          <Input
            id={`phone-${passengerNumber}`}
            placeholder="0981 123 456"
            value={passenger.phone}
            onChange={(e) => handleUpdate("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            className={cn(
              "h-11 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
              phoneError && "border-destructive",
              !phoneError && passenger.phone && "border-green-500"
            )}
            data-error={!!phoneError}
          />
          <FieldIcon hasError={!!phoneError} hasValue={!!passenger.phone} />
        </FieldWrapper>

        {/* Email (full width) */}
        <FieldWrapper
          id={`email-${passengerNumber}`}
          label="Correo Electrónico"
          error={emailError}
          hasValue={!!passenger.email}
          className="sm:col-span-2"
          hint={
            passengerNumber === 1 && !emailError
              ? "El boleto electrónico será enviado aquí"
              : undefined
          }
        >
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 shrink-0" />
          <Input
            id={`email-${passengerNumber}`}
            type="email"
            placeholder="correo@ejemplo.com"
            value={passenger.email}
            onChange={(e) => handleUpdate("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={cn(
              "h-11 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
              emailError && "border-destructive",
              !emailError && passenger.email && "border-green-500"
            )}
            data-error={!!emailError}
          />
          <FieldIcon hasError={!!emailError} hasValue={!!passenger.email} />
        </FieldWrapper>
      </div>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldWrapper({
  id,
  label,
  error,
  hasValue,
  hint,
  labelExtra,
  className,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  hasValue: boolean;
  hint?: string;
  labelExtra?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-background text-sm">
          {label}
          <span className="text-destructive ml-1">*</span>
        </Label>
        {labelExtra}
      </div>
      <div className="relative">{children}</div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </p>
      )}
      {!error && hint && (
        <p className="text-xs text-background/60 truncate">{hint}</p>
      )}
    </div>
  );
}

function FieldIcon({
  hasError,
  hasValue,
}: {
  hasError: boolean;
  hasValue: boolean;
}) {
  if (!hasValue) return null;
  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
      {hasError ? (
        <X className="h-4 w-4 text-destructive" />
      ) : (
        <Check className="h-4 w-4 text-green-500" />
      )}
    </div>
  );
}
