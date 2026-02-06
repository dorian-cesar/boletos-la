// /booking/pagopar-redirect/pagopar-loading.tsx
import { Loader2 } from "lucide-react";

export default function PagoparRedirectLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold mb-2">Cargando redirección...</h1>
        <p className="text-muted-foreground">
          Preparando la conexión con Pagopar
        </p>
      </div>
    </div>
  );
}
