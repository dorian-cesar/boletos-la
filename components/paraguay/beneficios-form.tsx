"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, UploadCloud, CheckCircle2, User, Mail, Phone, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Convenio {
  id: number;
  nombre: string;
  inscripcion: boolean;
  imagenes?: string[];
  fecha_inicio_inscripcion?: string;
  fecha_fin_inscripcion?: string;
}

interface FormData {
  rut: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  email: string;
  celular: string;
  convenio_id: string;
  region: string;
}

export function BeneficiosForm() {
  const router = useRouter();
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [isLoadingConvenios, setIsLoadingConvenios] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [imagenesState, setImagenesState] = useState<{ [key: string]: { base64: string; fileName: string } }>({});

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const selectedConvenioId = watch("convenio_id");
  const selectedConvenio = convenios.find(c => c.id.toString() === selectedConvenioId);
  const requiredImages = selectedConvenio?.imagenes && selectedConvenio.imagenes.length > 0 
    ? selectedConvenio.imagenes 
    : ["Foto del Carnet/Documento (Frente)"];

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const response = await fetch('/api/convenios?beneficio=true');
        
        if (response.ok) {
          const data = await response.json();
          // Solo mostrar los que tienen inscripción habilitada
          const activeConvenios = (data?.rows || data || []).filter((c: Convenio) => {
            if (!c.inscripcion) return false;
            const now = new Date();
            const start = c.fecha_inicio_inscripcion ? new Date(c.fecha_inicio_inscripcion) : null;
            const end = c.fecha_fin_inscripcion ? new Date(c.fecha_fin_inscripcion) : null;
            
            if (start && now < start) return false;
            if (end && now > end) return false;
            
            return true;
          });
          setConvenios(activeConvenios);
        }
      } catch (error) {
        console.error("Error fetching convenios:", error);
      } finally {
        setIsLoadingConvenios(false);
      }
    }
    fetchConvenios();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenesState(prev => ({
        ...prev,
        [imageKey]: {
          base64: reader.result as string,
          fileName: file.name
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormData) => {
    for (const imgLabel of requiredImages) {
      if (!imagenesState[imgLabel]?.base64) {
        toast.error(`Por favor adjunta una imagen para: ${imgLabel}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const imagenes: Record<string, string> = {};
      for (const imgLabel of requiredImages) {
        if (imagenesState[imgLabel]?.base64) {
          imagenes[imgLabel] = imagenesState[imgLabel].base64;
        }
      }

      const payload = {
        rut: data.rut,
        nombre: [data.nombre, data.apellido_paterno, data.apellido_materno].filter(Boolean).join(" "),
        correo: data.email,
        telefono: data.celular,
        direccion: data.region,
        convenio_id: Number(data.convenio_id),
        imagenes,
      };

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_CONVENIOS_URL || "https://backend-convenios-py.dev-wit.com/api";
      const apiKey = process.env.NEXT_PUBLIC_CONVENIOS_API_KEY || "";

      const response = await fetch(`${backendUrl}/beneficiarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        let errorMsg = err.message;
        
        // Handle specific VALIDATION_ERROR format with 'errors' array
        if (err.errors && Array.isArray(err.errors)) {
          errorMsg = err.errors.map((e: any) => `${e.campo?.replace('body.', '')}: ${e.mensaje}`).join(" | ");
        } else if (Array.isArray(err.message)) {
          errorMsg = err.message.join(", ");
        }

        throw new Error(errorMsg || "Error al enviar la inscripción. Verifica tus datos.");
      }

      setIsSuccess(true);
      reset();
      setImagenesState({});
      toast.success("¡Inscripción completada exitosamente!");
      
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Ocurrió un error al procesar tu inscripción");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-[#1a2332] rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 dark:border-slate-800 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          ¡Inscripción Exitosa!
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
          Tus datos han sido registrados correctamente en el beneficio. Pronto recibirás más información en tu correo electrónico.
        </p>
        <button
          onClick={() => router.push("/paraguay")}
          className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-[#1a2332] rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-800 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Formulario de Inscripción</h2>
        <p className="text-slate-500 dark:text-slate-400">Completa tus datos para acceder a los beneficios exclusivos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Beneficio Selection */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Selecciona el Beneficio *
          </label>
          <div className="relative">
            <Controller
              name="convenio_id"
              control={control}
              rules={{ required: "Debes seleccionar un beneficio" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingConvenios || convenios.length === 0}>
                  <SelectTrigger className="w-full pl-4 pr-10 py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {convenios.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {isLoadingConvenios && (
              <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-slate-400" />
            )}
          </div>
          {errors.convenio_id && <p className="text-red-500 text-sm mt-1">{errors.convenio_id.message}</p>}
          {!isLoadingConvenios && convenios.length === 0 && (
            <p className="text-amber-500 text-sm mt-2">No hay beneficios con inscripción activa en este momento.</p>
          )}
        </div>

        {/* RUT */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Documento de Identidad (RUT/CI) *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ej: 1234567-8"
              {...register("rut", { required: "El documento es obligatorio" })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          {errors.rut && <p className="text-red-500 text-sm">{errors.rut.message}</p>}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nombre *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Ej: Juan"
              {...register("nombre", { required: "El nombre es obligatorio" })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre.message}</p>}
        </div>

        {/* Apellido Paterno */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Apellido Paterno *
          </label>
          <input
            type="text"
            placeholder="Ej: Pérez"
            {...register("apellido_paterno", { required: "El apellido paterno es obligatorio" })}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {errors.apellido_paterno && <p className="text-red-500 text-sm">{errors.apellido_paterno.message}</p>}
        </div>

        {/* Apellido Materno */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Apellido Materno
          </label>
          <input
            type="text"
            placeholder="Ej: González"
            {...register("apellido_materno")}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Correo Electrónico *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              {...register("email", { 
                required: "El correo es obligatorio",
                pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" }
              })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        {/* Celular */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Celular *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="tel"
              placeholder="Ej: +595912345678"
              {...register("celular", { 
                required: "El celular es obligatorio",
                pattern: { value: /^\+?\d{8,15}$/, message: "Formato inválido (Ej: +595912345678 o 0912345678)" }
              })}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          {errors.celular && <p className="text-red-500 text-sm">{errors.celular.message}</p>}
        </div>

        {/* Región */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Región o Departamento *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400 z-10" />
            <Controller
              name="region"
              control={control}
              rules={{ required: "Selecciona tu región" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full pl-10 py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all">
                    <SelectValue placeholder="Selecciona tu región" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asunción">Asunción</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                    <SelectItem value="Alto Paraná">Alto Paraná</SelectItem>
                    <SelectItem value="Itapúa">Itapúa</SelectItem>
                    <SelectItem value="Otra">Otra</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.region && <p className="text-red-500 text-sm">{errors.region.message}</p>}
        </div>

        {/* Carga de Documentos Dinámicos */}
        <div className="md:col-span-2 space-y-6 mt-2">
          {requiredImages.map((imgLabel, idx) => (
            <div key={idx} className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {imgLabel} *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-xl hover:border-primary dark:hover:border-primary transition-colors cursor-pointer relative bg-slate-50 dark:bg-slate-900/30">
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <label className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>Sube un archivo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={(e) => handleFileChange(e, imgLabel)} 
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                  {imagenesState[imgLabel]?.fileName && (
                    <div className="mt-4 p-2 bg-primary/10 text-primary font-medium text-sm rounded-lg">
                      Archivo seleccionado: {imagenesState[imgLabel].fileName}
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, imgLabel)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="mt-10">
        <button
          type="submit"
          disabled={isSubmitting || isLoadingConvenios || convenios.length === 0}
          className="w-full flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Procesando Inscripción...
            </>
          ) : (
            "Completar Inscripción"
          )}
        </button>
      </div>
    </form>
  );
}
