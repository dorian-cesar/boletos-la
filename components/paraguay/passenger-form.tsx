"use client";

import {
  AlertCircle,
  Check,
  ChevronDown,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
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
import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// ── Tipos de documento ────────────────────────────────────────────────────────

interface DocTypeItem {
  Codigo: string;
  Descripcion: string;
}

const FALLBACK_DOC_TYPES: DocTypeItem[] = [
  { Codigo: "C", Descripcion: "C.I. Paraguaya" },
  { Codigo: "D", Descripcion: "D.N.I." },
  { Codigo: "P", Descripcion: "Pasaporte" },
  { Codigo: "R", Descripcion: "RUC" },
];

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface PassengerFormProps {
  passengerNumber: number;
  outboundIndex: number;
  returnIndex: number;
  seatNumber: string;
  returnSeatNumber?: string;
  animationDelay?: number;
}

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

/** El GDS a veces devuelve un objeto pasajero "vacío" cuando no existe.
 *  Se detecta por HD_ID=="0" o por nombres con el marcador XML de espacio vacío. */
function isEmptyPassenger(p: Record<string, string>): boolean {
  const XML_EMPTY = '{"xml:space":"preserve"}';
  return (
    p.HD_ID === "0" ||
    p.PasNom === XML_EMPTY ||
    p.PasApe === XML_EMPTY ||
    (!p.PasNom?.trim() && !p.PasApe?.trim())
  );
}

function sanitizeGdsValue(val: any): string {
  if (!val) return "";
  if (typeof val === "object") return "";
  if (typeof val === "string" && val.includes("xml:space")) return "";
  return String(val).trim();
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

  // Doc types dinámicos
  const [docTypes, setDocTypes] = useState<DocTypeItem[]>(FALLBACK_DOC_TYPES);
  const [loadingDocTypes, setLoadingDocTypes] = useState(true);

  // Países dinámicos
  const [countries, setCountries] = useState<
    { id: string; Codigo: string; Descripcion: string }[]
  >([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Combobox toggles
  const [nationalityOpen, setNationalityOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/gds/doc-types")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.docTypes?.length) {
          setDocTypes(json.data.docTypes);
        }
      })
      .catch(() => {
        /* usa fallback */
      })
      .finally(() => setLoadingDocTypes(false));

    fetch("/api/gds/countries")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.countries?.length) {
          setCountries(json.data.countries);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCountries(false));
  }, []);

  // Estado de búsqueda
  const [docType, setDocType] = useState("C"); // C.I. Paraguaya por defecto
  const [docNumber, setDocNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchStatus, setSearchStatus] = useState<
    "idle" | "found" | "not_found" | "created" | "error"
  >("idle");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Estado de campos adicionales (solo visibles tras búsqueda)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [isEditing, setIsEditing] = useState(false);

  const passenger = passengerDetails[outboundIndex];

  // Estado local para inputs de texto (previene re-renders lentos en cada tecla)
  const [localData, setLocalData] = useState({
    firstName: passenger?.firstName || "",
    lastName: passenger?.lastName || "",
    phone: passenger?.phone || "",
    email: passenger?.email || "",
    occupation: passenger?.occupation || "",
    birthDate: passenger?.birthDate || "",
  });

  // Sincronizar el estado local si el estado global cambia (ej. al buscar un pasajero)
  useEffect(() => {
    setLocalData({
      firstName: passenger?.firstName || "",
      lastName: passenger?.lastName || "",
      phone: passenger?.phone || "",
      email: passenger?.email || "",
      occupation: passenger?.occupation || "",
      birthDate: passenger?.birthDate || "",
    });
  }, [
    passenger?.firstName,
    passenger?.lastName,
    passenger?.phone,
    passenger?.email,
    passenger?.occupation,
    passenger?.birthDate,
  ]);

  if (!passenger) return null;

  const handleLocalChange = (field: keyof typeof localData, value: string) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalBlur = (field: keyof typeof localData, value: string) => {
    handleUpdate(field as any, value);
    markTouched(field);
  };

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
        return !validatePhone(value)
          ? "Teléfono inválido (mín. 9 dígitos)"
          : null;
      default:
        return null;
    }
  };

  /** Actualiza IDA y (si existe) VUELTA simultáneamente */
  const handleUpdate = (
    field: keyof Passenger,
    value: string | { codigo: string; nombre: string },
  ) => {
    updatePassenger(outboundIndex, { [field]: value } as Partial<Passenger>);
    if (returnIndex !== -1)
      updatePassenger(returnIndex, { [field]: value } as Partial<Passenger>);
  };

  /** Helper para guardar el docType seleccionado en el store */
  const saveDocType = (codigo: string) => {
    const found = docTypes.find((d) => d.Codigo === codigo);
    handleUpdate("docType", { codigo, nombre: found?.Descripcion ?? codigo });
  };

  /** Aplica datos encontrados/creados al store */
  const applyPassengerData = (data: {
    firstName: string;
    lastName: string;
    phone: string;
    docNumber: string;
    occupation: string;
    birthDate: string;
    gender: string;
    nationality: string;
    country: string;
  }) => {
    handleUpdate("firstName", data.firstName);
    handleUpdate("lastName", data.lastName);
    handleUpdate("phone", data.phone);
    handleUpdate("documentNumber", data.docNumber);
    handleUpdate("occupation", data.occupation);
    handleUpdate("birthDate", data.birthDate);
    handleUpdate("gender", data.gender);
    handleUpdate("nationality", data.nationality);
    handleUpdate("country", data.country);

    // Guardar el docType actual seleccionado
    saveDocType(docType);
    // Marcar todos como tocados para mostrar validación inmediata
    setTouchedFields({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    });
  };

  /** Limpia datos cuando no se encuentra al pasajero */
  const clearPassengerData = () => {
    handleUpdate("firstName", "");
    handleUpdate("lastName", "");
    handleUpdate("phone", "");
    handleUpdate("email", "");
    handleUpdate("occupation", "");
    handleUpdate("birthDate", "");
    handleUpdate("gender", "");
    handleUpdate("nationality", "");
    handleUpdate("country", "");
    handleUpdate("documentNumber", docNumber);
    saveDocType(docType);

    setLocalData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      occupation: "",
      birthDate: "",
    });
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
        body: JSON.stringify({
          docType,
          docNumber: docNumber.replace(/[.\-\s]/g, ""),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // Error HTTP del proxy (autenticación, red, etc.)
        setSearchError(json.error || "Error al buscar pasajero");
        setSearchStatus("error");
      } else if (json.success && json.data?.passenger) {
        const p = json.data.passenger;
        if (isEmptyPassenger(p)) {
          // El GDS devuelve un objeto vacío cuando el pasajero no existe
          setSearchStatus("not_found");
          clearPassengerData();
        } else {
          // Pasajero encontrado con datos reales
          const birthDateRaw = p.FecNacimiento || p.FecNac || p.FchNac || p.FechaNac || p.birthDate || "";
          // Convert from YYYY/MM/DD to YYYY-MM-DD for the HTML date input
          const formattedBirthDate = birthDateRaw ? birthDateRaw.replace(/\//g, "-") : "";
          
          const rawNac = p.PasNac || p.Nacionalidad || p.nationality;
          const parsedNac = sanitizeGdsValue(rawNac);

          const rawCountry = p.PaisResidencia || p.Pais || p.country;
          const parsedCountry = sanitizeGdsValue(rawCountry);

          let parsedGender = sanitizeGdsValue(p.Sexo || p.Sex || p.gender);
          if (parsedGender && parsedGender.length > 1) {
            if (parsedGender.toUpperCase().startsWith("M")) parsedGender = "M";
            else if (parsedGender.toUpperCase().startsWith("F")) parsedGender = "F";
            else parsedGender = "N";
          }

          applyPassengerData({
            firstName: toTitleCase(sanitizeGdsValue(p.PasNom || p.name || p.firstName)),
            lastName: toTitleCase(sanitizeGdsValue(p.PasApe || p.lastName)),
            phone: sanitizeGdsValue(p.Telefono || p.phone),
            docNumber: sanitizeGdsValue(p.DocNro || p.docNumber) || docNumber,
            occupation: sanitizeGdsValue(p.Ocupacion || p.occupation),
            birthDate: formattedBirthDate,
            gender: parsedGender,
            nationality: parsedNac,
            country: parsedCountry,
          });
          setSearchStatus("found");
        }
      } else if (json.success && json.data?.passenger === null) {
        // Respuesta exitosa pero pasajero no registrado en el sistema
        setSearchStatus("not_found");
        clearPassengerData();
      } else {
        // Respuesta inesperada del backend
        setSearchError(json.error || "Respuesta inesperada del servidor");
        setSearchStatus("error");
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
          occupation: passenger.occupation || "EMPLEADO",
          birthDate: passenger.birthDate
            ? passenger.birthDate.replace(/-/g, "/")
            : "1991/06/08",
          gender: passenger.gender || "M",
          nationality: passenger.nationality || "PA",
          country: passenger.country || "PA",
        }),
      });

      const json = await res.json();

      if (json.success || json.data?.success) {
        setSearchStatus("created");
      } else {
        setSearchError(
          json.error || json.data?.error || "Error al registrar pasajero",
        );
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
      className="p-3 sm:p-5 animate-fade-in bg-black/5 dark:bg-white/5 backdrop-blur-sm border-black/10 dark:border-white/20 w-full"
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
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Pasajero {passengerNumber}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-slate-900 dark:text-white/60 mt-0.5">
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
        <div className="flex flex-col sm:flex-row gap-2">
          {/* DocType selector */}
          <div className="relative w-full sm:w-auto sm:shrink-0">
            <select
              value={docType}
              onChange={(e) => {
                const codigo = e.target.value;
                setDocType(codigo);
                saveDocType(codigo);
                setSearchStatus("idle");
                setDocNumber("");
                handleUpdate("documentNumber", "");
                handleUpdate("firstName", "");
                handleUpdate("lastName", "");
                handleUpdate("phone", "");
              }}
              disabled={loadingDocTypes}
              className="h-11 pl-3 pr-8 rounded-md bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/30 text-slate-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 w-full"
            >
              {loadingDocTypes ? (
                <option value="">Cargando...</option>
              ) : (
                docTypes.map((d) => (
                  <option
                    key={d.Codigo}
                    value={d.Codigo}
                    className="bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white"
                  >
                    {d.Descripcion}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-white/60 pointer-events-none" />
          </div>

          {/* DocNumber input */}
          <div className="relative flex-1 w-full sm:w-auto">
            <Input
              placeholder="N° de documento"
              value={docNumber}
              onChange={(e) => {
                setDocNumber(e.target.value);
                setSearchStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="h-11 pr-10 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full"
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 dark:text-white/40 hover:text-slate-900 dark:text-white"
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
            className="h-11 px-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 w-full sm:w-auto sm:shrink-0"
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
        {(searchStatus === "found" || searchStatus === "created") && (
          <div className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg border border-green-500/30 bg-green-500/10 animate-fade-in">
            <span className="flex items-center gap-1.5 text-green-400">
              <Check className="h-3.5 w-3.5 shrink-0" />
              {searchStatus === "created"
                ? "Pasajero registrado correctamente:"
                : "Pasajero encontrado:"}{" "}
              {passenger.firstName} {passenger.lastName}
            </span>
            {isEditing ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await handleCreate();
                  setIsEditing(false);
                }}
                disabled={isCreating}
                className="h-6 px-2 text-[11px] text-green-400 hover:text-green-300 hover:bg-green-500/10 shrink-0"
              >
                {isCreating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Guardar
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 text-[11px] text-green-400 hover:text-green-300 hover:bg-green-500/10 shrink-0"
              >
                <Pencil className="h-3 w-3 mr-1" />
                Editar
              </Button>
            )}
          </div>
        )}
        {searchStatus === "not_found" && (
          <StatusBanner
            type="info"
            message="Pasajero no encontrado. Completá los datos para registrarlo."
          />
        )}
        {searchStatus === "error" && searchError && (
          <StatusBanner type="error" message={searchError} />
        )}

        {/* ── Campos adicionales (solo visibles tras búsqueda) ── */}
        {showFields && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              {/* Nombre */}
              <FieldWrapper
                id={`firstName-${passengerNumber}`}
                label="Nombre"
                error={firstNameError}
                hasValue={!!passenger.firstName}
              >
                <Input
                  id={`firstName-${passengerNumber}`}
                  placeholder="Nombre"
                  value={localData.firstName}
                  onChange={(e) =>
                    handleLocalChange("firstName", e.target.value)
                  }
                  onBlur={(e) => handleLocalBlur("firstName", e.target.value)}
                  className={cn(
                    "h-11 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full",
                    firstNameError && "border-destructive",
                    !firstNameError &&
                      localData.firstName &&
                      "border-green-500",
                  )}
                />
                <FieldIcon
                  hasError={!!firstNameError}
                  hasValue={!!passenger.firstName}
                />
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
                  placeholder="Apellido"
                  value={localData.lastName}
                  onChange={(e) =>
                    handleLocalChange("lastName", e.target.value)
                  }
                  onBlur={(e) => handleLocalBlur("lastName", e.target.value)}
                  className={cn(
                    "h-11 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full",
                    lastNameError && "border-destructive",
                    !lastNameError && localData.lastName && "border-green-500",
                  )}
                />
                <FieldIcon
                  hasError={!!lastNameError}
                  hasValue={!!passenger.lastName}
                />
              </FieldWrapper>

              {/* Teléfono */}
              <FieldWrapper
                id={`phone-${passengerNumber}`}
                label="Teléfono"
                error={phoneError}
                hasValue={!!passenger.phone}
              >
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-white/60 shrink-0" />
                <Input
                  id={`phone-${passengerNumber}`}
                  placeholder="0981 123 456"
                  value={localData.phone}
                  onChange={(e) => handleLocalChange("phone", e.target.value)}
                  onBlur={(e) => handleLocalBlur("phone", e.target.value)}
                  className={cn(
                    "h-11 pl-10 pr-10 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full",
                    phoneError && "border-destructive",
                    !phoneError && localData.phone && "border-green-500",
                  )}
                />
                <FieldIcon
                  hasError={!!phoneError}
                  hasValue={!!passenger.phone}
                />
              </FieldWrapper>

              {/* Email (full width) */}
              <FieldWrapper
                id={`email-${passengerNumber}`}
                label="Correo Electrónico"
                error={emailError}
                hasValue={!!passenger.email}
                hint={
                  passengerNumber === 1
                    ? "El boleto se enviará aquí"
                    : undefined
                }
                className="sm:col-span-2"
              >
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-white/60 shrink-0" />
                <Input
                  id={`email-${passengerNumber}`}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={localData.email}
                  onChange={(e) => handleLocalChange("email", e.target.value)}
                  onBlur={(e) => handleLocalBlur("email", e.target.value)}
                  className={cn(
                    "h-11 pl-10 pr-10 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full",
                    emailError && "border-destructive",
                    !emailError && localData.email && "border-green-500",
                  )}
                />
                <FieldIcon
                  hasError={!!emailError}
                  hasValue={!!passenger.email}
                />
              </FieldWrapper>

              {/* Ocupación */}
              <FieldWrapper
                id={`occupation-${passengerNumber}`}
                label="Ocupación / Profesión"
                error={null}
                hasValue={!!passenger.occupation}
              >
                <Input
                  id={`occupation-${passengerNumber}`}
                  placeholder="Ej. Empleado"
                  value={localData.occupation}
                  onChange={(e) =>
                    handleLocalChange("occupation", e.target.value)
                  }
                  onBlur={(e) => handleLocalBlur("occupation", e.target.value)}
                  className="h-11 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full"
                />
              </FieldWrapper>

              {/* Fecha de Nacimiento */}
              <FieldWrapper
                id={`birthDate-${passengerNumber}`}
                label="Fecha de Nacimiento"
                error={null}
                hasValue={!!passenger.birthDate}
              >
                <Input
                  id={`birthDate-${passengerNumber}`}
                  type="date"
                  value={localData.birthDate}
                  onChange={(e) =>
                    handleLocalChange("birthDate", e.target.value)
                  }
                  onBlur={(e) => handleLocalBlur("birthDate", e.target.value)}
                  className="h-11 bg-black/10 dark:bg-white/10 border-black/15 dark:border-white/30 text-slate-900 dark:text-white placeholder:text-slate-900 dark:text-white/40 w-full max-w-full overflow-hidden [color-scheme:dark]"
                />
              </FieldWrapper>

              {/* Sexo */}
              <FieldWrapper
                id={`gender-${passengerNumber}`}
                label="Género"
                error={null}
                hasValue={!!passenger.gender}
              >
                <div className="relative w-full">
                  <select
                    value={passenger.gender}
                    onChange={(e) => handleUpdate("gender", e.target.value)}
                    className="h-11 pl-3 pr-8 rounded-md bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/30 text-slate-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 w-full"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white/50"
                    >
                      Elegí género
                    </option>
                    <option value="M" className="bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white">
                      Masculino
                    </option>
                    <option value="F" className="bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white">
                      Femenino
                    </option>
                    <option value="N" className="bg-white dark:bg-[#1a2332] text-slate-900 dark:text-white">
                      Prefiero no decir
                    </option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-white/60 pointer-events-none" />
                </div>
              </FieldWrapper>

              {/* Nacionalidad */}
              <FieldWrapper
                id={`nationality-${passengerNumber}`}
                label="Nacionalidad"
                error={null}
                hasValue={!!passenger.nationality}
              >
                <Popover
                  open={nationalityOpen}
                  onOpenChange={setNationalityOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={nationalityOpen}
                      className="w-full justify-between h-11 bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/30 text-slate-900 dark:text-white hover:bg-black/20 dark:bg-white/20 font-normal"
                    >
                      <span className="truncate">
                        {passenger.nationality
                          ? countries.find(
                              (c) => c.Codigo === passenger.nationality,
                            )?.Descripcion
                          : "Elegí Nacionalidad"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-[#1a2332] border border-black/10 dark:border-white/20"
                    align="start"
                  >
                    <Command className="bg-transparent">
                      <CommandInput
                        placeholder="Buscá nacionalidad..."
                        className="text-slate-900 dark:text-white border-black/10 dark:border-white/20 h-9"
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-slate-900 dark:text-white/60 p-4 text-sm text-center">
                          No encontrado.
                        </CommandEmpty>
                        <CommandGroup>
                          {countries.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.Descripcion}
                              onSelect={() => {
                                handleUpdate("nationality", c.Codigo);
                                setNationalityOpen(false);
                              }}
                              className="text-slate-900 dark:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  passenger.nationality === c.Codigo
                                    ? "opacity-100 text-primary"
                                    : "opacity-0",
                                )}
                              />
                              {c.Descripcion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FieldWrapper>

              {/* País */}
              <FieldWrapper
                id={`country-${passengerNumber}`}
                label="País de Residencia"
                error={null}
                hasValue={!!passenger.country}
              >
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between h-11 bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/30 text-slate-900 dark:text-white hover:bg-black/20 dark:bg-white/20 font-normal"
                    >
                      <span className="truncate">
                        {passenger.country
                          ? countries.find(
                              (c) => c.Codigo === passenger.country,
                            )?.Descripcion
                          : "Elegí País"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 bg-white dark:bg-[#1a2332] border border-black/10 dark:border-white/20"
                    align="start"
                  >
                    <Command className="bg-transparent">
                      <CommandInput
                        placeholder="Buscá país..."
                        className="text-slate-900 dark:text-white border-black/10 dark:border-white/20 h-9"
                      />
                      <CommandList className="max-h-[200px]">
                        <CommandEmpty className="text-slate-900 dark:text-white/60 p-4 text-sm text-center">
                          No encontrado.
                        </CommandEmpty>
                        <CommandGroup>
                          {countries.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.Descripcion}
                              onSelect={() => {
                                handleUpdate("country", c.Codigo);
                                setCountryOpen(false);
                              }}
                              className="text-slate-900 dark:text-white hover:bg-white/10 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  passenger.country === c.Codigo
                                    ? "opacity-100 text-primary"
                                    : "opacity-0",
                                )}
                              />
                              {c.Descripcion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FieldWrapper>
            </div>

            {/* Botón registrar — no encontrado; Botón guardar cambios — encontrado + editando */}
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
      <Label htmlFor={id} className="text-slate-900 dark:text-white text-sm">
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
        <p className="text-xs text-slate-900 dark:text-white/60 truncate">{hint}</p>
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

// ── Utils ─────────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
