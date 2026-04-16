"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingStore, Passenger } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface PassengerFormProps {
  passengerNumber: number;
  outboundIndex: number;
  returnIndex: number;
  seatNumber: string;
  returnSeatNumber?: string;
  animationDelay?: number;
}

type DocType = "D" | "R" | "P";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "D", label: "Cédula" },
  { value: "R", label: "RUC" },
  { value: "P", label: "Pasaporte" },
];

// ── Validaciones ──────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 9;
}

function validateName(name: string): boolean {
  return name.trim().length >= 2;
}

// ── Componente ────────────────────────────────────────────────────────────────

export function PassengerForm({
  passengerNumber,
  outboundIndex,
  returnIndex,
  seatNumber,
  returnSeatNumber,
  animationDelay = 0,
}: PassengerFormProps) {
  const { passengerDetails, updatePassenger } = useBookingStore();

  // Estado de búsqueda
  const [docType, setDocType] = useState<DocType>("D");
  const [docNumber, setDocNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "found" | "not_found" | "created" | "error"
  >("idle");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Estado de campos adicionales (solo visibles tras búsqueda)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const passenger = passengerDetails[outboundIndex];
  if (!passenger) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const markTouched = (field: string) =>
    setTouchedFields((prev) => ({ ...prev, [field]: true }));

  const getError = (field: string, value: string): string | null => {
    if (!touchedFields[field] && value === "") return null;
    switch (field) {
      case "firstName":
      case "lastName":
        return !validateName(value) ? "Mínimo 2 caracteres" : null;
      case "email":
        return !validateEmail(value) ? "Email inválido" : null;
      case "phone":
        return !validatePhone(value) ? "Teléfono inválido (mín. 9 dígitos)" : null;
      default:
        return null;
    }
  };

  /** Actualiza IDA y (si existe) VUELTA simultáneamente */
  const handleUpdate = (field: keyof Passenger, value: string) => {
    updatePassenger(outboundIndex, { [field]: value });
    if (returnIndex !== -1) updatePassenger(returnIndex, { [field]: value });
  };

  /** Aplica datos encontrados/creados al store */
  const applyPassengerData = (data: {
    firstName: string;
    lastName: string;
    phone: string;
    docNumber: string;
  }) => {
    handleUpdate("firstName", data.firstName);
    handleUpdate("lastName", data.lastName);
    handleUpdate("phone", data.phone);
    handleUpdate("documentNumber", data.docNumber);
    // Marcar todos como tocados para mostrar validación inmediata
    setTouchedFields({ firstName: true, lastName: true, phone: true, email: true });
  };

  // ── Búsqueda de pasajero ──────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!docNumber.trim()) return;
    setIsSearching(true);
    setSearchStatus("idle");
    setSearchError(null);

    try {
      const res = await fetch("/api/gds/passenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType, docNumber: docNumber.replace(/[.\-\s]/g, "") }),
      });

      const json = await res.json();

      if (json.success && json.data?.passenger) {
        const p = json.data.passenger;
        applyPassengerData({
          firstName: toTitleCase(p.PasNom || ""),
          lastName: toTitleCase(p.PasApe || ""),
          phone: p.Telefono || "",
          docNumber: p.DocNro || docNumber,
        });
        setSearchStatus("found");
      } else {
        // Pasajero no existe → dejar campos en blanco para que ingrese
        setSearchStatus("not_found");
      }
    } catch {
      setSearchError("Error de conexión al buscar pasajero");
      setSearchStatus("error");
    } finally {
      setIsSearching(false);
    }
  };

  // ── Creación de pasajero ──────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!passenger.firstName || !passenger.lastName) return;
    setIsCreating(true);
    setSearchError(null);

    try {
      const res = await fetch("/api/gds/passenger/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          docNumber: docNumber.replace(/[.\-\s]/g, ""),
          lastName: passenger.lastName,
          name: passenger.firstName,
          phone: passenger.phone,
        }),
      });

      const json = await res.json();

      if (json.success || json.data?.success) {
        setSearchStatus("created");
      } else {
        setSearchError(json.error || json.data?.error || "Error al registrar pasajero");
        setSearchStatus("error");
      }
    } catch {
      setSearchError("Error de conexión al registrar pasajero");
      setSearchStatus("error");
    } finally {
      setIsCreating(false);
    }
  };

  // ── Validez global ────────────────────────────────────────────────────────

  const firstNameError = getError("firstName", passenger.firstName);
  const lastNameError = getError("lastName", passenger.lastName);
  const emailError = getError("email", passenger.email);
  const phoneError = getError("phone", passenger.phone);

  const isPassengerReady =
    (searchStatus === "found" || searchStatus === "created") &&
    validateName(passenger.firstName) &&
    validateName(passenger.lastName) &&
    validateEmail(passenger.email) &&
    validatePhone(passenger.phone);

  const showFields = searchStatus !== "idle";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Card
      className="p-4 sm:p-5 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20 w-full"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
          {isPassengerReady ? (
            <UserCheck className="h-4 w-4 text-green-500" />
          ) : (
            <User className="h-4 w-4 text-primary" />
          )}
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
        {isPassengerReady && (
          <Badge
            variant="secondary"
            className="ml-auto bg-green-500/10 text-green-500 border-green-500/30 shrink-0 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            Listo
          </Badge>
        )}
      </div>

      {/* ── Búsqueda por documento ── */}
      <div className="space-y-3">
        <div className="flex gap-2">
          {/* DocType selector */}
          <div className="relative shrink-0">
            <select
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value as DocType);
                setSearchStatus("idle");
                setDocNumber("");
                handleUpdate("documentNumber", "");
                handleUpdate("firstName", "");
                handleUpdate("lastName", "");
                handleUpdate("phone", "");
              }}
              className="h-11 pl-3 pr-8 rounded-md bg-background/10 border border-background/30 text-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value} className="bg-[#1a2332] text-white">
                  {d.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 pointer-events-none" />
          </div>

          {/* DocNumber input */}
          <div className="relative flex-1">
            <Input
              placeholder={
                docType === "D" ? "N° de cédula" : docType === "R" ? "N° de RUC" : "N° de pasaporte"
              }
              value={docNumber}
              onChange={(e) => {
                setDocNumber(e.target.value);
                setSearchStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="h-11 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40"
              disabled={isSearching}
            />
            {docNumber && (
              <button
                type="button"
                onClick={() => {
                  setDocNumber("");
                  setSearchStatus("idle");
                  handleUpdate("documentNumber", "");
                  handleUpdate("firstName", "");
                  handleUpdate("lastName", "");
                  handleUpdate("phone", "");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-background/40 hover:text-background"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Buscar button */}
          <Button
            type="button"
            onClick={handleSearch}
            disabled={!docNumber.trim() || isSearching}
            className="h-11 px-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shrink-0"
            variant="outline"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status banner */}
        {searchStatus === "found" && (
          <StatusBanner
            type="success"
            message={`Pasajero encontrado: ${passenger.firstName} ${passenger.lastName}`}
          />
        )}
        {searchStatus === "created" && (
          <StatusBanner type="success" message="Pasajero registrado correctamente" />
        )}
        {searchStatus === "not_found" && (
          <StatusBanner
            type="info"
            message="Pasajero no encontrado. Completa los datos para registrarlo."
          />
        )}
        {searchStatus === "error" && searchError && (
          <StatusBanner type="error" message={searchError} />
        )}

        {/* ── Campos adicionales (solo visibles tras búsqueda) ── */}
        {showFields && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Nombre */}
              <FieldWrapper
                id={`firstName-${passengerNumber}`}
                label="Nombre"
                error={firstNameError}
                hasValue={!!passenger.firstName}
                readOnly={searchStatus === "found" || searchStatus === "created"}
              >
                <Input
                  id={`firstName-${passengerNumber}`}
                  placeholder="Nombre"
                  value={passenger.firstName}
                  onChange={(e) => handleUpdate("firstName", e.target.value)}
                  onBlur={() => markTouched("firstName")}
                  readOnly={searchStatus === "found" || searchStatus === "created"}
                  className={cn(
                    "h-11 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                    firstNameError && "border-destructive",
                    !firstNameError && passenger.firstName && "border-green-500",
                    (searchStatus === "found" || searchStatus === "created") &&
                      "opacity-80 cursor-default",
                  )}
                />
                <FieldIcon hasError={!!firstNameError} hasValue={!!passenger.firstName} />
              </FieldWrapper>

              {/* Apellido */}
              <FieldWrapper
                id={`lastName-${passengerNumber}`}
                label="Apellido"
                error={lastNameError}
                hasValue={!!passenger.lastName}
                readOnly={searchStatus === "found" || searchStatus === "created"}
              >
                <Input
                  id={`lastName-${passengerNumber}`}
                  placeholder="Apellido"
                  value={passenger.lastName}
                  onChange={(e) => handleUpdate("lastName", e.target.value)}
                  onBlur={() => markTouched("lastName")}
                  readOnly={searchStatus === "found" || searchStatus === "created"}
                  className={cn(
                    "h-11 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                    lastNameError && "border-destructive",
                    !lastNameError && passenger.lastName && "border-green-500",
                    (searchStatus === "found" || searchStatus === "created") &&
                      "opacity-80 cursor-default",
                  )}
                />
                <FieldIcon hasError={!!lastNameError} hasValue={!!passenger.lastName} />
              </FieldWrapper>

              {/* Teléfono */}
              <FieldWrapper
                id={`phone-${passengerNumber}`}
                label="Teléfono"
                error={phoneError}
                hasValue={!!passenger.phone}
              >
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 shrink-0" />
                <Input
                  id={`phone-${passengerNumber}`}
                  placeholder="0981 123 456"
                  value={passenger.phone}
                  onChange={(e) => handleUpdate("phone", e.target.value)}
                  onBlur={() => markTouched("phone")}
                  className={cn(
                    "h-11 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                    phoneError && "border-destructive",
                    !phoneError && passenger.phone && "border-green-500",
                  )}
                />
                <FieldIcon hasError={!!phoneError} hasValue={!!passenger.phone} />
              </FieldWrapper>

              {/* Email (full width) */}
              <FieldWrapper
                id={`email-${passengerNumber}`}
                label="Correo Electrónico"
                error={emailError}
                hasValue={!!passenger.email}
                hint={passengerNumber === 1 ? "El boleto se enviará aquí" : undefined}
                className="sm:col-span-2"
              >
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-background/60 shrink-0" />
                <Input
                  id={`email-${passengerNumber}`}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={passenger.email}
                  onChange={(e) => handleUpdate("email", e.target.value)}
                  onBlur={() => markTouched("email")}
                  className={cn(
                    "h-11 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                    emailError && "border-destructive",
                    !emailError && passenger.email && "border-green-500",
                  )}
                />
                <FieldIcon hasError={!!emailError} hasValue={!!passenger.email} />
              </FieldWrapper>
            </div>

            {/* Botón registrar — solo si no se encontró aún */}
            {searchStatus === "not_found" && (
              <Button
                type="button"
                onClick={handleCreate}
                disabled={
                  isCreating ||
                  !validateName(passenger.firstName) ||
                  !validateName(passenger.lastName)
                }
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando pasajero...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Registrar pasajero
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBanner({
  type,
  message,
}: {
  type: "success" | "info" | "error";
  message: string;
}) {
  const styles = {
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    info: "bg-primary/10 border-primary/30 text-primary",
    error: "bg-destructive/10 border-destructive/30 text-destructive",
  };
  const Icon =
    type === "success" ? Check : type === "error" ? AlertCircle : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs px-3 py-2 rounded-lg border animate-fade-in",
        styles[type],
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function FieldWrapper({
  id,
  label,
  error,
  hasValue,
  hint,
  className,
  readOnly,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  hasValue: boolean;
  hint?: string;
  className?: string;
  readOnly?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      <Label htmlFor={id} className="text-background text-sm">
        {label}
        {!readOnly && <span className="text-destructive ml-1">*</span>}
      </Label>
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

function FieldIcon({ hasError, hasValue }: { hasError: boolean; hasValue: boolean }) {
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

// ── Utils ─────────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
